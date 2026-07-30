import express from 'express';
import request from 'supertest';

import { createRateLimiter } from '@middlewares/rate-limit.middleware';

function buildApp(limit: number) {
  const app = express();

  app.use(createRateLimiter({ windowMs: 60 * 1000, limit, skip: () => false }));
  app.get('/protected', (_req, res) => res.status(200).json({ ok: true }));

  return app;
}

describe('createRateLimiter', () => {
  describe('Given a limiter allowing 2 requests per window', () => {
    describe('When fewer requests than the limit are made', () => {
      it('Then it should let them through', async () => {
        const app = buildApp(2);

        const first = await request(app).get('/protected');
        const second = await request(app).get('/protected');

        expect(first.status).toBe(200);
        expect(second.status).toBe(200);
      });
    });

    describe('When more requests than the limit are made', () => {
      it('Then it should reject the extra ones with a 429', async () => {
        const app = buildApp(2);

        await request(app).get('/protected');
        await request(app).get('/protected');

        const thirdResponse = await request(app).get('/protected');

        expect(thirdResponse.status).toBe(429);
        expect(thirdResponse.body).toEqual({
          error: {
            type: 'TooManyRequests',
            message: expect.any(String),
          },
        });
      });
    });
  });

  describe('Given a limiter configured to always skip', () => {
    describe('When more requests than the limit are made', () => {
      it('Then it should never rate-limit', async () => {
        const app = express();

        app.use(
          createRateLimiter({ windowMs: 60 * 1000, limit: 1, skip: () => true }),
        );
        app.get('/protected', (_req, res) => res.status(200).json({ ok: true }));

        const first = await request(app).get('/protected');
        const second = await request(app).get('/protected');

        expect(first.status).toBe(200);
        expect(second.status).toBe(200);
      });
    });
  });
});