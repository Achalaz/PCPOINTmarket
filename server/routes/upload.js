/**
 * POST /api/upload/product-image
 * Admin Only: Upload a product image file.
 * Returns the public URL path of the saved image.
 */
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAdmin } from '../middleware/admin.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve uploads directory → <project-root>/public/uploads/products/
const UPLOAD_DIR = path.join(__dirname, '../../public/uploads/products');

// Multer disk storage: keep original extension, generate unique filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `prod_${Date.now()}_${Math.floor(Math.random() * 9999)}${ext}`;
    cb(null, uniqueName);
  },
});

// Only allow image file types
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|avif/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype);
  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpg, png, gif, webp, avif).'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB max
});

/**
 * POST /api/upload/product-image
 * Multipart form-data field: "productImage"
 */
router.post('/product-image', requireAdmin, upload.single('productImage'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file received.' });
  }
  // Return a URL path that Express static will serve
  const publicUrl = `/uploads/products/${req.file.filename}`;
  return res.status(200).json({
    success: true,
    message: 'Product image uploaded successfully.',
    url: publicUrl,
    filename: req.file.filename,
    size: req.file.size,
  });
});

// Multer error handler
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
});

export default router;
