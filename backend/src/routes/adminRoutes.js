import { Router } from 'express';
import { body } from 'express-validator';
import { adminCreateProfile } from '../controllers/profileController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.post('/profiles', [
  body('ownerId').optional().isMongoId(),
  body('name').isLength({ min: 2 }),
], adminCreateProfile);

export default router;
