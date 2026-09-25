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
import { publicUser } from '../utils/sanitize.js';

export async function get(req, res) {
  const settings = await getSettings(req.userId);
  res.json({ success: true, settings });
}

export async function profile(req, res) {
  const input = profileSchema.parse(req.body);
  const user = await updateProfile(req.userId, input);
  res.json({ success: true, message: 'Profile updated successfully.', user: publicUser(user) });
}

export async function preferences(req, res) {
  const input = preferencesSchema.parse(req.body);
  const user = await updatePreferences(req.userId, input);
  res.json({ success: true, message: 'Preferences updated successfully.', user: publicUser(user) });
}

export async function notifications(req, res) {
  const input = notificationsSchema.parse(req.body);
  const user = await updateNotifications(req.userId, input);
  res.json({ success: true, message: 'Notification settings updated successfully.', user: publicUser(user) });
}
