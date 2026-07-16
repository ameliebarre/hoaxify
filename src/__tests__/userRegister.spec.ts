import request from 'supertest';

import app from '@/app';

describe('User Registration', () => {
  it('returns 200 when signup request is valid', async () => {
    const response = await request(app).post('/api/1.0/auth').send({
      username: 'user1',
      email: 'user1@mail.com',
      password: 'P4ssword',
    });

    expect(response.status).toBe(200);
  });

  it('returns success message when signup request is valid', async () => {
    const response = await request(app).post('/api/1.0/auth').send({
      username: 'user1',
      email: 'user1@mail.com',
      password: 'P4ssword',
    });

    expect(response.body.message).toBe('User created');
  });
});
