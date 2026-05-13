import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

describe('application baseline routes', () => {
  const app = createApp();

  it('returns health status for readiness checks', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });

  it('returns 422 when login payload is malformed', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ username: 'admin' });

    expect(response.status).toBe(422);
    expect(response.body.error).toBe('validation_error');
  });

  it('returns 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown-route');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('not_found');
  });
});
