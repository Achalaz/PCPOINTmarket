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
