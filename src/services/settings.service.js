import { User } from '../models/User.js';

export async function getSettings(userId) {
  const user = await User.findById(userId).lean();
  return {
    name: user.name,
    email: user.email,
    preferences: user.preferences,
    notifications: user.notifications
  };
}

export async function updateProfile(userId, input) {
  // Only allow explicit profile fields.
  const user = await User.findByIdAndUpdate(userId, { $set: input }, { new: true, runValidators: true });
  return user;
}

export async function updatePreferences(userId, input) {
  return User.findByIdAndUpdate(
    userId,
    { $set: Object.fromEntries(Object.entries(input).map(([key, value]) => [`preferences.${key}`, value])) },
    { new: true, runValidators: true }
  );
}

export async function updateNotifications(userId, input) {
  return User.findByIdAndUpdate(
    userId,
    { $set: Object.fromEntries(Object.entries(input).map(([key, value]) => [`notifications.${key}`, value])) },
    { new: true, runValidators: true }
  );
}
