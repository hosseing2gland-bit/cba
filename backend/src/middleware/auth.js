import { verifyAccessToken } from '../services/tokenService.js';
import User from '../models/User.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = header.split(' ')[1];
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.sub).select('-password');
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

export function requireRole(roles = []) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (userRole === 'admin' || allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({ message: 'Forbidden' });
  };
}

export const requireAdmin = requireRole('admin');
export const requireClient = requireRole('client');
