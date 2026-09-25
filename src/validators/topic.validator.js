import { z } from 'zod';

const difficulty = z.enum(['Beginner', 'Intermediate', 'Advanced']);
const status = z.enum(['Not Started', 'In Progress', 'Completed']);

export const createTopicSchema = z.object({
  title: z.string().trim().min(3).max(100),
  subject: z.string().trim().min(1).max(60),
  difficulty,
  description: z.string().trim().max(500).optional().default(''),
  progress: z.number().int().min(0).max(100).optional().default(0),
  targetDate: z.coerce.date(),
  status: status.optional().default('Not Started')
});

export const updateTopicSchema = createTopicSchema.partial();

export const topicQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  subject: z.string().trim().max(60).optional(),
  difficulty: difficulty.optional(),
  status: status.optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10)
});
