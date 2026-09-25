import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { overview } from '../controllers/dashboard.controller.js';

const router = Router();
router.use(requireAuth);
router.get('/overview', asyncHandler(overview));

export default router;
