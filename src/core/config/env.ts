import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().min(1000).default(9000),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  ENV: z
    .union([
      z.literal('development'),
      z.literal('testing'),
      z.literal('production'),
    ])
    .default('development'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
});

const env = envSchema.parse(process.env);

export default env;
export type Env = z.infer<typeof envSchema>;
