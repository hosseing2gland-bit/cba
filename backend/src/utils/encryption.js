import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;

function normalizeKey(key) {
  if (Buffer.isBuffer(key)) {
    if (key.length !== KEY_LENGTH) throw new Error(`Encryption key buffer must be ${KEY_LENGTH} bytes`);
    return key;
  }
  if (!key) throw new Error('ENCRYPTION_KEY must be provided');
  if (key.length === KEY_LENGTH) return Buffer.from(key);
  return crypto.scryptSync(key, 'profile-e2ee-salt', KEY_LENGTH);
}

export function encryptPayload(payload, key = process.env.ENCRYPTION_KEY) {
  const normalizedKey = normalizeKey(key);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, normalizedKey, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    algorithm: ALGORITHM,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    encryptedData: encrypted.toString('hex'),
  };
}

export function decryptPayload({ iv, authTag, encryptedData, algorithm }, key = process.env.ENCRYPTION_KEY) {
  const normalizedKey = normalizeKey(key);
  const decipher = crypto.createDecipheriv(algorithm || ALGORITHM, normalizedKey, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedData, 'hex')),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString('utf8'));
}

export function encryptPayloadToBase64(payload, key = process.env.ENCRYPTION_KEY) {
  const encrypted = encryptPayload(payload, key);
  return Buffer.from(JSON.stringify(encrypted), 'utf8').toString('base64');
}

export function decryptPayloadFromBase64(payload, key = process.env.ENCRYPTION_KEY) {
  const decoded = Buffer.from(payload, 'base64').toString('utf8');
  return decryptPayload(JSON.parse(decoded), key);
}
