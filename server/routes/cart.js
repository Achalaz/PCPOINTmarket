import express from 'express';
import { dbAdapter } from '../models/dbAdapter.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/cart/sync
 * Milestone 4: Cart Association - Merge or persist guest shopping items upon user authentication
 */
router.post('/sync', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { guestItems = [] } = req.body;

    const result = await dbAdapter.syncCart(userId, guestItems);

    return res.status(200).json({
      success: true,
      message: `Successfully synchronized cart. ${result.mergedCount} guest items merged.`,
      cart: result.cart,
      mergedCount: result.mergedCount,
      cart_state: `${result.mergedCount} guest items merged`,
    });
  } catch (err) {
    console.error('Cart sync error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to synchronize guest cart.',
    });
  }
});

export default router;
