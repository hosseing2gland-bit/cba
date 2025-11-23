import { validationResult } from 'express-validator';
import Profile from '../models/Profile.js';
import Team from '../models/Team.js';
import Fingerprint from '../models/Fingerprint.js';
import Signature from '../models/Signature.js';
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
  const profiles = await Profile.find({ $or: [{ owner: req.user.id }, { sharedWith: req.user.id }] }).lean();
  res.json(profiles);
}

async function buildFingerprint(ownerId, fingerprintPayload) {
  if (!fingerprintPayload) return { snapshot: undefined, record: undefined };
  const fingerprint = await Fingerprint.create({
    ...fingerprintPayload,
    user: ownerId,
  });
  return { snapshot: fingerprintPayload, record: fingerprint };
}

async function attachSignature(profile, ownerId, signaturePayload) {
  if (!signaturePayload) return profile;
  const signature = await Signature.create({
    ...signaturePayload,
    user: ownerId,
    profile: profile._id,
  });
  profile.signature = signature._id;
  await profile.save();
  return profile.populate('signature');
}

export async function createProfile(req, res) {
  if (!validationGuard(req, res)) return;
  const { fingerprint: fingerprintPayload, signature: signaturePayload, ...profilePayload } = req.body;
  const { snapshot, record } = await buildFingerprint(req.user.id, fingerprintPayload);
  const profile = await Profile.create({
    ...profilePayload,
    owner: req.user.id,
    fingerprint: snapshot,
    fingerprintRef: record?._id,
  });
  const populated = await attachSignature(profile, req.user.id, signaturePayload);
  res.status(201).json(populated);
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

export async function adminCreateProfile(req, res) {
  if (!validationGuard(req, res)) return;
  const { ownerId, fingerprint: fingerprintPayload, signature: signaturePayload, ...profilePayload } = req.body;

  const owner = ownerId || req.user.id;
  const { snapshot, record } = await buildFingerprint(owner, fingerprintPayload);
  const profile = await Profile.create({
    ...profilePayload,
    owner,
    fingerprint: snapshot,
    fingerprintRef: record?._id,
  });
  const populated = await attachSignature(profile, owner, signaturePayload);
  res.status(201).json({
    message: 'Profile created for user',
    profile: populated,
  });
}
