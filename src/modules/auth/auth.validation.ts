import { z } from 'zod';

export const signupSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(30, 'Username must not exceed 30 characters'),
  email: z.email('Please provide a valid email address').trim().toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});
