import { Router } from 'express';
import { body } from 'express-validator';
import { login, logout, refresh, register } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const emailValidator = body('email').isEmail();
const passwordValidator = body('password').isLength({ min: 8 }).matches(/[A-Z]/).matches(/[0-9]/);

router.post('/register', [emailValidator, passwordValidator, body('name').isLength({ min: 2 })], register);
router.post('/login', [emailValidator, passwordValidator], login);
router.post('/refresh', [body('refreshToken').isString()], refresh);
router.post('/logout', requireAuth, logout);

export default router;
