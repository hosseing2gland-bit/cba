import Profile from '../models/Profile.js';
import Team from '../models/Team.js';
import { encryptPayload } from '../utils/encryption.js';
import { ApiError, ERROR_CODES } from '../utils/errors.js';
import logger from '../utils/logger.js';

export async function listProfiles(req, res, next) {
  try {
    const profiles = await Profile.find({ $or: [{ owner: req.user.id }, { sharedWith: req.user.id }] }).lean();
    res.json(profiles);
  } catch (error) {
    next(error);
  }
}

export async function createProfile(req, res, next) {
  try {
    const profile = await Profile.create({ ...req.validated, owner: req.user.id });
    logger.info({ userId: req.user.id, profileId: profile.id, requestId: req.id }, 'Profile created');
    res.status(201).json(profile);
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req, res, next) {
  try {
    const { id } = req.validated;
    const profile = await Profile.findOne({ _id: id, $or: [{ owner: req.user.id }, { sharedWith: req.user.id }] });
    if (!profile) throw new ApiError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'پروفایل یافت نشد');
    res.json(profile);
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { id, ...payload } = req.validated;
    const profile = await Profile.findOneAndUpdate({ _id: id, owner: req.user.id }, payload, { new: true });
    if (!profile) throw new ApiError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'پروفایل یافت نشد');
    logger.info({ userId: req.user.id, profileId: id, requestId: req.id }, 'Profile updated');
    res.json(profile);
  } catch (error) {
    next(error);
  }
}

export async function deleteProfile(req, res, next) {
  try {
    const { id } = req.validated;
    const profile = await Profile.findOneAndDelete({ _id: id, owner: req.user.id });
    if (!profile) throw new ApiError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'پروفایل یافت نشد');
    logger.info({ userId: req.user.id, profileId: id, requestId: req.id }, 'Profile removed');
    res.json({ message: 'پروفایل حذف شد' });
  } catch (error) {
    next(error);
  }
}

export async function cloneProfile(req, res, next) {
  try {
    const { id } = req.validated;
    const profile = await Profile.findOne({ _id: id, owner: req.user.id });
    if (!profile) throw new ApiError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'پروفایل یافت نشد');
    const cloned = profile.toObject();
    delete cloned._id;
    cloned.name = `${cloned.name} (Clone)`;
    const newProfile = await Profile.create({ ...cloned, owner: req.user.id });
    logger.info({ userId: req.user.id, profileId: newProfile.id, sourceProfile: id, requestId: req.id }, 'Profile cloned');
    res.status(201).json(newProfile);
  } catch (error) {
    next(error);
  }
}

export async function syncProfile(req, res, next) {
  try {
    const { id, data } = req.validated;
    const profile = await Profile.findOne({ _id: id, owner: req.user.id });
    if (!profile) throw new ApiError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'پروفایل یافت نشد');
    const encrypted = encryptPayload(data || profile.toObject());
    profile.cloudSync = {
      ...encrypted,
      bucket: process.env.AWS_BUCKET,
      lastSyncedAt: new Date(),
    };
    await profile.save();
    logger.info({ userId: req.user.id, profileId: id, requestId: req.id }, 'Profile synced');
    res.json({ message: 'پروفایل با موفقیت همگام شد', cloudSync: profile.cloudSync });
  } catch (error) {
    next(error);
  }
}

export async function shareProfile(req, res, next) {
  try {
    const { id, teamId } = req.validated;
    const team = await Team.findOne({ _id: teamId, members: { $elemMatch: { user: req.user.id } } });
    if (!team) throw new ApiError(403, ERROR_CODES.PERMISSION_DENIED, 'تیم یافت نشد یا مجوز ندارید');
    const profile = await Profile.findOne({ _id: id, owner: req.user.id });
    if (!profile) throw new ApiError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'پروفایل یافت نشد');
    profile.team = team.id;
    team.sharedProfiles.addToSet(profile.id);
    await Promise.all([profile.save(), team.save()]);
    logger.info({ userId: req.user.id, profileId: id, teamId, requestId: req.id }, 'Profile shared with team');
    res.json({ message: 'پروفایل با تیم به اشتراک گذاشته شد', profile });
  } catch (error) {
    next(error);
  }
}
