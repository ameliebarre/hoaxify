import db from '@/db';
import { usersTable } from '@/db/schema';
import { login, signup } from '@/tests/helpers/auth';

const loginUrl = '/api/1.0/auth/login';

const user = {
  email: 'john@mail.com',
  password: 'P4ssword',
};

describe(`POST ${loginUrl}`, () => {
  beforeEach(async () => {
    await db.delete(usersTable);
  });

  describe('when request is valid', () => {
    it('returns 200 when credentials are valid', async () => {
      await signup({
        username: 'john',
        email: 'john@mail.com',
        password: 'P4ssword',
      });

      const response = await login(user);

      expect(response.status).toBe(200);
    });

    it('returns success message', async () => {
      await signup({
        username: 'john',
        email: 'john@mail.com',
        password: 'P4ssword',
      });

      const response = await login({
        email: 'john@mail.com',
        password: 'P4ssword',
      });

      expect(response.status).toBe(200);

      expect(response.body).toEqual({
        message: 'User is successfully logged in',
      });
    });
  });

  describe('when request is invalid', () => {
    it('returns 401 when email does not exist', async () => {
      const response = await login({
        email: 'unknown@mail.com',
        password: 'P4ssword',
      });

      expect(response.status).toBe(401);
    });

    it('returns 401 when password is incorrect', async () => {
      await signup({
        username: 'john',
        email: 'john@mail.com',
        password: 'P4ssword',
      });

      const response = await login({
        email: 'john@mail.com',
        password: 'WrongPassword',
      });

      expect(response.status).toBe(401);
    });

    it('returns 400 when email is missing', async () => {
      await signup({
        username: 'john',
        email: 'john@mail.com',
        password: 'P4ssword',
      });

      const response = await login({
        password: 'WrongPassword',
      });

      expect(response.status).toBe(400);
    });

    it('returns 400 when email is missing', async () => {
      await signup({
        username: 'john',
        email: 'john@mail.com',
        password: 'P4ssword',
      });

      const response = await login({
        password: 'P4ssword',
      });

      expect(response.status).toBe(400);
    });

    it('returns 400 when password is missing', async () => {
      await signup({
        username: 'john',
        email: 'john@mail.com',
        password: 'P4ssword',
      });

      const response = await login({
        email: 'john@mail.com',
      });

      expect(response.status).toBe(400);
    });
  });
});
