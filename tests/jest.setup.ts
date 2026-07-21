import 'reflect-metadata';

import { container } from '../src/composition-root';
import { pool } from '../src/db';

beforeEach(() => {
  container.reset();
});

afterAll(async () => {
  await pool.end();
});
