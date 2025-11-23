import jwt from 'jsonwebtoken';

const accessExpiry = process.env.JWT_EXPIRY || '15m';
const refreshExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
const profileExpiry = process.env.PROFILE_TOKEN_EXPIRY || '30m';
const profileSecret = process.env.PROFILE_TOKEN_SECRET || process.env.JWT_SECRET;

export function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: accessExpiry });
}

export function generateRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: refreshExpiry });
}

export function generateProfileToken(payload, expiresIn = profileExpiry) {
  return jwt.sign(payload, profileSecret, { expiresIn });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

export function verifyProfileToken(token) {
  return jwt.verify(token, profileSecret);
}
