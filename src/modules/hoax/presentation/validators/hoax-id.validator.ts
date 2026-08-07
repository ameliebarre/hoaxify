import { z } from 'zod';

export const hoaxIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type HoaxIdParam = z.infer<typeof hoaxIdParamSchema>;
