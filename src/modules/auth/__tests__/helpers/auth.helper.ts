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

export function extractRefreshTokenCookie(
  setCookieHeader: string | string[] | undefined,
): string | undefined {
  if (!setCookieHeader) return undefined;
  const cookies = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : [setCookieHeader];
  return cookies.find((cookie) => cookie.startsWith('refreshToken='));
}

export async function loginWithRefreshToken(user: {
  username?: string;
  email: string;
  password: string;
}) {
  await signup({
    username: user.username ?? 'john',
    email: user.email,
    password: user.password,
  });

  const response = await login({
    email: user.email,
    password: user.password,
  });

  return {
    response,
    cookies: extractRefreshTokenCookie(response.headers['set-cookie']),
  };
}
