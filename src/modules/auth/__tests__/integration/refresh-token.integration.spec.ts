import jwt from 'jsonwebtoken';
import request from 'supertest';

import app from '@/app';

import env from '@core/config/env';
import { cleanDatabase } from '@tests/helpers/database';

import {
  extractRefreshTokenCookie,
  loginWithRefreshToken,
} from '../helpers/auth.helper';

const refreshUrl = '/api/1.0/auth/refresh';

const user = {
  username: 'john',
  email: 'john@mail.com',
  password: 'P4ssword',
};

describe(`POST ${refreshUrl}`, () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('Given a user with a valid refresh token', () => {
    describe('When requesting a new access token', () => {
      it('Then it should return a new access token and rotate the refresh token cookie', async () => {
        const { cookies } = await loginWithRefreshToken(user);

        expect(cookies).toBeDefined();
        expect(cookies).toMatch(/^refreshToken=/);

        const response = await request(app)
          .post(refreshUrl)
          .set('Cookie', cookies!);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          accessToken: expect.any(String),
        });

        const rotatedCookie = extractRefreshTokenCookie(
          response.headers['set-cookie'],
        );

        expect(rotatedCookie).toBeDefined();
        expect(rotatedCookie).not.toBe(cookies);
      });
    });
  });

  describe('Given a request without a refresh token', () => {
    describe('When requesting a new access token', () => {
      it('Then it should return an unauthorized error', async () => {
        const response = await request(app).post(refreshUrl);

        expect(response.status).toBe(401);
        expect(response.body.error).toEqual({
          type: 'Unauthorized',
          message: expect.any(String),
        });
      });
    });
  });

  describe('Given a request with an invalid refresh token', () => {
    describe('When requesting a new access token', () => {
      it('Then it should return an unauthorized error', async () => {
        const response = await request(app)
          .post(refreshUrl)
          .set('Cookie', 'refreshToken=not-a-valid-jwt');

        expect(response.status).toBe(401);
        expect(response.body.error).toEqual({
          type: 'JwtVerifyError',
          message: expect.any(String),
        });
      });
    });
  });

  describe('Given a request with an expired refresh token', () => {
    describe('When requesting a new access token', () => {
      it('Then it should return an unauthorized error', async () => {
        const expiredToken = jwt.sign(
          { userId: 1, jti: 'expired-token-id' },
          env.REFRESH_SECRET,
          { expiresIn: -1 },
        );

        const response = await request(app)
          .post(refreshUrl)
          .set('Cookie', `refreshToken=${expiredToken}`);

        expect(response.status).toBe(401);
        expect(response.body.error).toEqual({
          type: 'JwtVerifyError',
          message: expect.any(String),
        });
      });
    });
  });

  describe('Given a user was authenticated but their account no longer exists', () => {
    describe('When requesting a new access token', () => {
      it('Then it should return an unauthorized error', async () => {
        const { cookies } = await loginWithRefreshToken(user);

        expect(cookies).toBeDefined();

        await cleanDatabase();

        const response = await request(app)
          .post(refreshUrl)
          .set('Cookie', cookies!);

        expect(response.status).toBe(401);
        // Deleting the user cascades to their refresh_tokens rows, so the
        // token is already gone by the time it's looked up.
        expect(response.body.error).toEqual({
          type: 'InvalidRefreshToken',
          message: expect.any(String),
        });
      });
    });
  });

  describe('Given a refresh token that has already been rotated', () => {
    describe('When it is presented again', () => {
      it('Then it should reject the reused token and revoke the whole session', async () => {
        const { cookies } = await loginWithRefreshToken(user);

        const firstRefresh = await request(app)
          .post(refreshUrl)
          .set('Cookie', cookies!);

        expect(firstRefresh.status).toBe(200);

        const rotatedCookie = extractRefreshTokenCookie(
          firstRefresh.headers['set-cookie'],
        );

        const reuseAttempt = await request(app)
          .post(refreshUrl)
          .set('Cookie', cookies!);

        expect(reuseAttempt.status).toBe(401);
        expect(reuseAttempt.body.error).toEqual({
          type: 'InvalidRefreshToken',
          message: expect.any(String),
        });

        const afterReuseDetected = await request(app)
          .post(refreshUrl)
          .set('Cookie', rotatedCookie!);

        expect(afterReuseDetected.status).toBe(401);
      });
    });
  });
});