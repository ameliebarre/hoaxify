import request from 'supertest';

import app from '@/app';

import db from '@infrastructure/database';
import { usersTable } from '@infrastructure/database/schema';
import { login, signup } from '@modules/auth/__tests__/helpers/auth.helper';


const meUrl = '/api/1.0/auth/me';

describe(`GET ${meUrl}`, () => {
  beforeEach(async () => {
    await db.delete(usersTable);
  });

  describe('when user is authenticated', () => {
    it('returns 200 with current user', async () => {
      await signup({
        username: 'john',
        email: 'john@mail.com',
        password: 'P4ssword',
      });

      const loginResponse = await login({
        email: 'john@mail.com',
        password: 'P4ssword',
      });

      const response = await request(app)
        .get(meUrl)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`);

      expect(response.status).toBe(200);

      expect(response.body).toEqual({
        id: expect.any(Number),
        username: 'john',
        email: 'john@mail.com',
      });

      expect(response.body.password).toBeUndefined();
    });
  });

  describe('when user is not authenticated', () => {
    it('returns 401 without token', async () => {
      const response = await request(app).get(meUrl);

      expect(response.status).toBe(401);
    });

    it('returns 401 with invalid token', async () => {
      const response = await request(app)
        .get(meUrl)
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});
