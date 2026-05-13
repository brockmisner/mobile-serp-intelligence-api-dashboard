import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

describe('authentication middleware', () => {
  const app = createApp();

  it('returns 401 for protected route without a token', async () => {
    const response = await request(app).get('/serp');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('unauthenticated');
  });

  it('returns 401 for login with bad credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ username: 'admin', password: 'wrong-password' });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('invalid_credentials');
  });

  it('issues a token and allows protected route access', async () => {
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({ username: 'admin', password: 'password123' });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.accessToken).toBeTypeOf('string');

    const token = loginResponse.body.accessToken;
    const protectedResponse = await request(app)
      .get('/serp')
      .set('Authorization', `Bearer ${token}`);

    expect(protectedResponse.status).toBe(200);
    expect(protectedResponse.body.requestedBy).toBe('admin');
    expect(protectedResponse.body.data).toHaveLength(1);
  });
});
