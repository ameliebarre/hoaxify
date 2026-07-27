import { z } from 'zod';

export const signupSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(30, 'Username must not exceed 30 characters'),
  email: z
    .transform((value) => String(value).trim().toLowerCase())
    .pipe(z.email()),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(3),
});
