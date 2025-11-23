import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../services/tokenService.js';
import { ApiError, ERROR_CODES } from '../utils/errors.js';
import logger from '../utils/logger.js';

export async function register(req, res, next) {
  try {
    const { email, password, name } = req.validated;
    const existing = await User.findOne({ email });
    if (existing) throw new ApiError(409, ERROR_CODES.AUTH_CONFLICT, 'ایمیل قبلاً ثبت شده است');

    const user = await User.create({ email, password, name });
    const accessToken = generateAccessToken({ sub: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ sub: user.id });
    user.refreshTokens.push({ token: refreshToken, userAgent: req.get('user-agent') });
    await user.save();
    logger.info({ userId: user.id, requestId: req.id }, 'User registered');
    return res.status(201).json({ user: { id: user.id, email, name }, accessToken, refreshToken });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.validated;
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(401, ERROR_CODES.AUTH_INVALID_CREDENTIALS, 'اطلاعات ورود نادرست است');
    const match = await user.comparePassword(password);
    if (!match) throw new ApiError(401, ERROR_CODES.AUTH_INVALID_CREDENTIALS, 'اطلاعات ورود نادرست است');
    const accessToken = generateAccessToken({ sub: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ sub: user.id });
    user.refreshTokens.push({ token: refreshToken, userAgent: req.get('user-agent') });
    await user.save();
    logger.info({ userId: user.id, requestId: req.id }, 'User logged in');
    return res.json({ user: { id: user.id, email: user.email, name: user.name }, accessToken, refreshToken });
  } catch (error) {
    return next(error);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.validated;
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.sub);
    if (!user) throw new ApiError(401, ERROR_CODES.AUTH_UNAUTHORIZED, 'دسترسی غیرمجاز');
    const isValid = user.refreshTokens.some((tokenDoc) => tokenDoc.token === refreshToken);
    if (!isValid) throw new ApiError(401, ERROR_CODES.AUTH_UNAUTHORIZED, 'توکن نامعتبر است');
    const accessToken = generateAccessToken({ sub: user.id, role: user.role });
    return res.json({ accessToken });
  } catch (error) {
    return next(error);
  }
}

export async function logout(req, res, next) {
  try {
    const { refreshToken } = req.validated;
    const { user } = req;
    user.refreshTokens = user.refreshTokens.filter((tokenDoc) => tokenDoc.token !== refreshToken);
    await user.save();
    logger.info({ userId: user.id, requestId: req.id }, 'User logged out');
    res.json({ message: 'خروج با موفقیت انجام شد' });
  } catch (error) {
    next(error);
  }
}
