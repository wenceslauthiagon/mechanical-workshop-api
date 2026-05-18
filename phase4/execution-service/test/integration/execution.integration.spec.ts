import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { createApp } from '../../src/app';
import { Express } from 'express';

describe('Execution Service - Integration Tests', () => {
  let app: Express;

  beforeAll(async () => {
    const ctx = await createApp();
    app = ctx.app;
  });

  describe('POST /execution/start', () => {
    it('TC0001 - Should start an execution record successfully', async () => {
      const orderId = randomUUID();

      const response = await request(app)
        .post('/execution/start')
        .send({ orderId })
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        orderId,
        status: 'QUEUED',
        notes: [],
      });
      expect(response.body.startedAt).toBeDefined();
    });
  });

  describe('PATCH /execution/:id/status', () => {
    it('TC0001 - Should update status to IN_PROGRESS', async () => {
      const orderId = randomUUID();
      const startRes = await request(app)
        .post('/execution/start')
        .send({ orderId })
        .expect(201);

      const note = 'nota-andamento';
      const response = await request(app)
        .patch(`/execution/${startRes.body.id}/status`)
        .send({ status: 'IN_PROGRESS', note })
        .expect(200);

      expect(response.body.status).toBe('IN_PROGRESS');
      expect(response.body.notes).toContain(note);
    });

    it('TC0002 - Should update status to COMPLETED', async () => {
      const orderId = randomUUID();
      const startRes = await request(app)
        .post('/execution/start')
        .send({ orderId })
        .expect(201);

      const response = await request(app)
        .patch(`/execution/${startRes.body.id}/status`)
        .send({ status: 'COMPLETED', note: 'Serviço finalizado' })
        .expect(200);

      expect(response.body.status).toBe('COMPLETED');
      expect(response.body.completedAt).toBeDefined();
    });

    it('TC0003 - Should return 404 when execution not found', async () => {
      const response = await request(app)
        .patch(`/execution/${randomUUID()}/status`)
        .send({ status: 'COMPLETED' })
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Execution not found');
    });
  });

  describe('GET /health', () => {
    it('TC0001 - Should return health status ok', async () => {
      const response = await request(app).get('/health').expect(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });
});
