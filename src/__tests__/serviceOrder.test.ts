import request from 'supertest';
import app from '../infrastructure/api/server';

describe('Service Orders API', () => {
  let createdId: string | null = null;

  it('creates a service order', async () => {
    const res = await request(app)
      .post('/api/service-orders')
      .send({
        clientName: 'Cliente Teste',
        clientContact: '999999999',
        vehicle: { plate: 'ABC-1234', model: 'Fiesta' },
        services: [{ code: 'S1', description: 'Troca de óleo' }],
        parts: [{ code: 'P1', description: 'Filtro' }]
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdId = res.body.id;
  });

  it('gets status of created order', async () => {
    if (!createdId) return;
    const res = await request(app).get(`/api/service-orders/${createdId}/status`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
  });

  it('lists service orders', async () => {
    const res = await request(app).get('/api/service-orders');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
