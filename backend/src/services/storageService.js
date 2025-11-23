import crypto from 'crypto';
import { encryptPayload } from '../utils/encryption.js';

const isTest = process.env.NODE_ENV === 'test' || process.env.STORAGE_DRIVER === 'mock';
let s3Client;
let awsSdk;

async function getAwsSdk() {
  if (awsSdk) return awsSdk;
  // Dynamic import avoids hard dependency when running in mocked test environments
  awsSdk = await import('@aws-sdk/client-s3');
  return awsSdk;
}

async function getClient() {
  if (isTest) return null;
  if (!s3Client) {
    const { S3Client } = await getAwsSdk();
    s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: Boolean(process.env.S3_ENDPOINT),
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
}

export async function syncProfileSnapshot(profile, payload) {
  const bucket = process.env.AWS_BUCKET;
  if (!bucket) throw new Error('AWS_BUCKET is required for sync');
  const encrypted = encryptPayload(payload);
  const body = JSON.stringify(encrypted);
  const key = `profiles/${profile.id}/${Date.now()}.json`;

  if (isTest) {
    return {
      bucket,
      key,
      etag: crypto.createHash('md5').update(body).digest('hex'),
      encrypted,
    };
  }

  const client = await getClient();
  const { PutObjectCommand } = await getAwsSdk();
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: 'application/json',
  }));
  return { bucket, key, encrypted };
}
