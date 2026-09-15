import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB, isMongoActive } from './server/config/db.js';
import authRoutes from './server/routes/auth.js';
import profileRoutes from './server/routes/profile.js';
import cartRoutes from './server/routes/cart.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database (MongoDB Atlas with fallback to local persistent store)
await connectDB();

// Middlewares
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      process.env.CLIENT_URL,
    ].filter(Boolean),
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static legacy assets
app.use(express.static(path.join(__dirname, 'public')));

// Health Check & Diagnostics API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OPERATIONAL',
    service: 'PCPOINTmarket Armory Core API',
    version: '1.0.0 (Week 06 Edition)',
    database: isMongoActive() ? 'MongoDB Atlas Cluster' : 'Resilient Local Datastore',
    auth_mode: 'JWT (HTTP-only Cookie & Bearer Support)',
    timestamp: new Date().toISOString(),
  });
});

// Authentication Routes: Supporting both /api/... and /api/auth/...
app.use('/api', authRoutes);
app.use('/api/auth', authRoutes);

// Profile Management Routes
app.use('/api/profile', profileRoutes);

// Tactical Cart Synchronization Routes
app.use('/api/cart', cartRoutes);

// 404 handler for undefined API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` PCPOINTmarket Backend Server Live on Port ${PORT}`);
  console.log(` API Health Check: http://localhost:${PORT}/api/health`);
  console.log(` Database Status : ${isMongoActive() ? 'MongoDB Atlas' : 'Local Persistent Datastore'}`);
  console.log(`====================================================`);
});

export default app;
