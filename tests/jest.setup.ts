import 'reflect-metadata';

import { pool } from '../src/infrastructure/database';

afterAll(async () => {
  await pool.end();
});
