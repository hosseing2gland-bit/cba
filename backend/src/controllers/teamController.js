import { validationResult } from 'express-validator';
import Team from '../models/Team.js';
import { ensureTeamRole } from '../utils/authorization.js';

function validate(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
}

export async function listTeams(req, res) {
  const teams = await Team.find({ members: { $elemMatch: { user: req.user.id } } }).lean();
  res.json(teams);
}

export async function createTeam(req, res) {
  if (!validate(req, res)) return;
  const team = await Team.create({
    name: req.body.name,
    owner: req.user.id,
    members: [{ user: req.user.id, role: 'owner' }],
  });
  res.status(201).json(team);
}

export async function addMember(req, res) {
  if (!validate(req, res)) return;
  const team = await Team.findById(req.params.teamId);
  if (!team) return res.status(404).json({ message: 'Team not found' });
  const canManage = ensureTeamRole(team, req.user.id, ['owner', 'admin']);
  if (!canManage) return res.status(403).json({ message: 'Forbidden' });
  const exists = team.members.some((member) => member.user.toString() === req.body.userId);
  if (!exists) team.members.push({ user: req.body.userId, role: req.body.role || 'member' });
  await team.save();
  res.json(team);
}

export async function shareProfileWithTeam(req, res) {
  if (!validate(req, res)) return;
  const team = await Team.findOne({ _id: req.params.teamId, members: { $elemMatch: { user: req.user.id } } });
  if (!team) return res.status(404).json({ message: 'Team not found or unauthorized' });
  const canShare = ensureTeamRole(team, req.user.id, ['owner', 'admin']);
  if (!canShare) return res.status(403).json({ message: 'Forbidden' });
  team.sharedProfiles.addToSet(req.body.profileId);
  await team.save();
  res.json(team);
}
