import { Router } from 'express';
import { body } from 'express-validator';
import { login, logout, refresh, register } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validationChain } from '../middleware/validation.js';
import { wrapAsync } from '../utils/errorHandlers.js';

const router = Router();

const emailValidator = body('email').trim().isEmail().normalizeEmail().withMessage('ایمیل نامعتبر است');
const passwordValidator = body('password')
  .isLength({ min: 8 })
  .withMessage('رمز عبور باید حداقل ۸ کاراکتر باشد')
  .matches(/[A-Z]/)
  .withMessage('رمز عبور باید شامل حروف بزرگ باشد')
  .matches(/[0-9]/)
  .withMessage('رمز عبور باید شامل اعداد باشد')
  .trim();
const nameValidator = body('name').trim().isLength({ min: 2, max: 64 }).withMessage('نام حداقل ۲ کاراکتر است').escape();

router.post('/register', validationChain([emailValidator, passwordValidator, nameValidator]), wrapAsync(register));
router.post('/login', validationChain([emailValidator, passwordValidator]), wrapAsync(login));
router.post('/refresh', validationChain([body('refreshToken').trim().isString().withMessage('توکن رفرش الزامی است')]), wrapAsync(refresh));
router.post('/logout', requireAuth, validationChain([body('refreshToken').trim().isString().withMessage('توکن رفرش الزامی است')]), wrapAsync(logout));

export default router;
