import request from 'supertest';

import app from '@/app';

describe('Security headers', () => {
  describe('Given any request to the API', () => {
    describe('When the response is returned', () => {
      it('Then it should include the helmet security headers', async () => {
        const response = await request(app).get('/api/1.0');

        expect(response.headers['x-content-type-options']).toBe('nosniff');
        expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
        expect(response.headers['x-dns-prefetch-control']).toBe('off');
        expect(response.headers['strict-transport-security']).toContain(
          'max-age=',
        );
        expect(response.headers['content-security-policy']).toBeDefined();
      });
    });
  });
});
