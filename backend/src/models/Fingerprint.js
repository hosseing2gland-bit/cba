import mongoose from 'mongoose';

export const fingerprintSnapshotSchema = new mongoose.Schema({
  userAgent: String,
  platform: String,
  language: String,
  timezone: String,
  screenResolution: String,
  plugins: [String],
  canvas: { type: String, default: 'noise' },
  webgl: { type: String, default: 'noise' },
  audio: { type: String, default: 'noise' },
}, { _id: false });

const fingerprintSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userAgent: String,
  platform: String,
  language: String,
  timezone: String,
  screenResolution: String,
  plugins: [String],
  canvas: String,
  webgl: String,
  audio: String,
  integrityHash: String,
}, {
  timestamps: true,
});

const Fingerprint = mongoose.model('Fingerprint', fingerprintSchema);
export default Fingerprint;
