import 'reflect-metadata';

import db from '@infrastructure/database';
import { usersTable } from '@infrastructure/database/schema';
import { login, signup } from '@modules/auth/__tests__/helpers/auth.helper';
import { cleanDatabase } from '@tests/helpers/database';

const validUser = {
  username: 'user1',
  email: 'user1@mail.com',
  password: 'P4ssword',
};

const signupUrl = '/api/1.0/auth/signup';

describe(`POST ${signupUrl}`, () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('Given a user provides valid registration information', () => {
    describe('When the user signs up', () => {
      it('Then it should create the user and return the public user information', async () => {
        const response = await signup(validUser);

        expect(response.status).toBe(201);

        expect(response.body).toEqual({
          id: expect.any(Number),
          username: validUser.username,
          email: validUser.email,
        });

        expect(response.body.password).toBeUndefined();
      });

      it('Then it should persist the user in database', async () => {
        await signup(validUser);

        const users = await db.select().from(usersTable);

        expect(users).toHaveLength(1);

        expect(users[0]).toMatchObject({
          username: validUser.username,
          email: validUser.email,
        });
      });

      it('Then it should hash the password before storing it', async () => {
        await signup(validUser);

        const [user] = await db.select().from(usersTable);

        expect(user.password).not.toBe(validUser.password);
      });
    });
  });

  describe('Given a user provides an email with extra spaces and uppercase characters', () => {
    describe('When the user signs up and logs in with the normalized email', () => {
      it('Then authentication should succeed', async () => {
        const signupResponse = await signup({
          ...validUser,
          email: '   JOHN@MAIL.COM  ',
        });

        expect(signupResponse.status).toBe(201);

        const loginResponse = await login({
          email: 'john@mail.com',
          password: 'P4ssword',
        });

        expect(loginResponse.status).toBe(200);
      });
    });
  });

  describe('Given a user already exists with the same email', () => {
    beforeEach(async () => {
      await signup(validUser);
    });

    describe('When another user tries to register with this email', () => {
      it('Then it should return a conflict error', async () => {
        const response = await signup({
          ...validUser,
          username: 'another-user',
          password: 'AnotherPassword1',
        });

        expect(response.status).toBe(409);
      });

      it('Then it should not create another user', async () => {
        await signup({
          ...validUser,
          username: 'another-user',
          password: 'AnotherPassword1',
        });

        const users = await db.select().from(usersTable);

        expect(users).toHaveLength(1);
      });
    });
  });

  describe('Given a user provides invalid registration information', () => {
    describe('When the email is missing', () => {
      it('Then it should return a validation error', async () => {
        const response = await signup({
          username: 'john',
          password: 'P4ssword',
        });

        const { type, details } = response.body.error;

        expect(response.status).toBe(400);
        expect(type).toBe('ValidationError');
        expect(details.fieldErrors.email).toBeDefined();
      });
    });

    describe('When the username has less than 3 characters', () => {
      it('Then it should return a validation error', async () => {
        const response = await signup({
          ...validUser,
          username: 'jo',
        });

        const { type, details } = response.body.error;

        expect(response.status).toBe(400);
        expect(type).toBe('ValidationError');
        expect(details.fieldErrors.username).toContain(
          'Username must be at least 3 characters long',
        );
      });
    });

    describe('When the username exceeds 30 characters', () => {
      it('Then it should return a validation error', async () => {
        const response = await signup({
          ...validUser,
          username: 'vealngc1569beestickweaselblackeye',
        });

        const { type, details } = response.body.error;

        expect(response.status).toBe(400);
        expect(type).toBe('ValidationError');
        expect(details.fieldErrors.username).toContain(
          'Username must not exceed 30 characters',
        );
      });
    });

    describe('When the email format is invalid', () => {
      it('Then it should return a validation error', async () => {
        const response = await signup({
          ...validUser,
          email: 'invalid-email',
        });

        const { type, details } = response.body.error;

        expect(response.status).toBe(400);
        expect(type).toBe('ValidationError');
        expect(details.fieldErrors.email).toContain('Invalid email address');
      });
    });

    describe('When the password is too short', () => {
      it('Then it should return a validation error', async () => {
        const response = await signup({
          ...validUser,
          password: '123',
        });

        const { type, details } = response.body.error;

        expect(response.status).toBe(400);
        expect(type).toBe('ValidationError');
        expect(details.fieldErrors.password).toContain(
          'Password must be at least 8 characters long',
        );
      });
    });

    describe('When the request body is empty', () => {
      it('Then it should return a validation error', async () => {
        const response = await signup({});

        const { type, details } = response.body.error;

        expect(response.status).toBe(400);
        expect(type).toBe('ValidationError');

        expect(details.fieldErrors.username).toBeDefined();
        expect(details.fieldErrors.email).toBeDefined();
        expect(details.fieldErrors.password).toBeDefined();
      });
    });
  });
});
