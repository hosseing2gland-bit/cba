import Team from '../models/Team.js';
import { ApiError, ERROR_CODES } from '../utils/errors.js';
import logger from '../utils/logger.js';

export async function listTeams(req, res, next) {
  try {
    const teams = await Team.find({ members: { $elemMatch: { user: req.user.id } } }).lean();
    res.json(teams);
  } catch (error) {
    next(error);
  }
}

export async function createTeam(req, res, next) {
  try {
    const { name } = req.validated;
    const team = await Team.create({
      name,
      owner: req.user.id,
      members: [{ user: req.user.id, role: 'owner' }],
    });
    logger.info({ userId: req.user.id, teamId: team.id, requestId: req.id }, 'Team created');
    res.status(201).json(team);
  } catch (error) {
    next(error);
  }
}

export async function addMember(req, res, next) {
  try {
    const { teamId, userId, role } = req.validated;
    const team = await Team.findOne({ _id: teamId, owner: req.user.id });
    if (!team) throw new ApiError(404, ERROR_CODES.RESOURCE_NOT_FOUND, 'تیم یافت نشد');
    const exists = team.members.some((member) => member.user.toString() === userId);
    if (!exists) team.members.push({ user: userId, role: role || 'viewer' });
    await team.save();
    logger.info({ userId: req.user.id, teamId, targetUser: userId, requestId: req.id }, 'Member added to team');
    res.json(team);
  } catch (error) {
    next(error);
  }
}

export async function shareProfileWithTeam(req, res, next) {
  try {
    const { teamId, profileId } = req.validated;
    const team = await Team.findOne({ _id: teamId, members: { $elemMatch: { user: req.user.id } } });
    if (!team) throw new ApiError(403, ERROR_CODES.PERMISSION_DENIED, 'تیم یافت نشد یا مجوز ندارید');
    team.sharedProfiles.addToSet(profileId);
    await team.save();
    logger.info({ userId: req.user.id, teamId, profileId, requestId: req.id }, 'Profile shared to team');
    res.json(team);
  } catch (error) {
    next(error);
  }
}
