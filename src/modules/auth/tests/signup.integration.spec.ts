import 'reflect-metadata';
import request from 'supertest';

import '@/composition-root';
import app from '@/app';
import db from '@/db';
import { usersTable } from '@/db/schema';
import { signup } from '@/tests/helpers/auth';

const validUser = {
  username: 'user1',
  email: 'user1@mail.com',
  password: 'P4ssword',
};

const signupUrl = '/api/1.0/auth/signup';

describe(`POST ${signupUrl}`, () => {
  beforeEach(async () => {
    await db.delete(usersTable);
  });

  describe('when request is valid', () => {
    it('returns 201 Created', async () => {
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
      const response = await request(app).post(signupUrl).send({
        username: 'john',
        password: 'P4ssword',
      });

      expect(response.status).toBe(400);
    });

    it('returns 400 when email format is invalid', async () => {
      const response = await signup({ ...validUser, email: 'invalid-email' });

      expect(response.status).toBe(400);
    });

    it('returns 400 when password is too short', async () => {
      const response = await signup({ ...validUser, password: '123' });

      expect(response.status).toBe(400);
    });
  });
});
