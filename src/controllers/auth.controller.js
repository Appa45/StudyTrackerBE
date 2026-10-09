import { OAuth2Client } from 'google-auth-library';

import {
  loginSchema,
  registerSchema,
} from '../validators/auth.validator.js';

import {
  loginUser,
  registerUser,
  googleLoginUser,
} from '../services/auth.service.js';

import { publicUser } from '../utils/sanitize.js';

const COOKIE_NAME = 'studytrack_token';

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

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

// Google login
export async function googleLogin(req, res) {
  const { credential } = req.body || {};

  if (!credential || typeof credential !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Google credential is required.',
    });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    console.error('GOOGLE_CLIENT_ID is not configured.');

    return res.status(500).json({
      success: false,
      message: 'Google login is not configured.',
    });
  }

  let payload;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    payload = ticket.getPayload();
  } catch (error) {
    console.error(
      'Google credential verification failed:',
      error instanceof Error ? error.message : 'Unknown error'
    );

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired Google credential.',
    });
  }

  if (
    !payload?.sub ||
    !payload.email ||
    payload.email_verified !== true
  ) {
    return res.status(401).json({
      success: false,
      message: 'Google account verification failed.',
    });
  }

  // This service must find or create the user and generate
  // a StudyTrack JWT using the same logic as regular login.
  const result = await googleLoginUser({
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name || payload.email.split('@')[0],
    picture: payload.picture || '',
  });

  setAuthCookie(res, result.token);

  return res.status(200).json({
    success: true,
    message: 'Google login successful.',
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