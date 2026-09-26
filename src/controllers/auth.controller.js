import {
  loginSchema,
  registerSchema,
} from '../validators/auth.validator.js';

import {
  loginUser,
  registerUser,
} from '../services/auth.service.js';

import { publicUser } from '../utils/sanitize.js';

const COOKIE_NAME = 'studytrack_token';

function setAuthCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export async function register(req, res) {
  const payload = registerSchema.parse(req.body);

  const result = await registerUser(payload);

  setAuthCookie(res, result.token);

  res.status(201).json({
    success: true,
    message: 'Registration successful.',
    user: result.user,
  });
}

export async function login(req, res) {
  const payload = loginSchema.parse(req.body);

  const result = await loginUser(payload);

  setAuthCookie(res, result.token);

  res.json({
    success: true,
    message: 'Login successful.',
    user: result.user,
  });
}

export function logout(req, res) {
  const isProduction = process.env.NODE_ENV === 'production';

  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });

  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
}

export function me(req, res) {
  res.json({
    success: true,
    user: publicUser(req.user),
  });
}