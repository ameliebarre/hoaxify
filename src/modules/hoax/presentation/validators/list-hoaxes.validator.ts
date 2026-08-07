import { z } from 'zod';

export const listHoaxesQuerySchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(100).default(10),
  userId: z.coerce.number().int().positive().optional(),
});

export type ListHoaxesQuery = z.infer<typeof listHoaxesQuerySchema>;