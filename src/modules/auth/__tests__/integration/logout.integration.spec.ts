import request from 'supertest';

import app from '@/app';

import { cleanDatabase } from '@tests/helpers/database';

import { loginWithRefreshToken } from '../helpers/auth.helper';

const logoutUrl = '/api/1.0/auth/logout';
const refreshUrl = '/api/1.0/auth/refresh';

const user = {
  username: 'john',
  email: 'john@mail.com',
  password: 'P4ssword',
};

describe(`POST ${logoutUrl}`, () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('Given a user with a valid refresh token', () => {
    describe('When logging out', () => {
      it('Then it should clear the refresh token cookie', async () => {
        const { cookies } = await loginWithRefreshToken(user);

        const response = await request(app)
          .post(logoutUrl)
          .set('Cookie', cookies!);

        expect(response.status).toBe(204);

        const setCookieHeader = response.headers['set-cookie'];

        expect(setCookieHeader).toBeDefined();
        expect(setCookieHeader[0]).toContain('refreshToken=;');
      });

      it('Then it should revoke the refresh token so it can no longer be used', async () => {
        const { cookies } = await loginWithRefreshToken(user);

        await request(app).post(logoutUrl).set('Cookie', cookies!);

        const response = await request(app)
          .post(refreshUrl)
          .set('Cookie', cookies!);

        expect(response.status).toBe(401);
        expect(response.body.error.type).toBe('InvalidRefreshToken');
      });
    });
  });

  describe('Given a request without a refresh token', () => {
    describe('When logging out', () => {
      it('Then it should still succeed', async () => {
        const response = await request(app).post(logoutUrl);

        expect(response.status).toBe(204);
      });
    });
  });

  describe('Given a request with an invalid refresh token', () => {
    describe('When logging out', () => {
      it('Then it should still succeed', async () => {
        const response = await request(app)
          .post(logoutUrl)
          .set('Cookie', 'refreshToken=not-a-valid-jwt');

        expect(response.status).toBe(204);
      });
    });
  });
});