import mongoose from 'mongoose';

// User Entity Schema
const userSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password_hash: {
    type: String,
    required: [true, 'Password hash is required'],
  },
  role: {
    type: String,
    enum: ['authenticated', 'admin', 'operator'],
    default: 'authenticated',
  },
  avatar: {
    type: String,
    default: '/assets/u1.svg',
  },
  account_status: {
    type: String,
    default: 'Active Member',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Profile & Address Entity Schema
const addressSchema = new mongoose.Schema({
  street: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  postal_code: { type: String, default: '' },
  country: { type: String, default: 'Sri Lanka' },
}, { _id: false });

const profileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    default: '',
    trim: true,
  },
  shipping_address: {
    type: addressSchema,
    default: () => ({}),
  },
  billing_address: {
    type: addressSchema,
    default: () => ({}),
  },
  cart_items: {
    type: Array,
    default: [],
  },
  merged_guest_items_count: {
    type: Number,
    default: 0,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

export const MongoUser = mongoose.models.User || mongoose.model('User', userSchema);
export const MongoProfile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, lowercase: true, trim: true },
  categoryName: { type: String, default: 'HARDWARE' },
  brand: { type: String, default: 'PCPoint' },
  badge: { type: String, default: 'TACTICAL' },
  price: { type: Number, required: true, min: 0 },
  oldPrice: { type: Number, default: 0 },
  stock: { type: Number, default: 10, min: 0 },
  inStock: { type: Boolean, default: true },
  rating: { type: Number, default: 4.8 },
  reviewsCount: { type: Number, default: 10 },
  warranty: { type: String, default: '2 Years Official Warranty' },
  img: { type: String, default: '/pc_1787633742711.jpg' },
  specs: { type: String, default: '' },
  description: { type: String, default: '' },
  tags: { type: [String], default: [] },
  created_at: { type: Date, default: Date.now },
});

// Order Schema for Sales Analytics & PDF Reporting
const orderSchema = new mongoose.Schema({
  order_id: { type: String, required: true, unique: true },
  user_id: { type: String, default: null },
  customer_name: { type: String, required: true },
  customer_email: { type: String, required: true },
  items: { type: Array, default: [] },
  total_amount: { type: Number, required: true },
  payment_method: { type: String, default: 'koko' },
  shipping_address: { type: Object, default: () => ({}) },
  status: { type: String, default: 'Dispatched' },
  created_at: { type: Date, default: Date.now },
});

export const MongoProduct = mongoose.models.Product || mongoose.model('Product', productSchema);
export const MongoOrder = mongoose.models.Order || mongoose.model('Order', orderSchema);

