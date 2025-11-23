import jwt from 'jsonwebtoken';

const accessExpiry = process.env.JWT_EXPIRY || '15m';
const refreshExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
const profileTokenExpiry = process.env.PROFILE_TOKEN_EXPIRY || '30m';

export function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: accessExpiry });
}

export function generateRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: refreshExpiry });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

export function generateProfileAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_PROFILE_SECRET || process.env.JWT_SECRET, {
    expiresIn: profileTokenExpiry,
  });
}
