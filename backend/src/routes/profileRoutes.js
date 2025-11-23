import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  cloneProfile,
  createProfile,
  deleteProfile,
  issueProfileToken,
  getProfile,
  listProfiles,
  shareProfile,
  syncProfile,
  updateProfile,
} from '../controllers/profileController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
const idParam = param('id').isMongoId();

router.use(requireAuth, requireRole(['client', 'admin']));
router.get('/', listProfiles);
router.post('/', [body('name').isLength({ min: 2 })], createProfile);
router.get('/:id', idParam, getProfile);
router.put('/:id', [idParam, body('name').optional().isLength({ min: 2 })], updateProfile);
router.delete('/:id', idParam, deleteProfile);
router.post('/:id/clone', idParam, cloneProfile);
router.post('/:id/sync', idParam, syncProfile);
router.post('/:id/access-token', idParam, requireRole('client'), issueProfileToken);
router.post('/:id/share', [idParam, body('teamId').isMongoId()], shareProfile);

export default router;
