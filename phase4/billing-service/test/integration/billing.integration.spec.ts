import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { createApp } from '../../src/app';
import { Express } from 'express';
import jwt from 'jsonwebtoken';

describe('Billing Service - Integration Tests', () => {
  const randomAmount = (min: number, max: number) => Number((Math.random() * (max - min) + min).toFixed(2));
  let app: Express;
  let validToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    const ctx = await createApp();
    app = ctx.app;
    validToken = jwt.sign({ sub: 'test-user' }, process.env.JWT_SECRET);
  });

  describe('POST /billing/budget', () => {
    it('TC0001 - Should create a budget successfully', async () => {
      const payload = {
        orderId: randomUUID(),
        estimatedTotal: randomAmount(200, 3000),
      };

      const response = await request(app)
        .post('/billing/budget')
        .set('Authorization', `Bearer ${validToken}`)
        .send(payload)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        orderId: payload.orderId,
        estimatedTotal: payload.estimatedTotal,
        status: 'SENT',
      });
    });
  });

  describe('POST /billing/payment/approve', () => {
    it('TC0001 - Should approve payment for existing budget', async () => {
      const orderId = randomUUID();
      const amount = randomAmount(100, 2000);

      const budgetRes = await request(app)
        .post('/billing/budget')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ orderId, estimatedTotal: amount })
        .expect(201);

      const paymentRes = await request(app)
        .post('/billing/payment/approve')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ budgetId: budgetRes.body.id, amount })
        .expect(201);

      expect(paymentRes.body).toMatchObject({
        id: expect.any(String),
        budgetId: budgetRes.body.id,
        amount,
        status: 'CONFIRMED',
      });
    });

    it('TC0002 - Should return 404 when budget not found', async () => {
      const response = await request(app)
        .post('/billing/payment/approve')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ budgetId: randomUUID(), amount: 500 })
        .expect(404);

      expect(response.body).toHaveProperty('message', 'BUDGET_NOT_FOUND');
    });
  });

  describe('GET /health', () => {
    it('TC0001 - Should return health status ok', async () => {
      const response = await request(app).get('/health').expect(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('JWT Authentication', () => {
    it('TC0001 - Should return 401 when no authorization header', async () => {
      const response = await request(app)
        .post('/billing/budget')
        .send({ orderId: randomUUID(), estimatedTotal: 1000 })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'UNAUTHORIZED');
    });

    it('TC0002 - Should return 401 when authorization header does not start with Bearer', async () => {
      const response = await request(app)
        .post('/billing/budget')
        .set('Authorization', 'Basic abc123')
        .send({ orderId: randomUUID(), estimatedTotal: 1000 })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'UNAUTHORIZED');
    });

    it('TC0003 - Should return 403 when token is invalid', async () => {
      const response = await request(app)
        .post('/billing/budget')
        .set('Authorization', 'Bearer invalid.token.here')
        .send({ orderId: randomUUID(), estimatedTotal: 1000 })
        .expect(403);

      expect(response.body).toHaveProperty('message', 'FORBIDDEN');
    });

    it('TC0004 - Should bypass JWT for GET /health', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({ status: 'ok' });
    });

    it('TC0005 - Should bypass JWT for /api-docs', async () => {
      const response = await request(app)
        .get('/api-docs/')
        .expect(200);

      expect(response.text).toContain('Swagger UI');
    });
  });
});
