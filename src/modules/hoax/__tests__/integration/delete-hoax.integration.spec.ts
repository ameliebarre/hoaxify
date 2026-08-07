import request from 'supertest';

import app from '@/app';

import {
  authenticate,
  login,
  signup,
} from '@modules/auth/__tests__/helpers/auth.helper';
import { cleanDatabase } from '@tests/helpers/database';

const hoaxesUrl = '/api/1.0/hoaxes';

async function authenticateAs(user: {
  username: string;
  email: string;
  password: string;
}) {
  await signup(user);
  const response = await login(user);
  return response.body.accessToken as string;
}

async function createHoax(token: string) {
  const response = await request(app)
    .post(hoaxesUrl)
    .set('Authorization', `Bearer ${token}`)
    .send({ content: 'A hoax to be deleted.' });

  return response.body.id as number;
}

describe(`DELETE ${hoaxesUrl}/:id`, () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('Given the hoax belongs to the authenticated user', () => {
    describe('When deleting it', () => {
      it('Then it should delete the hoax', async () => {
        const token = await authenticate();
        const hoaxId = await createHoax(token);

        const response = await request(app)
          .delete(`${hoaxesUrl}/${hoaxId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(204);

        const listResponse = await request(app).get(hoaxesUrl);

        expect(listResponse.body.content).toHaveLength(0);
      });
    });
  });

  describe('Given the hoax belongs to another user', () => {
    describe('When deleting it', () => {
      it('Then it should return a forbidden error and not delete it', async () => {
        const johnToken = await authenticateAs({
          username: 'john',
          email: 'john@mail.com',
          password: 'P4ssword',
        });
        const janeToken = await authenticateAs({
          username: 'jane',
          email: 'jane@mail.com',
          password: 'P4ssword',
        });

        const hoaxId = await createHoax(johnToken);

        const response = await request(app)
          .delete(`${hoaxesUrl}/${hoaxId}`)
          .set('Authorization', `Bearer ${janeToken}`);

        expect(response.status).toBe(403);
        expect(response.body.error.type).toBe('UnauthorizedHoaxDeletion');

        const listResponse = await request(app).get(hoaxesUrl);

        expect(listResponse.body.content).toHaveLength(1);
      });
    });
  });

  describe('Given the hoax does not exist', () => {
    describe('When deleting it', () => {
      it('Then it should return a not found error', async () => {
        const token = await authenticate();

        const response = await request(app)
          .delete(`${hoaxesUrl}/999999`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(404);
        expect(response.body.error.type).toBe('HoaxNotFound');
      });
    });
  });

  describe('Given no authentication credentials are provided', () => {
    describe('When deleting a hoax', () => {
      it('Then it should return an unauthorized error', async () => {
        const token = await authenticate();
        const hoaxId = await createHoax(token);

        const response = await request(app).delete(`${hoaxesUrl}/${hoaxId}`);

        expect(response.status).toBe(401);

        const listResponse = await request(app).get(hoaxesUrl);

        expect(listResponse.body.content).toHaveLength(1);
      });
    });
  });

  describe('Given the hoax id is not a valid number', () => {
    describe('When deleting it', () => {
      it('Then it should return a validation error', async () => {
        const token = await authenticate();

        const response = await request(app)
          .delete(`${hoaxesUrl}/not-a-number`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(400);
        expect(response.body.error.type).toBe('ValidationError');
      });
    });
  });
});
