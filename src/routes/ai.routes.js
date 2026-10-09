import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { aiRateLimiter } from '../middleware/rateLimit.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { explain } from '../controllers/ai.controller.js';
import { googleLogin } from '../controllers/auth.controller.js';

const router = Router();
router.use(requireAuth);
router.post('/explain', aiRateLimiter, asyncHandler(explain));
router.post('/google', asyncHandler(googleLogin));

export default router;
