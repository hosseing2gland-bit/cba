import { validationResult } from 'express-validator';
import Profile from '../models/Profile.js';
import Team from '../models/Team.js';
import { enqueueTask } from '../utils/taskQueue.js';
import { authorizeProfileAction } from '../utils/authorization.js';
import { recordProfileHistory } from '../services/historyService.js';
import { syncProfileSnapshot } from '../services/storageService.js';

function validationGuard(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
}

export async function listProfiles(req, res) {
  const teamIds = await Team.find({ members: { $elemMatch: { user: req.user.id } } }).distinct('_id');
  const profiles = await Profile.find({
    $or: [
      { owner: req.user.id },
      { sharedWith: req.user.id },
      { team: { $in: teamIds } },
    ],
  }).lean();
  res.json(profiles);
}

export async function createProfile(req, res) {
  if (!validationGuard(req, res)) return;
  const profile = await Profile.create({ ...req.body, owner: req.user.id });
  await recordProfileHistory(profile, 'create', req.user.id);
  res.status(201).json(profile);
}

export async function getProfile(req, res) {
  const teamIds = await Team.find({ members: { $elemMatch: { user: req.user.id } } }).distinct('_id');
  const profile = await Profile.findOne({
    _id: req.params.id,
    $or: [
      { owner: req.user.id },
      { sharedWith: req.user.id },
      { team: { $in: teamIds } },
    ],
  });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.json(profile);
}

export async function updateProfile(req, res) {
  if (!validationGuard(req, res)) return;
  const profile = await Profile.findOneAndUpdate({ _id: req.params.id, owner: req.user.id }, req.body, { new: true });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  profile.version += 1;
  await profile.save();
  await recordProfileHistory(profile, 'update', req.user.id);
  res.json(profile);
}

export async function deleteProfile(req, res) {
  const profile = await Profile.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.json({ message: 'Profile removed' });
}

export async function cloneProfile(req, res) {
  const profile = await Profile.findById(req.params.id);
  const auth = await authorizeProfileAction(profile, req.user, 'clone');
  if (!auth.allowed) return res.status(auth.status || 403).json({ message: auth.reason });

  const { result } = await enqueueTask('clone-profile', async () => {
    const cloned = profile.toObject();
    delete cloned._id;
    delete cloned.createdAt;
    delete cloned.updatedAt;
    cloned.name = `${cloned.name} (Clone)`;
    const newProfile = await Profile.create({ ...cloned, owner: req.user.id, version: 1 });
    await recordProfileHistory(newProfile, 'clone', req.user.id, { sourceProfile: profile.id });
    return newProfile;
  });

  res.status(201).json(result);
}

export async function syncProfile(req, res) {
  const profile = await Profile.findById(req.params.id);
  const auth = await authorizeProfileAction(profile, req.user, 'sync');
  if (!auth.allowed) return res.status(auth.status || 403).json({ message: auth.reason });

  const { result } = await enqueueTask('sync-profile', async () => {
    const payload = req.body.data || profile.toObject();
    return syncProfileSnapshot(profile, payload);
  });

  const cloudSync = {
    ...result.encrypted,
    provider: process.env.S3_ENDPOINT ? 'minio' : 'aws',
    bucket: result.bucket,
    key: result.key,
    lastSyncedAt: new Date(),
  };

  profile.cloudSync = cloudSync;
  profile.version += 1;
  await profile.save();
  await recordProfileHistory(profile, 'sync', req.user.id, { key: result.key, bucket: result.bucket });
  res.json({ message: 'Profile synced securely', cloudSync });
}

export async function shareProfile(req, res) {
  if (!validationGuard(req, res)) return;
  const team = await Team.findOne({ _id: req.body.teamId, members: { $elemMatch: { user: req.user.id } } });
  if (!team) return res.status(403).json({ message: 'Team not found or unauthorized' });
  const profile = await Profile.findById(req.params.id);
  const auth = await authorizeProfileAction(profile, req.user, 'share');
  if (!auth.allowed) return res.status(auth.status || 403).json({ message: auth.reason });
  const canShare = ['owner', 'admin'].includes(team.members.find((m) => m.user.toString() === req.user.id.toString())?.role);
  if (!canShare) return res.status(403).json({ message: 'Insufficient team permissions to share' });
  profile.team = team.id;
  team.sharedProfiles.addToSet(profile.id);
  await Promise.all([profile.save(), team.save()]);
  await recordProfileHistory(profile, 'share', req.user.id, { teamId: team.id });
  res.json({ message: 'Profile shared with team', profile });
}
