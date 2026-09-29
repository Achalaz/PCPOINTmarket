import { connectDB, isMongoActive } from './server/config/db.js';
import { MongoProduct } from './server/models/mongoSchemas.js';
import { initialProducts } from './server/config/initialProducts.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await connectDB();
  if (isMongoActive()) {
    await MongoProduct.deleteMany({});
    console.log('Cleared existing products.');
    await MongoProduct.insertMany(initialProducts);
    console.log('Inserted ' + initialProducts.length + ' products with real images.');
  } else {
    console.log('Mongo not active, skipping DB seeding.');
  }
  process.exit(0);
}
run();
