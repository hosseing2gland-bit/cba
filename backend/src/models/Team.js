import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' },
}, { _id: false });

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [memberSchema],
  sharedProfiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }],
}, {
  timestamps: true,
});

const LEGACY_ROLE_MAP = {
  owner: 'owner',
  admin: 'admin',
  member: 'member',
  editor: 'admin',
  viewer: 'member',
};

teamSchema.pre('validate', function migrateLegacyRoles(next) {
  if (Array.isArray(this.members)) {
    this.members.forEach((member) => {
      if (!member.role) return;
      const mappedRole = LEGACY_ROLE_MAP[member.role];
      if (mappedRole && mappedRole !== member.role) {
        member.role = mappedRole;
      }
    });
  }
  next();
});

const Team = mongoose.model('Team', teamSchema);
export default Team;
