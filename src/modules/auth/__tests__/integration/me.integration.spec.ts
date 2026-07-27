import jwt from 'jsonwebtoken';
import request from 'supertest';

import app from '@/app';

import env from '@core/config/env';
import { authenticate } from '@modules/auth/__tests__/helpers/auth.helper';
import { cleanDatabase } from '@tests/helpers/database';

const meUrl = '/api/1.0/auth/me';

describe(`GET ${meUrl}`, () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('when user is authenticated', () => {
    it('returns 200 with current user', async () => {
      const token = await authenticate();

      const response = await request(app)
        .get(meUrl)
        .set('Authorization', `Bearer ${token}`);

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

  it('returns 401 when Authorization header does not use the Bearer scheme', async () => {
    const token = await authenticate();

    const response = await request(app).get(meUrl).set('Authorization', token);

    expect(response.status).toBe(401);
  });

  it('returns 401 when Bearer token is missing', async () => {
    const response = await request(app)
      .get(meUrl)
      .set('Authorization', 'Bearer');

    expect(response.status).toBe(401);
  });

  it('returns 401 when token has expired', async () => {
    const expiredToken = jwt.sign({ userId: 1 }, env.JWT_SECRET, {
      expiresIn: -1,
    });

    const response = await request(app)
      .get(meUrl)
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
  });

  it('returns 401 when authenticated user no longer exists', async () => {
    const token = await authenticate();

    await cleanDatabase();

    const response = await request(app)
      .get(meUrl)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
  });
});
