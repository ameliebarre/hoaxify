import { randomUUID } from 'node:crypto';

import { createUser } from '@modules/user/__tests__/helpers/create-user';
import { UserRepository } from '@modules/user/infrastructure/user.repository';
import { cleanDatabase } from '@tests/helpers/database';

import { RefreshTokenRepository } from '../../infrastructure/refresh-token.repository';

describe('RefreshTokenRepository', () => {
  let repository: RefreshTokenRepository;
  let userId: number;

  beforeEach(async () => {
    repository = new RefreshTokenRepository();

    await cleanDatabase();

    const user = await createUser(new UserRepository());
    userId = user.id;
  });

  describe('Given an active refresh token', () => {
    describe('When rotating it', () => {
      it('Then it should revoke the old token and create a new one in the same family', async () => {
        const familyId = randomUUID();
        const oldId = randomUUID();

        await repository.create({
          id: oldId,
          userId,
          familyId,
          expiresAt: new Date(Date.now() + 60 * 1000),
        });

        const newId = randomUUID();

        const result = await repository.rotate({
          oldId,
          newId,
          userId,
          expiresAt: new Date(Date.now() + 60 * 1000),
        });

        expect(result.isOk()).toBe(true);

        const created = result._unsafeUnwrap();

        expect(created).toMatchObject({ id: newId, userId, familyId });

        const oldRecord = (await repository.findById(oldId))._unsafeUnwrap();

        expect(oldRecord?.revokedAt).not.toBeNull();
        expect(oldRecord?.replacedByTokenId).toBe(newId);
      });
    });
  });

  describe('Given an already-revoked refresh token', () => {
    describe('When rotating it', () => {
      it('Then it should return null and not create a new token', async () => {
        const familyId = randomUUID();
        const oldId = randomUUID();

        await repository.create({
          id: oldId,
          userId,
          familyId,
          expiresAt: new Date(Date.now() + 60 * 1000),
        });

        await repository.revoke(oldId);

        const newId = randomUUID();

        const result = await repository.rotate({
          oldId,
          newId,
          userId,
          expiresAt: new Date(Date.now() + 60 * 1000),
        });

        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap()).toBeNull();

        const newRecord = (await repository.findById(newId))._unsafeUnwrap();

        expect(newRecord).toBeNull();
      });
    });
  });

  describe('Given an unknown token id', () => {
    describe('When rotating it', () => {
      it('Then it should return null', async () => {
        const result = await repository.rotate({
          oldId: randomUUID(),
          newId: randomUUID(),
          userId,
          expiresAt: new Date(Date.now() + 60 * 1000),
        });

        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap()).toBeNull();
      });
    });
  });

  describe('Given the same active refresh token is rotated by two concurrent calls', () => {
    describe('When both run at the same time', () => {
      it('Then exactly one should succeed', async () => {
        const familyId = randomUUID();
        const oldId = randomUUID();

        await repository.create({
          id: oldId,
          userId,
          familyId,
          expiresAt: new Date(Date.now() + 60 * 1000),
        });

        const [first, second] = await Promise.all([
          repository.rotate({
            oldId,
            newId: randomUUID(),
            userId,
            expiresAt: new Date(Date.now() + 60 * 1000),
          }),
          repository.rotate({
            oldId,
            newId: randomUUID(),
            userId,
            expiresAt: new Date(Date.now() + 60 * 1000),
          }),
        ]);

        const results = [first._unsafeUnwrap(), second._unsafeUnwrap()];
        const successes = results.filter((r) => r !== null);
        const failures = results.filter((r) => r === null);

        expect(successes).toHaveLength(1);
        expect(failures).toHaveLength(1);
      });
    });
  });
});