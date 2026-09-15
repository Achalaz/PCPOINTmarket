import express from 'express';
import bcrypt from 'bcryptjs';
import { dbAdapter } from '../models/dbAdapter.js';
import { authenticateToken, generateToken } from '../middleware/auth.js';

const router = express.Router();

// Email regex according to W3C / standard RFC
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password complexity: min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special character
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

/**
 * POST /api/register
 * Milestone 1: User Registration
 */
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, confirmPassword } = req.body;

    // 1. Validation checks
    if (!full_name || full_name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required (minimum 2 characters).',
      });
    }

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (!password || !PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          'Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character.',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    // 2. Check if user already exists
    const existing = await dbAdapter.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // 3. Hash password using bcrypt (12 salt rounds)
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 4. Save to database
    const newUser = await dbAdapter.createUser({
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      password_hash,
      role: 'authenticated',
      avatar: '/assets/u1.svg',
    });

    return res.status(201).json({
      success: true,
      message: 'Operator enlisted successfully! You can now proceed to login.',
      user: {
        id: newUser._id || newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
        created_at: newUser.created_at,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration.',
    });
  }
});

/**
 * POST /api/login
 * Milestone 2: User Login & State Persistence
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // Retrieve user by email
    const user = await dbAdapter.findUserByEmail(email);

    // SECURITY IMPERATIVE: Prevent user enumeration!
    // Return identical generic error whether email not found or password incorrect.
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Store in HTTP-only cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: 'Authentication successful. Welcome back, Operator.',
      token,
      user: {
        id: user._id || user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role || 'authenticated',
        avatar: user.avatar || '/assets/u1.svg',
        account_status: user.account_status || 'Active Member',
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login.',
    });
  }
});

/**
 * POST /api/logout
 * Milestone 3: Route Protection & Logout
 */
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
  });
  return res.status(200).json({
    success: true,
    message: 'Session terminated. Safely logged out.',
  });
});

/**
 * GET /api/auth/me
 * Returns current authenticated user profile & session
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await dbAdapter.findUserById(req.user.sub);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User record not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id || user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '/assets/u1.svg',
        account_status: user.account_status || 'Active Member',
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error('Me endpoint error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve session details.',
    });
  }
});

export default router;
