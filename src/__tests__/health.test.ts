import request from 'supertest';
import app from '../../src/infrastructure/api/server';

describe('Health', () => {
  it('should return 200 on /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });
});
