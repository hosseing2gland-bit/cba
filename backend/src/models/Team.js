import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['owner', 'editor', 'viewer'], default: 'viewer' },
}, { _id: false });

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [memberSchema],
  sharedProfiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }],
}, {
  timestamps: true,
});

const Team = mongoose.model('Team', teamSchema);
export default Team;
