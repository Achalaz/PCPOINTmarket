import { authenticateToken } from './auth.js';

export function requireAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: High-clearance Administrator privilege required.',
        code: 'FORBIDDEN',
      });
    }
  });
}
