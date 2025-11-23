import { Router } from 'express';
import { body, param } from 'express-validator';
import { addMember, createTeam, listTeams, shareProfileWithTeam } from '../controllers/teamController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const teamId = param('teamId').isMongoId();

router.use(requireAuth);
router.get('/', listTeams);
router.post('/', [body('name').isLength({ min: 3 })], createTeam);
router.post('/:teamId/members', [teamId, body('userId').isMongoId()], addMember);
router.post('/:teamId/share-profile', [teamId, body('profileId').isMongoId()], shareProfileWithTeam);

export default router;
