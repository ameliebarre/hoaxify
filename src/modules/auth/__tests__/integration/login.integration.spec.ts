import db from '@infrastructure/database';
import { usersTable } from '@infrastructure/database/schema';
import { login, signup } from '@modules/auth/__tests__/helpers/auth.helper';

const loginUrl = '/api/1.0/auth/login';

const user = {
  email: 'john@mail.com',
  password: 'P4ssword',
};

describe(`POST ${loginUrl}`, () => {
  beforeEach(async () => {
    await db.delete(usersTable);
  });

  describe('Given a registered user with valid credentials', () => {
    beforeEach(async () => {
      await signup({
        ...user,
        username: 'john',
      });
    });

    describe('When the user logs in with valid credentials', () => {
      it('Then it should authenticate the user and return an access token', async () => {
        const response = await login(user);

        expect(response.status).toBe(200);
        expect(response.body.accessToken).toBeDefined();
      });

      it('Then it sets refresh token in httpOnly cookie', async () => {
        await signup({
          ...user,
          username: 'john',
        });

        const response = await login(user);

        expect(response.status).toBe(200);
        expect(response.headers['set-cookie']).toBeDefined();
        expect(response.headers['set-cookie'][0]).toContain('refreshToken=');
      });

      it('Then it should return the user information without exposing the password', async () => {
        const response = await login(user);

        expect(response.status).toBe(200);

        expect(response.body).toEqual({
          user: {
            id: expect.any(Number),
            username: 'john',
            email: 'john@mail.com',
          },
          accessToken: expect.any(String),
        });

        expect(response.body.user.password).toBeUndefined();
      });
    });
  });

  describe('Given a user registered with an email containing uppercase characters and spaces', () => {
    beforeEach(async () => {
      await signup({
        ...user,
        username: 'john',
        email: '   JOHN@MAIL.COM   ',
      });
    });

    describe('When the user logs in with the normalized email', () => {
      it('Then it should authenticate successfully', async () => {
        const response = await login(user);

        expect(response.status).toBe(200);

        expect(response.body).toEqual({
          user: {
            id: expect.any(Number),
            username: 'john',
            email: 'john@mail.com',
          },
          accessToken: expect.any(String),
        });
      });
    });
  });

  describe('Given no registered user exists', () => {
    describe('When the user tries to log in with an unknown email', () => {
      it('Then it should return an invalid credentials error', async () => {
        const response = await login({
          email: 'unknown@mail.com',
          password: 'P4ssword',
        });

        expect(response.status).toBe(401);

        expect(response.body).toEqual({
          error: {
            type: 'InvalidCredentials',
            message: 'Invalid email or password.',
          },
        });
      });
    });
  });

  describe('Given a registered user exists', () => {
    beforeEach(async () => {
      await signup({
        ...user,
        username: 'john',
      });
    });

    describe('When the user provides an incorrect password', () => {
      it('Then it should return an invalid credentials error', async () => {
        const response = await login({
          email: user.email,
          password: 'WrongPassword',
        });

        expect(response.status).toBe(401);

        expect(response.body).toEqual({
          error: {
            type: 'InvalidCredentials',
            message: 'Invalid email or password.',
          },
        });
      });
    });

    describe('When the user does not provide an email', () => {
      it('Then it should return a validation error', async () => {
        const response = await login({
          password: user.password,
        });

        expect(response.status).toBe(400);
        expect(response.body.error.type).toBe('ValidationError');
      });
    });

    describe('When the user does not provide a password', () => {
      it('Then it should return a validation error', async () => {
        const response = await login({
          email: user.email,
        });

        expect(response.status).toBe(400);
        expect(response.body.error.type).toBe('ValidationError');
      });
    });

    describe('When the password exceeds 72 bytes', () => {
      it('Then it should return a validation error', async () => {
        const response = await login({
          email: user.email,
          password: 'a'.repeat(73),
        });

        expect(response.status).toBe(400);
        expect(response.body.error.type).toBe('ValidationError');
      });
    });
  });
});
