import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';
import { login, logout, me, register,googleLogin } from '../controllers/auth.controller.js';
import {
  forgotPassword,
  resetPasswordController,
} from "../controllers/passwordReset.controller.js";
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/google', asyncHandler(googleLogin));
router.post('/register', authRateLimiter, asyncHandler(register));
router.post('/login', authRateLimiter, asyncHandler(login));
router.post('/logout', requireAuth, asyncHandler(logout));
router.get('/me', requireAuth, asyncHandler(me));
router.post(
  "/forgot-password",
  asyncHandler(forgotPassword)
);

router.post(
  "/reset-password",
  asyncHandler(resetPasswordController)
);


export default router;
