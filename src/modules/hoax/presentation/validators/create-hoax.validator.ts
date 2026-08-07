import { z } from 'zod';

export const createHoaxSchema = z.object({
  content: z
    .string()
    .min(10, 'Content must be at least 10 characters long')
    .max(5000, 'Content must not exceed 5000 characters'),
});

export type CreateHoaxInput = z.infer<typeof createHoaxSchema>;