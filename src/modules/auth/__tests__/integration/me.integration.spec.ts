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

  describe('Given a user is authenticated', () => {
    describe('When the user requests their profile', () => {
      it('Then it should return the current user information', async () => {
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
  });

  describe('Given a user does not provide authentication credentials', () => {
    describe('When the user requests their profile', () => {
      it('Then it should return an unauthorized error', async () => {
        const response = await request(app).get(meUrl);

        expect(response.status).toBe(401);
      });
    });
  });

  describe('Given a user provides an invalid authentication token', () => {
    describe('When the user requests their profile', () => {
      it('Then it should return an unauthorized error', async () => {
        const response = await request(app)
          .get(meUrl)
          .set('Authorization', 'Bearer invalid-token');

        expect(response.status).toBe(401);
      });
    });
  });

  describe('Given an authentication header does not use the Bearer scheme', () => {
    describe('When the user requests their profile', () => {
      it('Then it should return an unauthorized error', async () => {
        const token = await authenticate();

        const response = await request(app)
          .get(meUrl)
          .set('Authorization', token);

        expect(response.status).toBe(401);
      });
    });
  });

  describe('Given an authentication header contains an empty Bearer token', () => {
    describe('When the user requests their profile', () => {
      it('Then it should return an unauthorized error', async () => {
        const response = await request(app)
          .get(meUrl)
          .set('Authorization', 'Bearer');

        expect(response.status).toBe(401);
      });
    });
  });

  describe('Given a user has an expired authentication token', () => {
    describe('When the user requests their profile', () => {
      it('Then it should return an unauthorized error', async () => {
        const expiredToken = jwt.sign({ userId: 1 }, env.JWT_SECRET, {
          expiresIn: -1,
        });

        const response = await request(app)
          .get(meUrl)
          .set('Authorization', `Bearer ${expiredToken}`);

        expect(response.status).toBe(401);
      });
    });
  });

  describe('Given a user was authenticated but their account no longer exists', () => {
    describe('When the user requests their profile', () => {
      it('Then it should return an unauthorized error', async () => {
        const token = await authenticate();

        await cleanDatabase();

        const response = await request(app)
          .get(meUrl)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(401);
      });
    });
  });
});
