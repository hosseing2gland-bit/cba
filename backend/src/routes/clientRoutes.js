import { Router } from 'express';
import { param } from 'express-validator';
import { getClientProfileView } from '../controllers/profileController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/profile/:id?', param('id').optional().isMongoId(), getClientProfileView);

export default router;
