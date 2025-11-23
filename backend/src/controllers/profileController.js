import { validationResult } from 'express-validator';
import Profile from '../models/Profile.js';
import Team from '../models/Team.js';
import { generateProfileToken } from '../services/tokenService.js';
import { encryptPayload } from '../utils/encryption.js';

function validationGuard(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
}

export async function listProfiles(req, res) {
  const query = req.user.role === 'admin'
    ? {}
    : { $or: [{ owner: req.user.id }, { sharedWith: req.user.id }] };
  const profiles = await Profile.find(query).lean();
  res.json(profiles);
}

export async function createProfile(req, res) {
  if (!validationGuard(req, res)) return;
  const ownerId = req.user.role === 'admin' && req.body.owner ? req.body.owner : req.user.id;
  const profile = await Profile.create({ ...req.body, owner: ownerId });
  res.status(201).json(profile);
}

export async function getProfile(req, res) {
  const baseQuery = req.user.role === 'admin'
    ? { _id: req.params.id }
    : { _id: req.params.id, $or: [{ owner: req.user.id }, { sharedWith: req.user.id }] };
  const profile = await Profile.findOne(baseQuery);
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.json(profile);
}

export async function updateProfile(req, res) {
  if (!validationGuard(req, res)) return;
  const query = req.user.role === 'admin'
    ? { _id: req.params.id }
    : { _id: req.params.id, owner: req.user.id };
  const profile = await Profile.findOneAndUpdate(query, req.body, { new: true });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.json(profile);
}

export async function deleteProfile(req, res) {
  const query = req.user.role === 'admin'
    ? { _id: req.params.id }
    : { _id: req.params.id, owner: req.user.id };
  const profile = await Profile.findOneAndDelete(query);
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.json({ message: 'Profile removed' });
}

export async function cloneProfile(req, res) {
  const query = req.user.role === 'admin'
    ? { _id: req.params.id }
    : { _id: req.params.id, owner: req.user.id };
  const profile = await Profile.findOne(query);
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  const cloned = profile.toObject();
  delete cloned._id;
  cloned.name = `${cloned.name} (Clone)`;
  const ownerId = req.user.role === 'admin' && req.body?.owner ? req.body.owner : req.user.id;
  const newProfile = await Profile.create({ ...cloned, owner: ownerId });
  res.status(201).json(newProfile);
}

export async function syncProfile(req, res) {
  const query = req.user.role === 'admin'
    ? { _id: req.params.id }
    : { _id: req.params.id, owner: req.user.id };
  const profile = await Profile.findOne(query);
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
  const profileQuery = req.user.role === 'admin'
    ? { _id: req.params.id }
    : { _id: req.params.id, owner: req.user.id };
  const profile = await Profile.findOne(profileQuery);
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  profile.team = team.id;
  team.sharedProfiles.addToSet(profile.id);
  await Promise.all([profile.save(), team.save()]);
  res.json({ message: 'Profile shared with team', profile });
}

export async function issueProfileToken(req, res) {
  const profile = await Profile.findOne({ _id: req.params.id, owner: req.user.id }).lean();
  if (!profile) return res.status(404).json({ message: 'Profile not found' });

  if (req.user.role !== 'client') {
    return res.status(403).json({ message: 'Only clients can request profile tokens' });
  }

  const expiresIn = process.env.PROFILE_TOKEN_EXPIRY || '30m';
  const token = generateProfileToken({
    profileId: profile._id.toString(),
    owner: req.user.id,
    scope: 'profile:self',
  }, expiresIn);

  return res.json({ profileId: profile._id, token, expiresIn });
}
