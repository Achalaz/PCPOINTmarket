import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB, isMongoActive } from './server/config/db.js';
import { dbAdapter } from './server/models/dbAdapter.js';
import { initialProducts } from './server/config/initialProducts.js';
import authRoutes from './server/routes/auth.js';
import profileRoutes from './server/routes/profile.js';
import cartRoutes from './server/routes/cart.js';
import productsRoutes from './server/routes/products.js';
import adminRoutes from './server/routes/admin.js';
import uploadRoutes from './server/routes/upload.js';
import payhereRoutes from './server/routes/payhere.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Lazy one-time DB init — runs on first incoming request.
// This is required for Vercel serverless (no top-level await for I/O).
let _dbReady = false;
async function ensureDB() {
  if (_dbReady) return;
  await connectDB();
  await dbAdapter.seedDefaultProducts(initialProducts);
  _dbReady = true;
}
app.use(async (_req, _res, next) => {
  try { await ensureDB(); } catch (e) { console.error('[DB init]', e); }
  next();
});

// Middlewares
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      process.env.CLIENT_URL,
      // Vercel injects VERCEL_URL (deployment) and VERCEL_BRANCH_URL (branch)
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
      process.env.VERCEL_BRANCH_URL ? `https://${process.env.VERCEL_BRANCH_URL}` : undefined,
    ].filter(Boolean),
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static legacy assets
app.use(express.static(path.join(__dirname, 'public')));
// Serve uploaded product images
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Health Check & Diagnostics API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OPERATIONAL',
    service: 'PCPOINTmarket Armory Core API',
    version: '1.2.0 (Admin & Reporting Edition)',
    database: isMongoActive() ? 'MongoDB Atlas Cluster' : 'Resilient Local Datastore',
    auth_mode: 'JWT (HTTP-only Cookie & Bearer Support)',
    timestamp: new Date().toISOString(),
  });
});

// Authentication Routes
app.use('/api', authRoutes);
app.use('/api/auth', authRoutes);

// Profile Management Routes
app.use('/api/profile', profileRoutes);

// Tactical Cart Synchronization Routes
app.use('/api/cart', cartRoutes);

// Catalog & Inventory Products Routes
app.use('/api/products', productsRoutes);

// Admin Control Center Routes (Users & Sales Reporting)
app.use('/api/admin', adminRoutes);

// Product Image Upload Route
app.use('/api/upload', uploadRoutes);

// PayHere Payment Gateway Routes
app.use('/api/payhere', payhereRoutes);

// 404 handler for undefined API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Only bind a port when running locally — Vercel manages this in serverless mode.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` PCPOINTmarket Backend Server Live on Port ${PORT}`);
    console.log(` API Health Check: http://localhost:${PORT}/api/health`);
    console.log(` Database Status : ${isMongoActive() ? 'MongoDB Atlas' : 'Local Persistent Datastore'}`);
    console.log(` Admin Endpoints : /api/admin/users | /api/admin/sales-report`);
    console.log(` Inventory Route : /api/products (GET, POST, PUT, DELETE)`);
    console.log(`====================================================`);
  });
}

export default app;
