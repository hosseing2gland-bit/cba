import Team from '../models/Team.js';

const ACTION_ROLES = {
  clone: ['owner', 'admin'],
  sync: ['owner', 'admin'],
  share: ['owner', 'admin'],
};

export async function resolveTeamContext(profile, userId) {
  if (!profile.team) return null;
  const team = await Team.findById(profile.team);
  if (!team) return null;
  const membership = team.members.find((member) => member.user.toString() === userId.toString());
  return membership ? { team, membership } : null;
}

export async function authorizeProfileAction(profile, user, action) {
  if (!profile) return { allowed: false, reason: 'Profile not found', status: 404 };
  const isOwner = profile.owner.toString() === user.id.toString();
  if (isOwner) return { allowed: true, isOwner, teamContext: null };

  const teamContext = await resolveTeamContext(profile, user.id);
  if (!teamContext) return { allowed: false, reason: 'Forbidden', status: 403 };
  const allowedRoles = ACTION_ROLES[action] || [];
  const hasRole = allowedRoles.includes(teamContext.membership.role);
  if (!hasRole) return { allowed: false, reason: 'Forbidden', status: 403 };
  return { allowed: true, isOwner: false, teamContext };
}

export function ensureTeamRole(team, userId, roles) {
  const membership = team.members.find((member) => member.user.toString() === userId.toString());
  if (!membership) return false;
  return roles.includes(membership.role);
}
