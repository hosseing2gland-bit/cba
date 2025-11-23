import ProfileHistory from '../models/ProfileHistory.js';

function stripInternalFields(snapshot = {}) {
  const cloned = { ...snapshot };
  delete cloned._id;
  delete cloned.__v;
  return cloned;
}

export async function recordProfileHistory(profile, action, actorId, metadata = {}) {
  if (!profile?._id || !actorId) return null;
  const version = (await ProfileHistory.countDocuments({ profile: profile._id })) + 1;
  const snapshot = stripInternalFields(profile.toObject ? profile.toObject() : profile);
  const history = await ProfileHistory.create({
    profile: profile._id,
    version,
    snapshot,
    action,
    createdBy: actorId,
    metadata,
  });
  return history;
}
