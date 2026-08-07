import request from 'supertest';

import app from '@/app';

import { createUser } from '@modules/user/__tests__/helpers/create-user';
import { UserRepository } from '@modules/user/infrastructure/user.repository';
import { cleanDatabase } from '@tests/helpers/database';

import { HoaxRepository } from '../../infrastructure/hoax.repository';

const hoaxesUrl = '/api/1.0/hoaxes';

async function createHoaxes(
  repository: HoaxRepository,
  userId: number,
  count: number,
) {
  for (let i = 0; i < count; i++) {
    await repository.create({
      content: `Hoax number ${i} from user ${userId}`,
      userId,
    });
  }
}

describe(`GET ${hoaxesUrl}`, () => {
  let hoaxRepository: HoaxRepository;
  let userRepository: UserRepository;

  beforeEach(async () => {
    hoaxRepository = new HoaxRepository();
    userRepository = new UserRepository();

    await cleanDatabase();
  });

  describe('Given no hoax exists', () => {
    describe('When listing hoaxes', () => {
      it('Then it should return an empty page', async () => {
        const response = await request(app).get(hoaxesUrl);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          content: [],
          page: 0,
          size: 10,
          totalPages: 0,
        });
      });
    });
  });

  describe('Given hoaxes exist', () => {
    describe('When listing hoaxes without authentication', () => {
      it('Then it should still return them (listing is public)', async () => {
        const user = await createUser(userRepository);
        await createHoaxes(hoaxRepository, user.id, 3);

        const response = await request(app).get(hoaxesUrl);

        expect(response.status).toBe(200);
        expect(response.body.content).toHaveLength(3);
      });

      it('Then each hoax should include its author', async () => {
        const user = await createUser(userRepository);
        await createHoaxes(hoaxRepository, user.id, 1);

        const response = await request(app).get(hoaxesUrl);

        expect(response.body.content[0]).toEqual({
          id: expect.any(Number),
          content: expect.any(String),
          createdAt: expect.any(String),
          user: {
            id: user.id,
            username: 'john',
          },
        });
      });

      it('Then they should be sorted from most recent to oldest', async () => {
        const user = await createUser(userRepository);

        const first = (
          await hoaxRepository.create({ content: 'first hoax', userId: user.id })
        )._unsafeUnwrap();
        const second = (
          await hoaxRepository.create({ content: 'second hoax', userId: user.id })
        )._unsafeUnwrap();

        const response = await request(app).get(hoaxesUrl);

        expect(response.body.content.map((h: { id: number }) => h.id)).toEqual([
          second.id,
          first.id,
        ]);
      });
    });

    describe('When listing with pagination', () => {
      it('Then it should honor page and size and compute totalPages', async () => {
        const user = await createUser(userRepository);
        await createHoaxes(hoaxRepository, user.id, 15);

        const firstPage = await request(app)
          .get(hoaxesUrl)
          .query({ page: 0, size: 10 });

        expect(firstPage.body.content).toHaveLength(10);
        expect(firstPage.body.totalPages).toBe(2);

        const secondPage = await request(app)
          .get(hoaxesUrl)
          .query({ page: 1, size: 10 });

        expect(secondPage.body.content).toHaveLength(5);
      });
    });

    describe('When filtering by userId', () => {
      it('Then it should only return hoaxes from that user', async () => {
        const john = await createUser(userRepository);
        const jane = (
          await userRepository.create({
            username: 'jane',
            email: 'jane@mail.com',
            password: 'hashed-password',
          })
        )._unsafeUnwrap();

        await createHoaxes(hoaxRepository, john.id, 2);
        await createHoaxes(hoaxRepository, jane.id, 3);

        const response = await request(app)
          .get(hoaxesUrl)
          .query({ userId: jane.id });

        expect(response.body.content).toHaveLength(3);

        for (const hoax of response.body.content) {
          expect(hoax.user.id).toBe(jane.id);
        }
      });
    });
  });

  describe('Given invalid query parameters', () => {
    describe('When size exceeds the maximum', () => {
      it('Then it should return a validation error', async () => {
        const response = await request(app)
          .get(hoaxesUrl)
          .query({ size: 101 });

        expect(response.status).toBe(400);
        expect(response.body.error.type).toBe('ValidationError');
      });
    });

    describe('When page is negative', () => {
      it('Then it should return a validation error', async () => {
        const response = await request(app).get(hoaxesUrl).query({ page: -1 });

        expect(response.status).toBe(400);
        expect(response.body.error.type).toBe('ValidationError');
      });
    });
  });
});