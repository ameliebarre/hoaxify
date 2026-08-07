import request from 'supertest';

import app from '@/app';

import db from '@infrastructure/database';
import { hoaxesTable } from '@infrastructure/database/schema';
import { authenticate } from '@modules/auth/__tests__/helpers/auth.helper';
import { cleanDatabase } from '@tests/helpers/database';

const hoaxesUrl = '/api/1.0/hoaxes';

describe(`POST ${hoaxesUrl}`, () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('Given an authenticated user', () => {
    describe('When creating a hoax with valid content', () => {
      it('Then it should create the hoax and return it', async () => {
        const token = await authenticate();

        const response = await request(app)
          .post(hoaxesUrl)
          .set('Authorization', `Bearer ${token}`)
          .send({ content: 'This is a valid hoax content.' });

        expect(response.status).toBe(201);

        expect(response.body).toEqual({
          id: expect.any(Number),
          content: 'This is a valid hoax content.',
          userId: expect.any(Number),
          createdAt: expect.any(String),
        });
      });

      it('Then it should persist the hoax in the database', async () => {
        const token = await authenticate();

        await request(app)
          .post(hoaxesUrl)
          .set('Authorization', `Bearer ${token}`)
          .send({ content: 'This is a valid hoax content.' });

        const hoaxes = await db.select().from(hoaxesTable);

        expect(hoaxes).toHaveLength(1);
        expect(hoaxes[0].content).toBe('This is a valid hoax content.');
      });
    });
  });

  describe('Given no authentication credentials are provided', () => {
    describe('When creating a hoax', () => {
      it('Then it should return an unauthorized error', async () => {
        const response = await request(app)
          .post(hoaxesUrl)
          .send({ content: 'This is a valid hoax content.' });

        expect(response.status).toBe(401);
      });

      it('Then it should not persist any hoax', async () => {
        await request(app)
          .post(hoaxesUrl)
          .send({ content: 'This is a valid hoax content.' });

        const hoaxes = await db.select().from(hoaxesTable);

        expect(hoaxes).toHaveLength(0);
      });
    });
  });

  describe('Given an authenticated user provides invalid content', () => {
    describe('When the content is missing', () => {
      it('Then it should return a validation error', async () => {
        const token = await authenticate();

        const response = await request(app)
          .post(hoaxesUrl)
          .set('Authorization', `Bearer ${token}`)
          .send({});

        expect(response.status).toBe(400);
        expect(response.body.error.type).toBe('ValidationError');
      });
    });

    describe('When the content is shorter than 10 characters', () => {
      it('Then it should return a validation error', async () => {
        const token = await authenticate();

        const response = await request(app)
          .post(hoaxesUrl)
          .set('Authorization', `Bearer ${token}`)
          .send({ content: 'short' });

        expect(response.status).toBe(400);

        expect(response.body.error.details.fieldErrors.content).toContain(
          'Content must be at least 10 characters long',
        );
      });
    });

    describe('When the content exceeds 5000 characters', () => {
      it('Then it should return a validation error', async () => {
        const token = await authenticate();

        const response = await request(app)
          .post(hoaxesUrl)
          .set('Authorization', `Bearer ${token}`)
          .send({ content: 'a'.repeat(5001) });

        expect(response.status).toBe(400);

        expect(response.body.error.details.fieldErrors.content).toContain(
          'Content must not exceed 5000 characters',
        );
      });
    });
  });
});