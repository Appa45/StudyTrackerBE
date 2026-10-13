import {
  notificationsSchema,
  preferencesSchema,
  profileSchema
} from '../validators/settings.validator.js';
import {
  getSettings,
  updateNotifications,
  updatePreferences,
  updateProfile
} from '../services/settings.service.js';

// Express 4 does not catch rejected promises in async handlers.
// Without this, a thrown error (Zod failure, DB error, missing user)
// means NO response is ever sent and the caller waits forever.
// Not needed if you already use Express 5 or the express-async-errors package.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const get = asyncHandler(async (req, res) => {
  const data = await getSettings(req.userId);
  // The Next.js page reads `result.data`
  res.json({ success: true, data });
});

export const profile = asyncHandler(async (req, res) => {
  const input = profileSchema.parse(req.body);
  const data = await updateProfile(req.userId, input);
  res.json({ success: true, message: 'Profile updated successfully.', data });
});

export const preferences = asyncHandler(async (req, res) => {
  const input = preferencesSchema.parse(req.body);
  const data = await updatePreferences(req.userId, input);
  res.json({ success: true, message: 'Preferences updated successfully.', data });
});

export const notifications = asyncHandler(async (req, res) => {
  const input = notificationsSchema.parse(req.body);
  const data = await updateNotifications(req.userId, input);
  res.json({ success: true, message: 'Notification settings updated successfully.', data });
});