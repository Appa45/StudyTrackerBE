import { z } from 'zod';

export const explainSchema = z.object({
  question: z.string().trim().min(3).max(2000),
  topicId: z.string().trim().optional(),
  topic: z.string().trim().max(100).optional()
});
