import 'reflect-metadata';

import request from 'supertest';

import app from '@/app';
import { container } from '@/composition-root';

import { TOKENS } from '@core/di/token';
import db from '@infrastructure/database';
import { usersTable } from '@infrastructure/database/schema';
import { signup } from '@modules/auth/__tests__/helpers/auth.helper';
import { IUserRepository } from '@modules/user/domain/user.repository.interface';


const validUser = {
  username: 'user1',
  email: 'user1@mail.com',
  password: 'P4ssword',
};

const signupUrl = '/api/1.0/auth/signup';

describe(`POST ${signupUrl}`, () => {
  let userRepository: IUserRepository;

  beforeAll(async () => {
    userRepository = container.resolve<IUserRepository>(TOKENS.UserRepository);
  });

  beforeEach(async () => {
    await db.delete(usersTable);
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

    it('creates user with normalized email', async () => {
      await request(app).post(signupUrl).send({
        username: 'john',
        email: '  John.Doe@Mail.COM ',
        password: 'P4ssword',
      });

      const user = await userRepository.findByEmail('john.doe@mail.com');

      expect(user).toBeDefined();
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

    it('returns 400 when username is too short', async () => {
      const response = await signup({ ...validUser, username: 'jo' });

      expect(response.status).toBe(400);
      expect(response.body.errors.fieldErrors.username).toBeDefined();
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
      expect(response.body.errors.fieldErrors.username).toBeDefined();
      expect(response.body.errors.fieldErrors.username[0]).toBe(
        'Username must not exceed 30 characters',
      );
    });

    it('returns 400 when email format is invalid', async () => {
      const response = await signup({ ...validUser, email: 'invalid-email' });

      expect(response.status).toBe(400);
      expect(response.body.errors.fieldErrors.email).toBeDefined();
      expect(response.body.errors.fieldErrors.email[0]).toBe(
        'Please provide a valid email address',
      );
    });

    it('returns 400 when password is too short', async () => {
      const response = await signup({ ...validUser, password: '123' });

      expect(response.status).toBe(400);
      expect(response.body.errors.fieldErrors.password).toBeDefined();
      expect(response.body.errors.fieldErrors.password[0]).toBe(
        'Password must be at least 8 characters long',
      );
    });
  });
});
