import { z } from 'zod';

import { withMaxBytes } from '@modules/auth/presentation/validators/password.schema';

export const loginSchema = z.object({
  email: z.email(),
  password: withMaxBytes(z.string().min(3)),
});

export type LoginInput = z.infer<typeof loginSchema>;
