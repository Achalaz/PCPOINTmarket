import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { isMongoActive } from '../config/db.js';
import { MongoUser, MongoProfile, MongoProduct, MongoOrder } from './mongoSchemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'local_db.json');

// Ensure local persistence data file exists
function ensureLocalFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initial = { users: [], profiles: [], products: [], orders: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
  }
}

function readLocalDB() {
  ensureLocalFile();
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content || '{}');
    return {
      users: parsed.users || [],
      profiles: parsed.profiles || [],
      products: parsed.products || [],
      orders: parsed.orders || [],
    };
  } catch (err) {
    console.error('Error reading local db:', err);
    return { users: [], profiles: [], products: [], orders: [] };
  }
}

function writeLocalDB(data) {
  ensureLocalFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export const dbAdapter = {
  // --- USER METHODS ---
  async findUserByEmail(email) {
    const normalized = (email || '').toLowerCase().trim();
    if (isMongoActive()) {
      return await MongoUser.findOne({ email: normalized }).lean();
    }
    const db = readLocalDB();
    return db.users.find((u) => u.email.toLowerCase() === normalized) || null;
  },

  async findUserById(id) {
    if (isMongoActive()) {
      return await MongoUser.findById(id).lean();
    }
    const db = readLocalDB();
    return db.users.find((u) => u._id === id || u.id === id) || null;
  },

  async createUser({ full_name, email, password_hash, role = 'authenticated', avatar = '/assets/u1.svg' }) {
    const normalized = email.toLowerCase().trim();
    if (isMongoActive()) {
      const user = await MongoUser.create({
        full_name,
        email: normalized,
        password_hash,
        role,
        avatar,
      });
      // Also create an initial Profile entity
      await MongoProfile.create({
        user_id: user._id,
        phone: '',
        shipping_address: {
          street: '',
          city: '',
          state: '',
          postal_code: '',
          country: 'Sri Lanka',
        },
        billing_address: {
          street: '',
          city: '',
          state: '',
          postal_code: '',
          country: 'Sri Lanka',
        },
        cart_items: [],
        merged_guest_items_count: 0,
      });
      return user.toObject();
    }

    // Local JSON fallback
    const db = readLocalDB();
    const _id = 'usr_' + crypto.randomBytes(8).toString('hex');
    const newUser = {
      _id,
      id: _id,
      full_name,
      email: normalized,
      password_hash,
      role,
      avatar,
      account_status: 'Active Member',
      created_at: new Date().toISOString(),
    };
    db.users.push(newUser);

    const newProfile = {
      _id: 'prof_' + crypto.randomBytes(8).toString('hex'),
      user_id: _id,
      phone: '',
      shipping_address: {
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'Sri Lanka',
      },
      billing_address: {
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'Sri Lanka',
      },
      cart_items: [],
      merged_guest_items_count: 0,
      updated_at: new Date().toISOString(),
    };
    db.profiles.push(newProfile);

    writeLocalDB(db);
    return newUser;
  },

  async updateUserPassword(id, newHash) {
    if (isMongoActive()) {
      return await MongoUser.findByIdAndUpdate(id, { password_hash: newHash }, { new: true }).lean();
    }
    const db = readLocalDB();
    const user = db.users.find((u) => u._id === id || u.id === id);
    if (user) {
      user.password_hash = newHash;
      writeLocalDB(db);
      return user;
    }
    return null;
  },

  async updateUserBasic(id, { full_name, avatar }) {
    if (isMongoActive()) {
      const update = {};
      if (full_name) update.full_name = full_name;
      if (avatar) update.avatar = avatar;
      return await MongoUser.findByIdAndUpdate(id, update, { new: true }).lean();
    }
    const db = readLocalDB();
    const user = db.users.find((u) => u._id === id || u.id === id);
    if (user) {
      if (full_name) user.full_name = full_name;
      if (avatar) user.avatar = avatar;
      writeLocalDB(db);
      return user;
    }
    return null;
  },

  // --- PROFILE METHODS ---
  async getProfileByUserId(userId) {
    if (isMongoActive()) {
      let prof = await MongoProfile.findOne({ user_id: userId }).lean();
      if (!prof) {
        prof = await MongoProfile.create({ user_id: userId });
        prof = prof.toObject();
      }
      return prof;
    }
    const db = readLocalDB();
    let prof = db.profiles.find((p) => p.user_id === userId);
    if (!prof) {
      prof = {
        _id: 'prof_' + crypto.randomBytes(8).toString('hex'),
        user_id: userId,
        phone: '',
        shipping_address: { street: '', city: '', state: '', postal_code: '', country: 'Sri Lanka' },
        billing_address: { street: '', city: '', state: '', postal_code: '', country: 'Sri Lanka' },
        cart_items: [],
        merged_guest_items_count: 0,
        updated_at: new Date().toISOString(),
      };
      db.profiles.push(prof);
      writeLocalDB(db);
    }
    return prof;
  },

  async updateProfile(userId, { phone, shipping_address, billing_address }) {
    if (isMongoActive()) {
      const updateData = { updated_at: new Date() };
      if (phone !== undefined) updateData.phone = phone;
      if (shipping_address) updateData.shipping_address = shipping_address;
      if (billing_address) updateData.billing_address = billing_address;

      return await MongoProfile.findOneAndUpdate(
        { user_id: userId },
        { $set: updateData },
        { new: true, upsert: true }
      ).lean();
    }

    const db = readLocalDB();
    let prof = db.profiles.find((p) => p.user_id === userId);
    if (!prof) {
      prof = {
        _id: 'prof_' + crypto.randomBytes(8).toString('hex'),
        user_id: userId,
        phone: '',
        shipping_address: {},
        billing_address: {},
        cart_items: [],
        merged_guest_items_count: 0,
      };
      db.profiles.push(prof);
    }
    if (phone !== undefined) prof.phone = phone;
    if (shipping_address) prof.shipping_address = { ...prof.shipping_address, ...shipping_address };
    if (billing_address) prof.billing_address = { ...prof.billing_address, ...billing_address };
    prof.updated_at = new Date().toISOString();
    writeLocalDB(db);
    return prof;
  },

  // --- CART PERSISTENCE & MERGE ---
  async syncCart(userId, guestItems = []) {
    if (isMongoActive()) {
      const prof = await MongoProfile.findOne({ user_id: userId });
      const existingItems = prof?.cart_items || [];

      // Merge items: add new or update quantity
      const mergedMap = new Map();
      existingItems.forEach((item) => mergedMap.set(item.id, { ...item }));
      guestItems.forEach((item) => {
        if (mergedMap.has(item.id)) {
          mergedMap.get(item.id).qty += (item.qty || 1);
        } else {
          mergedMap.set(item.id, { ...item });
        }
      });
      const mergedCart = Array.from(mergedMap.values());
      const mergedCount = guestItems.reduce((sum, item) => sum + (item.qty || 1), 0);

      const updated = await MongoProfile.findOneAndUpdate(
        { user_id: userId },
        {
          $set: {
            cart_items: mergedCart,
            merged_guest_items_count: mergedCount,
            updated_at: new Date(),
          },
        },
        { new: true, upsert: true }
      ).lean();
      return { cart: mergedCart, mergedCount, profile: updated };
    }

    const db = readLocalDB();
    let prof = db.profiles.find((p) => p.user_id === userId);
    if (!prof) {
      prof = {
        _id: 'prof_' + crypto.randomBytes(8).toString('hex'),
        user_id: userId,
        phone: '',
        shipping_address: {},
        billing_address: {},
        cart_items: [],
        merged_guest_items_count: 0,
      };
      db.profiles.push(prof);
    }

    const mergedMap = new Map();
    (prof.cart_items || []).forEach((item) => mergedMap.set(item.id, { ...item }));
    guestItems.forEach((item) => {
      if (mergedMap.has(item.id)) {
        mergedMap.get(item.id).qty += (item.qty || 1);
      } else {
        mergedMap.set(item.id, { ...item });
      }
    });

    prof.cart_items = Array.from(mergedMap.values());
    const mergedCount = guestItems.reduce((sum, item) => sum + (item.qty || 1), 0);
    prof.merged_guest_items_count = mergedCount;
    prof.updated_at = new Date().toISOString();
    writeLocalDB(db);
    return { cart: prof.cart_items, mergedCount, profile: prof };
  },

  // --- PRODUCT & INVENTORY METHODS ---
  async getAllProducts() {
    if (isMongoActive()) {
      return await MongoProduct.find({}).sort({ created_at: -1 }).lean();
    }
    const db = readLocalDB();
    return db.products || [];
  },

  async createProduct(productData) {
    if (isMongoActive()) {
      const prod = await MongoProduct.create(productData);
      return prod.toObject();
    }
    const db = readLocalDB();
    const id = productData.id || 'prod_' + crypto.randomBytes(6).toString('hex');
    const newProd = {
      _id: id,
      id,
      ...productData,
      stock: Number(productData.stock ?? 10),
      inStock: Number(productData.stock ?? 10) > 0,
      created_at: new Date().toISOString(),
    };
    db.products.unshift(newProd);
    writeLocalDB(db);
    return newProd;
  },

  async updateProduct(id, updateData) {
    if (isMongoActive()) {
      if (updateData.stock !== undefined) {
        updateData.inStock = Number(updateData.stock) > 0;
      }
      return await MongoProduct.findByIdAndUpdate(id, { $set: updateData }, { new: true }).lean();
    }
    const db = readLocalDB();
    const idx = db.products.findIndex((p) => p._id === id || p.id === id);
    if (idx !== -1) {
      db.products[idx] = { ...db.products[idx], ...updateData };
      if (updateData.stock !== undefined) {
        db.products[idx].inStock = Number(updateData.stock) > 0;
      }
      writeLocalDB(db);
      return db.products[idx];
    }
    return null;
  },

  async updateProductStock(id, newStock) {
    const stockNum = Math.max(0, Number(newStock));
    const inStock = stockNum > 0;
    if (isMongoActive()) {
      return await MongoProduct.findByIdAndUpdate(
        id,
        { $set: { stock: stockNum, inStock } },
        { new: true }
      ).lean();
    }
    const db = readLocalDB();
    const prod = db.products.find((p) => p._id === id || p.id === id);
    if (prod) {
      prod.stock = stockNum;
      prod.inStock = inStock;
      writeLocalDB(db);
      return prod;
    }
    return null;
  },

  async deleteProduct(id) {
    if (isMongoActive()) {
      const res = await MongoProduct.findByIdAndDelete(id);
      return !!res;
    }
    const db = readLocalDB();
    const initialLen = db.products.length;
    db.products = db.products.filter((p) => p._id !== id && p.id !== id);
    writeLocalDB(db);
    return db.products.length < initialLen;
  },

  async seedDefaultProducts(defaultProducts = []) {
    if (isMongoActive()) {
      const count = await MongoProduct.countDocuments();
      if (count === 0 && defaultProducts.length > 0) {
        await MongoProduct.insertMany(defaultProducts);
        console.log(`✓ Initialized ${defaultProducts.length} default products into MongoDB Atlas.`);
      }
      return;
    }
    const db = readLocalDB();
    if ((!db.products || db.products.length === 0) && defaultProducts.length > 0) {
      db.products = defaultProducts.map((p) => ({
        _id: p.id,
        ...p,
        stock: p.stock ?? 15,
        inStock: p.inStock ?? true,
      }));
      writeLocalDB(db);
      console.log(`✓ Initialized ${defaultProducts.length} default products into Local Datastore.`);
    }
  },

  // --- ADMIN USER OVERSIGHT METHODS ---
  async getAllUsersWithProfiles() {
    if (isMongoActive()) {
      const users = await MongoUser.find({}, '-password_hash').sort({ created_at: -1 }).lean();
      const profiles = await MongoProfile.find({}).lean();
      const profileMap = new Map();
      profiles.forEach((p) => profileMap.set(String(p.user_id), p));

      return users.map((u) => {
        const prof = profileMap.get(String(u._id)) || {};
        return {
          id: u._id,
          full_name: u.full_name,
          email: u.email,
          role: u.role,
          avatar: u.avatar,
          account_status: u.account_status || 'Active Member',
          created_at: u.created_at,
          phone: prof.phone || 'N/A',
          city: prof.shipping_address?.city || 'Colombo',
          shipping_address: prof.shipping_address || {},
          billing_address: prof.billing_address || {},
          cart_items_count: prof.cart_items?.length || 0,
        };
      });
    }

    const db = readLocalDB();
    const profileMap = new Map();
    (db.profiles || []).forEach((p) => profileMap.set(p.user_id, p));

    return (db.users || []).map((u) => {
      const prof = profileMap.get(u._id || u.id) || {};
      return {
        id: u._id || u.id,
        full_name: u.full_name,
        email: u.email,
        role: u.role,
        avatar: u.avatar,
        account_status: u.account_status || 'Active Member',
        created_at: u.created_at,
        phone: prof.phone || 'N/A',
        city: prof.shipping_address?.city || 'Colombo',
        shipping_address: prof.shipping_address || {},
        billing_address: prof.billing_address || {},
        cart_items_count: prof.cart_items?.length || 0,
      };
    });
  },

  async updateUserRole(userId, newRole) {
    if (isMongoActive()) {
      return await MongoUser.findByIdAndUpdate(userId, { role: newRole }, { new: true }).lean();
    }
    const db = readLocalDB();
    const user = db.users.find((u) => u._id === userId || u.id === userId);
    if (user) {
      user.role = newRole;
      writeLocalDB(db);
      return user;
    }
    return null;
  },

  async updateUserStatus(userId, newStatus) {
    if (isMongoActive()) {
      return await MongoUser.findByIdAndUpdate(userId, { account_status: newStatus }, { new: true }).lean();
    }
    const db = readLocalDB();
    const user = db.users.find((u) => u._id === userId || u.id === userId);
    if (user) {
      user.account_status = newStatus;
      writeLocalDB(db);
      return user;
    }
    return null;
  },

  // --- ORDER & SALES REPORTING METHODS ---
  async createOrder(orderData) {
    const order_id = orderData.order_id || 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const completeOrder = {
      order_id,
      user_id: orderData.user_id || null,
      customer_name: orderData.customer_name || 'Anonymous Operator',
      customer_email: orderData.customer_email || 'customer@pcpoint.lk',
      items: orderData.items || [],
      total_amount: Number(orderData.total_amount || 0),
      payment_method: orderData.payment_method || 'koko',
      shipping_address: orderData.shipping_address || {},
      status: orderData.status || 'Dispatched',
      created_at: orderData.created_at || new Date().toISOString(),
    };

    if (isMongoActive()) {
      const order = await MongoOrder.create(completeOrder);
      return order.toObject();
    }
    const db = readLocalDB();
    db.orders = db.orders || [];
    db.orders.unshift(completeOrder);
    writeLocalDB(db);
    return completeOrder;
  },

  async getAllOrders() {
    if (isMongoActive()) {
      return await MongoOrder.find({}).sort({ created_at: -1 }).lean();
    }
    const db = readLocalDB();
    return db.orders || [];
  },

  async getSalesReport() {
    const orders = await this.getAllOrders();

    // Default sample orders if no orders placed yet, to provide immediate rich telemetry for PDF reports
    const defaultSampleOrders = [
      {
        order_id: 'ORD-2026-894102',
        customer_name: 'Alex Mercer',
        customer_email: 'alex.m@devlab.io',
        total_amount: 1350000,
        payment_method: 'koko',
        items: [{ name: 'ASUS ROG Strix SCAR 18 (2024)', qty: 1, price: 1350000, category: 'laptops' }],
        created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        status: 'Dispatched',
      },
      {
        order_id: 'ORD-2026-512984',
        customer_name: 'Samantha Ray',
        customer_email: 'samantha@cyber.lk',
        total_amount: 785000,
        payment_method: 'card',
        items: [{ name: 'ASUS ROG Strix RTX 4090 OC White 24GB', qty: 1, price: 785000, category: 'gpus' }],
        created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
        status: 'Delivered',
      },
      {
        order_id: 'ORD-2026-348219',
        customer_name: 'Kasun Perera',
        customer_email: 'kasun.p@tech.lk',
        total_amount: 410000,
        payment_method: 'cod',
        items: [{ name: 'ASUS TUF Gaming A15 (2024)', qty: 1, price: 385000, category: 'laptops' }, { name: 'Keychron Q1 Pro Wireless', qty: 1, price: 25000, category: 'peripherals' }],
        created_at: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
        status: 'Delivered',
      },
    ];

    const allOrders = orders.length > 0 ? orders : defaultSampleOrders;

    const totalRevenue = allOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    const totalOrdersCount = allOrders.length;
    const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

    // Calculate sales by category
    const categoryTotals = {};
    let totalUnitsSold = 0;
    allOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const cat = (item.category || 'Hardware').toUpperCase();
        const amt = (Number(item.price) || 0) * (Number(item.qty) || 1);
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
        totalUnitsSold += Number(item.qty) || 1;
      });
    });

    const categoryBreakdown = Object.entries(categoryTotals).map(([name, revenue]) => ({
      name,
      revenue,
      percentage: totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0,
    }));

    return {
      totalRevenue,
      totalOrdersCount,
      avgOrderValue,
      totalUnitsSold,
      categoryBreakdown,
      orders: allOrders,
      generatedAt: new Date().toISOString(),
    };
  },
};

