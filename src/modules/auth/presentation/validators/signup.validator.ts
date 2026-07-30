import { z } from 'zod';

import { withMaxBytes } from '@modules/auth/presentation/validators/password.schema';

export const signupSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters long')
    .max(30, 'Username must not exceed 30 characters'),
  email: z
    .transform((value) => String(value).trim().toLowerCase())
    .pipe(z.email()),
  password: withMaxBytes(
    z.string().min(8, 'Password must be at least 8 characters long'),
  ),
});

export type SignupInput = z.infer<typeof signupSchema>;
