import 'reflect-metadata';

import { container } from '../src/composition-root';
import { pool } from '../src/infrastructure/database';

beforeEach(() => {
  container.reset();
});

afterAll(async () => {
  await pool.end();
});
