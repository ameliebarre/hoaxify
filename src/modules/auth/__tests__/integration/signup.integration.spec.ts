import 'reflect-metadata';

import db from '@infrastructure/database';
import { usersTable } from '@infrastructure/database/schema';
import { signup, login } from '@modules/auth/__tests__/helpers/auth.helper';
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

  describe('when request is valid', () => {
    it('returns 201 when user is created', async () => {
      const response = await signup(validUser);

      expect(response.status).toBe(201);
    });

    it('returns success message', async () => {
      const response = await signup(validUser);

      expect(response.body).toEqual({
        message: 'User successfully created',
      });
    });

    it('saves user in database', async () => {
      await signup(validUser);

      const users = await db.select().from(usersTable);

      expect(users).toHaveLength(1);

      expect(users[0]).toMatchObject({
        username: validUser.username,
        email: validUser.email,
      });
    });

    it('hashes the password before saving', async () => {
      await signup(validUser);

      const [user] = await db.select().from(usersTable);

      expect(user.password).not.toBe(validUser.password);
    });

    it('normalizes email and allows login with normalized email', async () => {
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
      expect(loginResponse.body).toHaveProperty('accessToken');
    });
  });

  describe('when email already exists', () => {
    it('returns 409 Conflict', async () => {
      await signup(validUser);

      const response = await signup({
        ...validUser,
        username: 'another-user',
        password: 'AnotherPassword1',
      });

      expect(response.status).toBe(409);
    });

    it('does not create a second user', async () => {
      await signup(validUser);

      await signup({
        ...validUser,
        username: 'another-user',
        password: 'AnotherPassword1',
      });

      const users = await db.select().from(usersTable);

      expect(users).toHaveLength(1);
    });
  });

  describe('when request body is invalid', () => {
    it('returns 400 when email is missing', async () => {
      const response = await signup({
        username: 'john',
        password: 'P4ssword',
      });

      expect(response.status).toBe(400);
    });

    it('returns 400 when username is too short', async () => {
      const response = await signup({ ...validUser, username: 'jo' });

      expect(response.status).toBe(400);
      expect(response.body.errors.fieldErrors.username[0]).toBe(
        'Username must be at least 3 characters long',
      );
    });

    it('returns 400 when username is too long', async () => {
      const response = await signup({
        ...validUser,
        username: 'vealngc1569beestickweaselblackeye',
      });

      expect(response.status).toBe(400);
      expect(response.body.errors.fieldErrors.username[0]).toBe(
        'Username must not exceed 30 characters',
      );
    });

    it('returns 400 when email format is invalid', async () => {
      const response = await signup({ ...validUser, email: 'invalid-email' });

      expect(response.status).toBe(400);
      expect(response.body.errors.fieldErrors.email[0]).toBe(
        'Invalid email address',
      );
    });

    it('returns 400 when password is too short', async () => {
      const response = await signup({ ...validUser, password: '123' });

      expect(response.status).toBe(400);
      expect(response.body.errors.fieldErrors.password[0]).toBe(
        'Password must be at least 8 characters long',
      );
    });

    it('returns 400 when password is missing', async () => {
      const response = await signup({
        username: 'john',
        email: 'john@mail.com',
      });

      expect(response.status).toBe(400);
      expect(response.body.errors.fieldErrors.password).toBeDefined();
    });

    it('returns 400 when body is empty', async () => {
      const response = await signup({});

      expect(response.status).toBe(400);
    });
  });
});
