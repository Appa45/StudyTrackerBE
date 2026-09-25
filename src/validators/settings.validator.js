import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().email().max(254).optional()
}).refine((value) => Object.keys(value).length > 0, {
  message: 'At least one profile field is required.'
});

export const preferencesSchema = z.object({
  dailyGoal: z.number().int().min(1).max(24).optional(),
  preferredDifficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional()
}).refine((value) => Object.keys(value).length > 0, {
  message: 'At least one preference is required.'
});

export const notificationsSchema = z.object({
  emailUpdates: z.boolean().optional(),
  studyReminders: z.boolean().optional(),
  weeklySummary: z.boolean().optional()
}).refine((value) => Object.keys(value).length > 0, {
  message: 'At least one notification setting is required.'
});
