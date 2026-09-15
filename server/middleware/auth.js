import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'pcpoint_super_secret_jwt_key_2026_change_me';

export function authenticateToken(req, res, next) {
  // Extract token from HTTP-only cookie OR Authorization header (Bearer token)
  let token = null;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Access denied.',
      code: 'UNAUTHORIZED',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Contains sub, name, email, avatar, role
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please log in again.',
      code: 'TOKEN_EXPIRED',
    });
  }
}

export function generateToken(user) {
  const payload = {
    sub: String(user._id || user.id),
    name: user.full_name,
    email: user.email,
    avatar: user.avatar || '/assets/u1.svg',
    role: user.role || 'authenticated',
  };

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}
