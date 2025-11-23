import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  cloneProfile,
  createProfile,
  deleteProfile,
  getProfile,
  listProfiles,
  shareProfile,
  syncProfile,
  updateProfile,
} from '../controllers/profileController.js';
import { requireAuth } from '../middleware/auth.js';
import { validationChain } from '../middleware/validation.js';
import { wrapAsync } from '../utils/errorHandlers.js';

const router = Router();
const idParam = param('id').trim().isMongoId().withMessage('شناسه معتبر نیست');

function buildProfileValidators({ optional = false } = {}) {
  const maybeOptional = (rule) => (optional ? rule.optional({ values: 'undefined' }) : rule);
  return [
    maybeOptional(body('name').trim().isLength({ min: 2, max: 128 }).withMessage('نام پروفایل حداقل ۲ کاراکتر است').escape()),
    maybeOptional(body('description').optional().trim().isLength({ max: 512 }).withMessage('توضیحات حداکثر ۵۱۲ کاراکتر').escape()),
    maybeOptional(body('proxy.type').optional().isIn(['http', 'https', 'socks4', 'socks5']).withMessage('نوع پروکسی نامعتبر است')),
    maybeOptional(body('proxy.host').optional().trim().isLength({ min: 1, max: 255 }).withMessage('هاست پروکسی الزامی است').escape()),
    maybeOptional(body('proxy.port').optional().isInt({ min: 1, max: 65535 }).toInt().withMessage('پورت پروکسی نامعتبر است')),
    maybeOptional(body('proxy.username').optional().trim().isLength({ max: 128 }).escape()),
    maybeOptional(body('proxy.password').optional().trim().isLength({ max: 128 })),
    maybeOptional(body('fingerprint.canvas').optional().trim().isLength({ max: 32 }).escape()),
    maybeOptional(body('fingerprint.webgl').optional().trim().isLength({ max: 32 }).escape()),
    maybeOptional(body('fingerprint.audio').optional().trim().isLength({ max: 32 }).escape()),
    maybeOptional(body('timezone').optional().trim().isLength({ min: 2, max: 64 }).escape()),
    maybeOptional(body('language').optional().trim().isLength({ min: 2, max: 12 }).toLowerCase()),
    maybeOptional(body('geolocation.latitude').optional().isFloat({ min: -90, max: 90 }).toFloat()),
    maybeOptional(body('geolocation.longitude').optional().isFloat({ min: -180, max: 180 }).toFloat()),
    maybeOptional(body('geolocation.accuracy').optional().isFloat({ min: 0, max: 5000 }).toFloat()),
  ];
}

router.use(requireAuth);
router.get('/', wrapAsync(listProfiles));
router.post('/', validationChain(buildProfileValidators()), wrapAsync(createProfile));
router.get('/:id', validationChain([idParam]), wrapAsync(getProfile));
router.put('/:id', validationChain([idParam, ...buildProfileValidators({ optional: true })]), wrapAsync(updateProfile));
router.delete('/:id', validationChain([idParam]), wrapAsync(deleteProfile));
router.post('/:id/clone', validationChain([idParam]), wrapAsync(cloneProfile));
router.post('/:id/sync', validationChain([idParam, body('data').optional().isObject().withMessage('داده همگام‌سازی نامعتبر است')]), wrapAsync(syncProfile));
router.post('/:id/share', validationChain([idParam, body('teamId').trim().isMongoId().withMessage('شناسه تیم نامعتبر است')]), wrapAsync(shareProfile));

export default router;
