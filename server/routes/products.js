import express from 'express';
import { dbAdapter } from '../models/dbAdapter.js';
import { requireAdmin } from '../middleware/admin.js';

const router = express.Router();

/**
 * GET /api/products
 * Retrieves all catalog products with live stock info
 */
router.get('/', async (req, res) => {
  try {
    const products = await dbAdapter.getAllProducts();
    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
});

/**
 * POST /api/products
 * Admin Only: Add new hardware product to inventory
 */
router.post('/', requireAdmin, async (req, res) => {
  try {
    const {
      name,
      category,
      categoryName,
      brand,
      badge,
      price,
      oldPrice,
      stock,
      warranty,
      img,
      specs,
      description,
      tags,
    } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product name, category, and price are required fields.',
      });
    }

    const newProduct = await dbAdapter.createProduct({
      name: name.trim(),
      category: category.toLowerCase().trim(),
      categoryName: categoryName || category.toUpperCase(),
      brand: brand || 'PCPoint',
      badge: badge || 'TACTICAL',
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : 0,
      stock: Number(stock ?? 10),
      inStock: Number(stock ?? 10) > 0,
      warranty: warranty || '2 Years Official Warranty',
      img: img || '/pc_1787633742711.jpg',
      specs: specs || '',
      description: description || '',
      tags: Array.isArray(tags) ? tags : [],
    });

    return res.status(201).json({
      success: true,
      message: `Product "${newProduct.name}" added to inventory successfully.`,
      product: newProduct,
    });
  } catch (err) {
    console.error('Error adding product:', err);
    return res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
});

/**
 * PUT /api/products/:id
 * Admin Only: Update product details or stock
 */
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await dbAdapter.updateProduct(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product: updated,
    });
  } catch (err) {
    console.error('Error updating product:', err);
    return res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
});

/**
 * PUT /api/products/:id/stock
 * Admin Only: Quick stock adjustment
 */
router.put('/:id/stock', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    if (stock === undefined) {
      return res.status(400).json({ success: false, message: 'Stock number required.' });
    }
    const updated = await dbAdapter.updateProductStock(id, stock);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    return res.status(200).json({
      success: true,
      message: `Stock level updated to ${updated.stock} units.`,
      product: updated,
    });
  } catch (err) {
    console.error('Error updating stock:', err);
    return res.status(500).json({ success: false, message: 'Failed to update stock.' });
  }
});

/**
 * DELETE /api/products/:id
 * Admin Only: Remove product from inventory
 */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await dbAdapter.deleteProduct(id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    return res.status(200).json({
      success: true,
      message: 'Product removed from inventory.',
    });
  } catch (err) {
    console.error('Error deleting product:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
});

export default router;
