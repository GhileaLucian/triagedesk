import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { createDatabase } from '../src/db.js';

describe('GET /api/health', () => {
  it('should return 200 OK with service status and timestamp', async () => {
    const db = createDatabase(':memory:');
    const { app } = createApp({ db });

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('triagedesk-api');
    expect(res.body.timestamp).toBeDefined();
  });
});
