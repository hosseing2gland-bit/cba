import mongoose from 'mongoose';

const screenSchema = new mongoose.Schema({
  width: Number,
  height: Number,
  pixelRatio: Number,
}, { _id: false });

const fingerprintSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userAgent: String,
  timezone: String,
  language: String,
  canvas: { type: String, default: 'noise' },
  webgl: { type: String, default: 'noise' },
  audio: { type: String, default: 'noise' },
  fonts: [String],
  plugins: [String],
  platform: String,
  screen: screenSchema,
  geolocation: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
  },
}, {
  timestamps: true,
});

const Fingerprint = mongoose.model('Fingerprint', fingerprintSchema);
export default Fingerprint;
