import express from 'express';
import { dbAdapter } from '../models/dbAdapter.js';
import { requireAdmin } from '../middleware/admin.js';

const router = express.Router();

/**
 * GET /api/admin/users
 * Admin Only: View all registered users with contact & address telemetry
 */
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await dbAdapter.getAllUsersWithProfiles();
    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err) {
    console.error('Error fetching admin users:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
});

/**
 * PUT /api/admin/users/:id/role
 * Admin Only: Promote or demote user role
 */
router.put('/users/:id/role', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!role || !['authenticated', 'admin', 'operator'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    const updated = await dbAdapter.updateUserRole(id, role);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `User clearance level updated to "${role}".`,
      user: updated,
    });
  } catch (err) {
    console.error('Error updating user role:', err);
    return res.status(500).json({ success: false, message: 'Failed to update user role.' });
  }
});

/**
 * PUT /api/admin/users/:id/status
 * Admin Only: Update user account status (e.g. Active Member, Suspended)
 */
router.put('/users/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required.' });
    }

    const updated = await dbAdapter.updateUserStatus(id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `User status changed to "${status}".`,
      user: updated,
    });
  } catch (err) {
    console.error('Error updating user status:', err);
    return res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
});

/**
 * GET /api/admin/sales-report
 * Admin Only: Fetch full financial metrics, category breakdown, and order audit ledger
 */
router.get('/sales-report', requireAdmin, async (req, res) => {
  try {
    const report = await dbAdapter.getSalesReport();
    return res.status(200).json({
      success: true,
      report,
    });
  } catch (err) {
    console.error('Error compiling sales report:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate sales report.' });
  }
});

/**
 * POST /api/admin/orders
 * Public / Authenticated: Record an order upon completed checkout
 */
router.post('/orders', async (req, res) => {
  try {
    const { customer_name, customer_email, items, total_amount, payment_method, shipping_address } = req.body;

    const order = await dbAdapter.createOrder({
      customer_name,
      customer_email,
      items,
      total_amount,
      payment_method,
      shipping_address,
      user_id: req.user?.sub || null,
    });

    return res.status(201).json({
      success: true,
      message: 'Order recorded into sales system.',
      order,
    });
  } catch (err) {
    console.error('Error creating order record:', err);
    return res.status(500).json({ success: false, message: 'Failed to record order.' });
  }
});

export default router;
