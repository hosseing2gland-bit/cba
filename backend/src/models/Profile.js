import mongoose from 'mongoose';
import { fingerprintSnapshotSchema } from './Fingerprint.js';

const proxySchema = new mongoose.Schema({
  type: { type: String, enum: ['http', 'https', 'socks4', 'socks5'] },
  host: String,
  port: Number,
  username: String,
  password: String,
}, { _id: false });

const cloudSyncSchema = new mongoose.Schema({
  encryptedData: String,
  iv: String,
  authTag: String,
  provider: { type: String, default: 'aws' },
  bucket: String,
  lastSyncedAt: Date,
}, { _id: false });

const profileSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: String,
  proxy: proxySchema,
  fingerprint: fingerprintSnapshotSchema,
  fingerprintRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Fingerprint' },
  signature: { type: mongoose.Schema.Types.ObjectId, ref: 'Signature' },
  timezone: String,
  language: String,
  geolocation: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
  },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  cloudSync: cloudSyncSchema,
}, {
  timestamps: true,
});

const Profile = mongoose.model('Profile', profileSchema);
export default Profile;
