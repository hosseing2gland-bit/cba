import mongoose from 'mongoose';

const signatureSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
  fingerprint: { type: mongoose.Schema.Types.ObjectId, ref: 'Fingerprint' },
  algorithm: { type: String, default: 'sha256' },
  value: { type: String, required: true },
  issuedAt: { type: Date, default: Date.now },
  expiresAt: Date,
  purpose: { type: String, default: 'profile-verification' },
}, {
  timestamps: true,
});

const Signature = mongoose.model('Signature', signatureSchema);
export default Signature;
