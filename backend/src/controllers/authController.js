import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../services/tokenService.js';

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
}

export async function register(req, res, next) {
  if (!handleValidation(req, res)) return;
  try {
    const { email, password, name } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });
    const user = await User.create({ email, password, name });
    const accessToken = generateAccessToken({ sub: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ sub: user.id });
    user.refreshTokens.push({ token: refreshToken, userAgent: req.get('user-agent') });
    await user.save();
    return res.status(201).json({ user: { id: user.id, email, name }, accessToken, refreshToken });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  if (!handleValidation(req, res)) return;
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const accessToken = generateAccessToken({ sub: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ sub: user.id });
    user.refreshTokens.push({ token: refreshToken, userAgent: req.get('user-agent') });
    await user.save();
    return res.json({ user: { id: user.id, email: user.email, name: user.name }, accessToken, refreshToken });
  } catch (error) {
    return next(error);
  }
}

export async function refresh(req, res, next) {
  if (!handleValidation(req, res)) return;
  const { refreshToken } = req.body;
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.sub);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const isValid = user.refreshTokens.some((tokenDoc) => tokenDoc.token === refreshToken);
    if (!isValid) return res.status(401).json({ message: 'Unauthorized' });
    const accessToken = generateAccessToken({ sub: user.id, role: user.role });
    return res.json({ accessToken });
  } catch (error) {
    if (error?.name?.toLowerCase().includes('jwt')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    return next(error);
  }
}

export async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const { user } = req;
    user.refreshTokens = user.refreshTokens.filter((tokenDoc) => tokenDoc.token !== refreshToken);
    await user.save();
    res.json({ message: 'Logged out' });
  } catch (error) {
    return next(error);
  }
}
