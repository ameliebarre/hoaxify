import request from 'supertest';

import app from '@/app';

export function signup(user: object) {
  return request(app).post('/api/1.0/auth/signup').send(user);
}
