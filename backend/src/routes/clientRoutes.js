import { Router } from 'express';
import { getClientProfile } from '../controllers/clientController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/profile', getClientProfile);

export default router;
