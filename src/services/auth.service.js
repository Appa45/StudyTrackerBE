import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

import { User } from '../models/User.js';
import { signAuthToken } from '../utils/jwt.js';
import { publicUser } from '../utils/sanitize.js';

export async function registerUser({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    const error = new Error(
      'An account with this email already exists.'
    );
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email: normalizedEmail,
    passwordHash,
  });

  const token = signAuthToken({
    userId: user._id.toString(),
    role: user.role,
  });

  return {
    token,
    user: publicUser(user),
  };
}

export async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select('+passwordHash');

  // Use the same message for missing users and wrong passwords.
  if (
    !user ||
    !user.passwordHash ||
    !(await bcrypt.compare(password, user.passwordHash))
  ) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const token = signAuthToken({
    userId: user._id.toString(),
    role: user.role,
  });

  return {
    token,
    user: publicUser(user),
  };
}

// Google login: find an existing account or create a new one.
export async function googleLoginUser({
  googleId,
  email,
  name,
}) {
  if (!googleId || !email) {
    const error = new Error(
      'Verified Google account information is required.'
    );
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();

  // First, find an account already linked to this Google ID.
  let user = await User.findOne({ googleId });

  if (!user) {
    // If this email already exists, link it to Google only if
    // it has not already been linked to a different Google ID.
    user = await User.findOne({
      email: normalizedEmail,
    });

    if (user) {
      if (user.googleId && user.googleId !== googleId) {
        const error = new Error(
          'This email is linked to another Google account.'
        );
        error.statusCode = 409;
        throw error;
      }

      user.googleId = googleId;
      await user.save();
    } else {
      // Generate a random password hash for accounts that use
      // Google only, allowing schemas that require passwordHash.
      // The random password itself is never stored or returned.
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, 12);

      user = await User.create({
        name: name?.trim() || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        passwordHash,
        googleId,
      });
    }
  }

  // Use the same JWT format as ordinary StudyTrack login.
  const token = signAuthToken({
    userId: user._id.toString(),
    role: user.role,
  });

  return {
    token,
    user: publicUser(user),
  };
}