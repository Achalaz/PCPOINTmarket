import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let isConnectedToMongo = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[DB] No MONGODB_URI found in environment. Using resilient local datastore.');
    return false;
  }

  try {
    // 3.5s timeout so startup is fast and never hangs if Atlas network whitelist blocks IP
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3500,
    });
    isConnectedToMongo = true;
    console.log(' Tactical Database: Connected to MongoDB Atlas successfully.');
    return true;
  } catch (err) {
    console.warn(`⚠️ [DB] MongoDB Atlas connection unreachable (${err.message}).`);
    console.log(' Tactical Database: Seamlessly activating resilient local encrypted datastore.');
    isConnectedToMongo = false;
    return false;
  }
}

export function isMongoActive() {
  return isConnectedToMongo;
}
