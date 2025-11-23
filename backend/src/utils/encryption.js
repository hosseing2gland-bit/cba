import crypto from 'crypto';
import { ApiError, ERROR_CODES } from './errors.js';

const ALGORITHM = 'aes-256-gcm';

function parseKeySet(raw) {
  if (!raw) throw new ApiError(500, ERROR_CODES.INTERNAL_ERROR, 'کلید رمزنگاری تنظیم نشده است');
  return raw.split(',').reduce((acc, entry, index) => {
    const [keyId, key] = entry.includes(':') ? entry.split(':') : [null, entry];
    const id = (keyId || `k${index + 1}`).trim();
    acc[id] = key.trim();
    return acc;
  }, {});
}

const keySet = parseKeySet(process.env.ENCRYPTION_KEYS || process.env.ENCRYPTION_KEY);
const activeKeyId = process.env.ENCRYPTION_ACTIVE_KID || Object.keys(keySet)[0];

function getKey(keyId = activeKeyId) {
  const key = keySet[keyId];
  if (!key || key.length !== 32) {
    throw new ApiError(500, ERROR_CODES.INTERNAL_ERROR, 'کلید رمزنگاری معتبر نیست');
  }
  return { key: Buffer.from(key), keyId };
}

export function encryptPayload(payload) {
  const { key, keyId } = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    keyId,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    encryptedData: encrypted.toString('hex'),
  };
}

export function decryptPayload({ iv, authTag, encryptedData, keyId }) {
  const { key } = getKey(keyId);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedData, 'hex')),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString('utf8'));
}
