import { createUser } from '@modules/user/__tests__/helpers/create-user';
import { UserRepository } from '@modules/user/infrastructure/user.repository';
import { cleanDatabase } from '@tests/helpers/database';

describe('UserRepository', () => {
  let repository: UserRepository;

  beforeEach(async () => {
    repository = new UserRepository();

    await cleanDatabase();
  });

  describe('Given a valid user', () => {
    describe('When creating the user', () => {
      it('Then it should persist the user and return the created user', async () => {
        const createdUser = await createUser(repository);

        expect(createdUser).toMatchObject({
          username: 'john',
          email: 'john@mail.com',
          password: 'hashed-password',
        });

        expect(createdUser.id).toBeDefined();
      });
    });
  });

  describe('Given a user exists in database', () => {
    describe('When searching the user by email', () => {
      it('Then it should return the matching user', async () => {
        await createUser(repository);

        const result = await repository.findByEmail('john@mail.com');

        expect(result.isOk()).toBe(true);

        const user = result._unsafeUnwrap();

        expect(user).toMatchObject({
          email: 'john@mail.com',
          username: 'john',
        });
      });
    });
  });

  describe('Given no user exists with the provided email', () => {
    describe('When searching the user by email', () => {
      it('Then it should return null', async () => {
        const result = await repository.findByEmail('unknown@mail.com');

        expect(result.isOk()).toBe(true);

        expect(result._unsafeUnwrap()).toBeNull();
      });
    });
  });

  describe('Given a user exists in database', () => {
    describe('When searching the user by id', () => {
      it('Then it should return the matching user', async () => {
        const createdUser = await createUser(repository);

        const result = await repository.findById(createdUser.id);

        expect(result.isOk()).toBe(true);

        const user = result._unsafeUnwrap();

        expect(user).toMatchObject({
          id: createdUser.id,
          email: 'john@mail.com',
        });
      });
    });
  });

  describe('Given no user exists with the provided id', () => {
    describe('When searching the user by id', () => {
      it('Then it should return null', async () => {
        const result = await repository.findById(999999);

        expect(result.isOk()).toBe(true);

        expect(result._unsafeUnwrap()).toBeNull();
      });
    });
  });
});
