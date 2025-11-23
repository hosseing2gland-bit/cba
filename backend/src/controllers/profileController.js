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

async function createFingerprintForProfile(fingerprintPayload, ownerId) {
  if (!fingerprintPayload) return null;
  return Fingerprint.create({ ...fingerprintPayload, owner: ownerId });
}

async function createSignatureForProfile(signaturePayload, ownerId, profileId, fingerprintId) {
  if (!signaturePayload) return null;
  const signature = await Signature.create({
    ...signaturePayload,
    owner: ownerId,
    profile: profileId,
    fingerprint: fingerprintId,
  });
  return signature;
}

export async function listProfiles(req, res) {
  const profiles = await Profile.find({ $or: [{ owner: req.user.id }, { sharedWith: req.user.id }] }).lean();
  res.json(profiles);
}

export async function createProfile(req, res) {
  if (!validationGuard(req, res)) return;
  const { fingerprint, signature, ...payload } = req.body;
  const fingerprintDoc = await createFingerprintForProfile(fingerprint, req.user.id);
  const profile = await Profile.create({
    ...payload,
    owner: req.user.id,
    fingerprint: fingerprintDoc?.id,
    fingerprintSnapshot: fingerprintDoc ? fingerprint : undefined,
  });
  const signatureDoc = await createSignatureForProfile(signature, req.user.id, profile.id, fingerprintDoc?.id);
  if (signatureDoc) {
    profile.signature = signatureDoc.id;
    await profile.save();
    await profile.populate(['fingerprint', 'signature']);
  }
  res.status(201).json(profile);
}

export async function adminCreateProfile(req, res) {
  if (!validationGuard(req, res)) return;
  const ownerId = req.body.ownerId || req.user.id;
  const { fingerprint, signature, ...payload } = req.body;
  const fingerprintDoc = await createFingerprintForProfile(fingerprint, ownerId);
  const profile = await Profile.create({
    ...payload,
    owner: ownerId,
    fingerprint: fingerprintDoc?.id,
    fingerprintSnapshot: fingerprintDoc ? fingerprint : undefined,
  });
  const signatureDoc = await createSignatureForProfile(signature, ownerId, profile.id, fingerprintDoc?.id);
  if (signatureDoc) {
    profile.signature = signatureDoc.id;
    await profile.save();
  }
  const populated = await Profile.findById(profile.id).populate(['owner', 'fingerprint', 'signature']);
  res.status(201).json(populated);
}

export async function getProfile(req, res) {
  const profile = await Profile.findOne({ _id: req.params.id, $or: [{ owner: req.user.id }, { sharedWith: req.user.id }] });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.json(profile);
}

export async function updateProfile(req, res) {
  if (!validationGuard(req, res)) return;
  const { fingerprint, signature, ...payload } = req.body;
  const profile = await Profile.findOne({ _id: req.params.id, owner: req.user.id });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  if (fingerprint) {
    const fingerprintDoc = await createFingerprintForProfile(fingerprint, req.user.id);
    profile.fingerprint = fingerprintDoc?.id;
    profile.fingerprintSnapshot = fingerprint;
  }
  Object.assign(profile, payload);
  await profile.save();
  if (signature) {
    const signatureDoc = await createSignatureForProfile(signature, req.user.id, profile.id, profile.fingerprint);
    profile.signature = signatureDoc?.id;
    await profile.save();
  }
  await profile.populate(['fingerprint', 'signature']);
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

export async function getClientProfileView(req, res) {
  if (!validationGuard(req, res)) return;
  const profileId = req.params.id;
  const query = { owner: req.user.id };
  if (profileId) query._id = profileId;
  const profile = await Profile.findOne(query).populate(['fingerprint', 'signature']);
  if (!profile) return res.status(404).json({ message: 'Profile not found' });

  const response = {
    id: profile.id,
    name: profile.name,
    description: profile.description,
    timezone: profile.timezone,
    language: profile.language,
    proxy: profile.proxy ? {
      type: profile.proxy.type,
      host: profile.proxy.host,
      port: profile.proxy.port,
    } : undefined,
    fingerprint: profile.fingerprint ? {
      userAgent: profile.fingerprint.userAgent,
      canvas: profile.fingerprint.canvas,
      webgl: profile.fingerprint.webgl,
      audio: profile.fingerprint.audio,
      timezone: profile.fingerprint.timezone,
      language: profile.fingerprint.language,
      screen: profile.fingerprint.screen,
    } : profile.fingerprintSnapshot,
    signature: profile.signature ? {
      value: profile.signature.value,
      algorithm: profile.signature.algorithm,
      issuedAt: profile.signature.issuedAt,
      expiresAt: profile.signature.expiresAt,
      purpose: profile.signature.purpose,
    } : undefined,
  };

  res.json(response);
}
