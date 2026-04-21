import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { createApp } from '../../src/app';
import { Express } from 'express';

const randomText = () => `desc-${Math.random().toString(36).slice(2, 10)}`;

describe('OS Service - Integration Tests', () => {
  let app: Express;

  beforeAll(async () => {
    const ctx = await createApp();
    app = ctx.app;
  });

  describe('POST /orders', () => {
    it('TC0001 - Should create a service order with status OPENED', async () => {
      const payload = {
        customerId: randomUUID(),
        vehicleId: randomUUID(),
        description: randomText(),
      };

      const response = await request(app)
        .post('/orders')
        .send(payload)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        customerId: payload.customerId,
        vehicleId: payload.vehicleId,
        description: payload.description,
        status: 'OPENED',
      });
      expect(response.body.history).toHaveLength(1);
      expect(response.body.history[0].status).toBe('OPENED');
    });
  });

  describe('GET /orders/:id', () => {
    it('TC0001 - Should return order by id', async () => {
      const createRes = await request(app)
        .post('/orders')
        .send({
          customerId: randomUUID(),
          vehicleId: randomUUID(),
          description: randomText(),
        })
        .expect(201);

      const response = await request(app)
        .get(`/orders/${createRes.body.id}`)
        .expect(200);

      expect(response.body.id).toBe(createRes.body.id);
    });

    it('TC0002 - Should return 404 when order not found', async () => {
      const response = await request(app)
        .get(`/orders/${randomUUID()}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Order not found');
    });
  });

  describe('PATCH /orders/:id/status', () => {
    it('TC0001 - Should update order status to PAYMENT_CONFIRMED', async () => {
      const createRes = await request(app)
        .post('/orders')
        .send({
          customerId: randomUUID(),
          vehicleId: randomUUID(),
          description: randomText(),
        })
        .expect(201);

      const response = await request(app)
        .patch(`/orders/${createRes.body.id}/status`)
        .send({ status: 'PAYMENT_CONFIRMED' })
        .expect(200);

      expect(response.body.status).toBe('PAYMENT_CONFIRMED');
      expect(response.body.history).toHaveLength(2);
    });

    it('TC0002 - Should cancel order with reason', async () => {
      const createRes = await request(app)
        .post('/orders')
        .send({
          customerId: randomUUID(),
          vehicleId: randomUUID(),
          description: randomText(),
        })
        .expect(201);

      const reason = 'Pagamento recusado';
      const response = await request(app)
        .patch(`/orders/${createRes.body.id}/status`)
        .send({ status: 'CANCELLED', reason })
        .expect(200);

      expect(response.body.status).toBe('CANCELLED');
      expect(response.body.history[1].reason).toBe(reason);
    });

    it('TC0003 - Should return 404 when order not found', async () => {
      const response = await request(app)
        .patch(`/orders/${randomUUID()}/status`)
        .send({ status: 'COMPLETED' })
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Order not found');
    });
  });

  describe('GET /health', () => {
    it('TC0001 - Should return health status ok', async () => {
      const response = await request(app).get('/health').expect(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });
});
