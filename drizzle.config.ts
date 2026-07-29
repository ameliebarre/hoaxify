import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

import env from './src/core/config/env';

export default defineConfig({
  out: './drizzle',
  schema: './src/infrastructure/database/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL!,
  },
});
