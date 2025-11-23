import { verifyAccessToken } from '../services/tokenService.js';
import { ApiError, ERROR_CODES } from '../utils/errors.js';
import logger from '../utils/logger.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new ApiError(401, ERROR_CODES.AUTH_UNAUTHORIZED, 'احراز هویت لازم است');
    }
    const token = header.split(' ')[1];
    const decoded = verifyAccessToken(token);
    const user = await (await import('../models/User.js')).default.findById(decoded.sub).select('-password');
    if (!user) throw new ApiError(401, ERROR_CODES.AUTH_UNAUTHORIZED, 'احراز هویت نامعتبر است');
    req.user = user;
    logger.debug({ userId: user.id, requestId: req.id }, 'Request authenticated');
    return next();
  } catch (error) {
    return next(error);
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (req.user?.role !== role) {
      return next(new ApiError(403, ERROR_CODES.PERMISSION_DENIED, 'دسترسی مجاز نیست'));
    }
    return next();
  };
}
