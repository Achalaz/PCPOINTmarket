import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { isMongoActive } from '../config/db.js';
import { MongoUser, MongoProfile } from './mongoSchemas.js';

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
    const initial = { users: [], profiles: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
  }
}

function readLocalDB() {
  ensureLocalFile();
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content || '{"users":[],"profiles":[]}');
  } catch (err) {
    console.error('Error reading local db:', err);
    return { users: [], profiles: [] };
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
};
