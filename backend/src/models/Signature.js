import mongoose from 'mongoose';

const signatureSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
  algorithm: { type: String, default: 'sha256' },
  signature: { type: String, required: true },
  publicKey: String,
  issuedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

const Signature = mongoose.model('Signature', signatureSchema);
export default Signature;
