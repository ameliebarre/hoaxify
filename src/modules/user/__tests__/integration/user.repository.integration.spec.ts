import { createUser } from '@modules/user/__tests__/helpers/create-user';
import { UserRepository } from '@modules/user/infrastructure/user.repository';
import { cleanDatabase } from '@tests/helpers/database';

describe('UserRepository', () => {
  let repository: UserRepository;

  beforeEach(async () => {
    repository = new UserRepository();

    await cleanDatabase();
  });

  describe('create', () => {
    it('creates a user', async () => {
      const createdUser = await createUser(repository);

      expect(createdUser).toMatchObject({
        username: 'john',
        email: 'john@mail.com',
        password: 'hashed-password',
      });
      expect(createdUser.id).toBeDefined();
    });
  });

  describe('findByEmail', () => {
    it('returns a user when email exists', async () => {
      await createUser(repository);

      const user = await repository.findByEmail('john@mail.com');

      expect(user).not.toBeNull();

      expect(user).toMatchObject({
        email: 'john@mail.com',
        username: 'john',
      });
    });

    it('returns null when email does not exist', async () => {
      const user = await repository.findByEmail('unknown@mail.com');

      expect(user).toBeNull();
    });
  });

  describe('findById', () => {
    it('returns a user when id exists', async () => {
      const createdUser = await createUser(repository);

      const user = await repository.findById(createdUser.id);

      expect(user).toMatchObject({
        id: createdUser.id,
        email: 'john@mail.com',
      });
    });

    it('returns null when id does not exist', async () => {
      const user = await repository.findById(999999);

      expect(user).toBeNull();
    });
  });
});
