import { validationResult } from 'express-validator';
import Profile from '../models/Profile.js';
import Team from '../models/Team.js';
import { encryptPayload } from '../utils/encryption.js';
import { generateProfileAccessToken } from '../services/tokenService.js';

function validationGuard(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
}

export async function listProfiles(req, res) {
  const profiles = await Profile.find({ $or: [{ owner: req.user.id }, { sharedWith: req.user.id }] }).lean();
  res.json(profiles);
}

export async function createProfile(req, res) {
  if (!validationGuard(req, res)) return;
  const profile = await Profile.create({ ...req.body, owner: req.user.id });
  res.status(201).json(profile);
}

export async function getProfile(req, res) {
  const profile = await Profile.findOne({ _id: req.params.id, $or: [{ owner: req.user.id }, { sharedWith: req.user.id }] });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.json(profile);
}

export async function updateProfile(req, res) {
  if (!validationGuard(req, res)) return;
  const profile = await Profile.findOneAndUpdate({ _id: req.params.id, owner: req.user.id }, req.body, { new: true });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.json(profile);
}

export async function deleteProfile(req, res) {
  const profile = await Profile.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.json({ message: 'Profile removed' });
}

export async function cloneProfile(req, res) {
  const profile = await Profile.findOne({ _id: req.params.id, owner: req.user.id });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  const cloned = profile.toObject();
  delete cloned._id;
  cloned.name = `${cloned.name} (Clone)`;
  const newProfile = await Profile.create({ ...cloned, owner: req.user.id });
  res.status(201).json(newProfile);
}

export async function syncProfile(req, res) {
  const profile = await Profile.findOne({ _id: req.params.id, owner: req.user.id });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  const encrypted = encryptPayload(req.body.data || profile);
  profile.cloudSync = {
    ...encrypted,
    bucket: process.env.AWS_BUCKET,
    lastSyncedAt: new Date(),
  };
  await profile.save();
  res.json({ message: 'Profile synced securely', cloudSync: profile.cloudSync });
}

export async function shareProfile(req, res) {
  if (!validationGuard(req, res)) return;
  const team = await Team.findOne({ _id: req.body.teamId, members: { $elemMatch: { user: req.user.id } } });
  if (!team) return res.status(403).json({ message: 'Team not found or unauthorized' });
  const profile = await Profile.findOne({ _id: req.params.id, owner: req.user.id });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  profile.team = team.id;
  team.sharedProfiles.addToSet(profile.id);
  await Promise.all([profile.save(), team.save()]);
  res.json({ message: 'Profile shared with team', profile });
}

export async function issueClientProfileToken(req, res) {
  const profile = await Profile.findOne({ _id: req.params.id, owner: req.user.id }).select('_id owner');
  if (!profile) return res.status(404).json({ message: 'Profile not found' });

  const token = generateProfileAccessToken({
    sub: req.user.id,
    profileId: profile.id,
    role: 'client',
    scope: 'profile:read',
  });

  res.json({
    token,
    profileId: profile.id,
    expiresIn: process.env.PROFILE_TOKEN_EXPIRY || '30m',
  });
}
