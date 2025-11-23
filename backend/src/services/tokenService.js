import jwt from 'jsonwebtoken';
import { ApiError, ERROR_CODES } from '../utils/errors.js';

const accessExpiry = process.env.JWT_EXPIRY || '15m';
const refreshExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';

function parseKeySet(raw, label) {
  if (!raw) throw new ApiError(500, ERROR_CODES.INTERNAL_ERROR, `${label} تنظیم نشده است`);
  return raw.split(',').reduce((acc, entry, index) => {
    const [kid, key] = entry.includes(':') ? entry.split(':') : [null, entry];
    const id = (kid || `k${index + 1}`).trim();
    acc[id] = key.trim();
    return acc;
  }, {});
}

let accessKeySet;
let refreshKeySet;
let activeAccessKid;
let activeRefreshKid;

function ensureKeySets() {
  if (accessKeySet && refreshKeySet && activeAccessKid && activeRefreshKid) return;

  accessKeySet = parseKeySet(process.env.JWT_ACCESS_KEY_SET || process.env.JWT_SECRET, 'JWT_ACCESS_KEY_SET');
  refreshKeySet = parseKeySet(
    process.env.JWT_REFRESH_KEY_SET || process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    'JWT_REFRESH_KEY_SET',
  );
  activeAccessKid = process.env.JWT_ACTIVE_KID || Object.keys(accessKeySet)[0];
  activeRefreshKid = process.env.JWT_REFRESH_ACTIVE_KID || Object.keys(refreshKeySet)[0];
}

function resolveKey(token, keySet, activeKid) {
  const decoded = jwt.decode(token, { complete: true });
  const kid = decoded?.header?.kid || activeKid;
  const key = keySet[kid];
  if (!key) {
    throw new ApiError(401, ERROR_CODES.AUTH_UNAUTHORIZED, 'کلید توکن معتبر نیست');
  }
  return key;
}

export function generateAccessToken(payload) {
  ensureKeySets();
  return jwt.sign(payload, accessKeySet[activeAccessKid], { expiresIn: accessExpiry, keyid: activeAccessKid });
}

export function generateRefreshToken(payload) {
  ensureKeySets();
  return jwt.sign(payload, refreshKeySet[activeRefreshKid], {
    expiresIn: refreshExpiry,
    keyid: activeRefreshKid,
  });
}

export function verifyAccessToken(token) {
  ensureKeySets();
  const key = resolveKey(token, accessKeySet, activeAccessKid);
  return jwt.verify(token, key);
}

export function verifyRefreshToken(token) {
  ensureKeySets();
  const key = resolveKey(token, refreshKeySet, activeRefreshKid);
  return jwt.verify(token, key);
}
