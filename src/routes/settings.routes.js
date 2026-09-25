import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { get, notifications, preferences, profile } from '../controllers/settings.controller.js';

const router = Router();
router.use(requireAuth);
router.get('/', asyncHandler(get));
router.patch('/profile', asyncHandler(profile));
router.patch('/preferences', asyncHandler(preferences));
router.patch('/notifications', asyncHandler(notifications));

export default router;
