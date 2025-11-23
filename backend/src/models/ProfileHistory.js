import mongoose from 'mongoose';

const profileHistorySchema = new mongoose.Schema({
  profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  version: { type: Number, required: true },
  snapshot: { type: Object, required: true },
  action: { type: String, enum: ['create', 'update', 'clone', 'sync', 'share'], required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  metadata: { type: Object },
}, {
  timestamps: true,
});

profileHistorySchema.index({ profile: 1, version: -1 }, { unique: true });

const ProfileHistory = mongoose.model('ProfileHistory', profileHistorySchema);
export default ProfileHistory;
