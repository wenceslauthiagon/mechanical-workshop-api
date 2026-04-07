import request from 'supertest';
import { randomUUID } from 'crypto';
import { createApp } from '../../src/app';
import { Express } from 'express';

describe('Billing Service - Integration Tests', () => {
  const randomAmount = (min: number, max: number) => Number((Math.random() * (max - min) + min).toFixed(2));
  let app: Express;

  beforeAll(async () => {
    const ctx = await createApp();
    app = ctx.app;
  });

  describe('POST /billing/budget', () => {
    it('TC0001 - Should create a budget successfully', async () => {
      const payload = {
        orderId: randomUUID(),
        estimatedTotal: randomAmount(200, 3000),
      };

      const response = await request(app)
        .post('/billing/budget')
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
        .send({ orderId, estimatedTotal: amount })
        .expect(201);

      const paymentRes = await request(app)
        .post('/billing/payment/approve')
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
        .send({ budgetId: randomUUID(), amount: 500 })
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Budget not found');
    });
  });

  describe('GET /health', () => {
    it('TC0001 - Should return health status ok', async () => {
      const response = await request(app).get('/health').expect(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });
});
