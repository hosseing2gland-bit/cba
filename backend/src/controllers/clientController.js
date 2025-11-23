import Profile from '../models/Profile.js';

export async function getClientProfile(req, res) {
  const profile = await Profile.findOne({ owner: req.user.id })
    .populate('fingerprintRef')
    .populate('signature', 'algorithm signature createdAt');

  if (!profile) {
    return res.status(404).json({ message: 'Profile not found for this client' });
  }

  res.json({
    message: 'Client profile retrieved',
    profile: {
      id: profile.id,
      name: profile.name,
      fingerprint: profile.fingerprint || profile.fingerprintRef,
      signature: profile.signature,
      updatedAt: profile.updatedAt,
    },
  });
}
