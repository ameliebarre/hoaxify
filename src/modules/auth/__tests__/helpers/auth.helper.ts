import request from 'supertest';

import app from '@/app';

export function signup(user: object) {
  return request(app).post('/api/1.0/auth/signup').send(user);
}

export function login(user: object) {
  return request(app).post('/api/1.0/auth/login').send(user);
}

export async function authenticate() {
  await signup({
    username: 'john',
    email: 'john@mail.com',
    password: 'P4ssword',
  });

  const loginResponse = await login({
    email: 'john@mail.com',
    password: 'P4ssword',
  });

  return loginResponse.body.accessToken as string;
}
