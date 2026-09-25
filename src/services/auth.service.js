import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { signAuthToken } from '../utils/jwt.js';
import { publicUser } from '../utils/sanitize.js';

export async function registerUser({ name, email, password }) {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('An account with this email already exists.');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });
  const token = signAuthToken({ userId: user._id.toString(), role: user.role });

  return { token, user: publicUser(user) };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash');

  // Deliberately use the same message for missing users and wrong passwords.
  // This avoids exposing which email addresses are registered.
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const token = signAuthToken({ userId: user._id.toString(), role: user.role });
  return { token, user: publicUser(user) };
}
