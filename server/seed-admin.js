import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { dbAdapter } from './models/dbAdapter.js';

dotenv.config();

export async function seedAdmin() {
  await connectDB();

  const adminEmail = 'admin@pcpoint.lk';
  const adminPassword = 'Admin#PCPoint2026';
  const fullName = 'PCPoint Chief Administrator';

  const existing = await dbAdapter.findUserByEmail(adminEmail);
  if (existing) {
    console.log(`✓ Admin user already exists: ${adminEmail}`);
    return existing;
  }

  const saltRounds = 12;
  const password_hash = await bcrypt.hash(adminPassword, saltRounds);

  const adminUser = await dbAdapter.createUser({
    full_name: fullName,
    email: adminEmail,
    password_hash,
    role: 'admin',
    avatar: '/assets/u1.svg',
  });

  // Seed admin profile
  await dbAdapter.updateProfile(adminUser._id || adminUser.id, {
    phone: '+94 11 234 5678',
    shipping_address: {
      street: 'HQ Tower, 50 Cyberpunk Way',
      city: 'Colombo 01',
      state: 'Western Province',
      postal_code: '00100',
      country: 'Sri Lanka',
    },
    billing_address: {
      street: 'HQ Tower, 50 Cyberpunk Way',
      city: 'Colombo 01',
      state: 'Western Province',
      postal_code: '00100',
      country: 'Sri Lanka',
    },
  });

  console.log('====================================================');
  console.log(' Tactical Admin Account Initialized:');
  console.log(` Email   : ${adminEmail}`);
  console.log(` Password: ${adminPassword}`);
  console.log(` Role    : admin`);
  console.log('====================================================');

  return adminUser;
}

// Run directly if invoked as CLI script
if (process.argv[1]?.includes('seed-admin.js')) {
  seedAdmin()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Failed to seed admin:', err);
      process.exit(1);
    });
}
