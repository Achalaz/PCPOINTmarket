import express from 'express';
import bcrypt from 'bcryptjs';
import { dbAdapter } from '../models/dbAdapter.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

/**
 * GET /api/profile
 * Milestone 4: Retrieve profile and address details
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const user = await dbAdapter.findUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const profile = await dbAdapter.getProfileByUserId(userId);

    return res.status(200).json({
      success: true,
      user: {
        id: user._id || user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role || 'authenticated',
        avatar: user.avatar || '/assets/u1.svg',
        account_status: user.account_status || 'Active Member',
        created_at: user.created_at,
      },
      profile: {
        phone: profile.phone || '',
        shipping_address: profile.shipping_address || {
          street: '',
          city: '',
          state: '',
          postal_code: '',
          country: 'Sri Lanka',
        },
        billing_address: profile.billing_address || {
          street: '',
          city: '',
          state: '',
          postal_code: '',
          country: 'Sri Lanka',
        },
        cart_items: profile.cart_items || [],
        merged_guest_items_count: profile.merged_guest_items_count || 0,
        updated_at: profile.updated_at,
      },
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile data.' });
  }
});

/**
 * PUT /api/profile
 * Milestone 4: Edit details form (contact info, phone, addresses)
 */
router.put('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { full_name, avatar, phone, shipping_address, billing_address } = req.body;

    // Update user basic details if provided
    if (full_name || avatar) {
      await dbAdapter.updateUserBasic(userId, { full_name, avatar });
    }

    // Update profile contact & addresses
    const updatedProfile = await dbAdapter.updateProfile(userId, {
      phone,
      shipping_address,
      billing_address,
    });

    const user = await dbAdapter.findUserById(userId);

    return res.status(200).json({
      success: true,
      message: 'Profile information updated successfully.',
      user: {
        id: user._id || user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        account_status: user.account_status || 'Active Member',
        created_at: user.created_at,
      },
      profile: updatedProfile,
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

/**
 * PUT /api/profile/password
 * Milestone 4: Secure password change with identity re-verification
 */
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password, new password, and confirmation are all required.',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation do not match.',
      });
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          'New password must be at least 8 characters long and contain uppercase, lowercase, a number, and a special character.',
      });
    }

    // Retrieve user and re-verify identity with current password
    const user = await dbAdapter.findUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password verification failed. Please verify your credentials.',
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password cannot be the same as your current password.',
      });
    }

    // Hash new password with 12 salt rounds
    const newHash = await bcrypt.hash(newPassword, 12);
    await dbAdapter.updateUserPassword(userId, newHash);

    return res.status(200).json({
      success: true,
      message: 'Security credentials updated successfully. Your new password is now active.',
    });
  } catch (err) {
    console.error('Error changing password:', err);
    return res.status(500).json({ success: false, message: 'Failed to update password.' });
  }
});

export default router;
