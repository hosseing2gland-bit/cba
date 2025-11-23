import { Router } from 'express';
import { body, param } from 'express-validator';
import { addMember, createTeam, listTeams, shareProfileWithTeam } from '../controllers/teamController.js';
import { requireAuth } from '../middleware/auth.js';
import { validationChain } from '../middleware/validation.js';
import { wrapAsync } from '../utils/errorHandlers.js';

const router = Router();
const teamId = param('teamId').trim().isMongoId().withMessage('شناسه تیم نامعتبر است');

router.use(requireAuth);
router.get('/', wrapAsync(listTeams));
router.post('/', validationChain([body('name').trim().isLength({ min: 3, max: 128 }).withMessage('نام تیم حداقل ۳ کاراکتر است').escape()]), wrapAsync(createTeam));
router.post(
  '/:teamId/members',
  validationChain([
    teamId,
    body('userId').trim().isMongoId().withMessage('شناسه کاربر نامعتبر است'),
    body('role').optional().isIn(['owner', 'editor', 'viewer']).withMessage('نقش نامعتبر است'),
  ]),
  wrapAsync(addMember),
);
router.post(
  '/:teamId/share-profile',
  validationChain([teamId, body('profileId').trim().isMongoId().withMessage('شناسه پروفایل نامعتبر است')]),
  wrapAsync(shareProfileWithTeam),
);

export default router;
