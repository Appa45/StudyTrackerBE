import rateLimit from 'express-rate-limit';

// Tight limit for login/register to slow down brute-force attempts.
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, error: 'Too many authentication attempts. Try again later.' }
});

// AI calls can be expensive, so keep this endpoint stricter.
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, error: 'AI request limit reached. Please wait a moment.' }
});
