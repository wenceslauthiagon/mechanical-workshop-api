import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { createApp } from '../../src/app';
import { connectRabbitMQ, publishEvent, subscribeEvent } from '../../src/infra/rabbitmq';
import { connectDatabase } from '../../src/infra/prisma.client';
import { OrderPrismaRepository } from '../../src/infra/order.prisma.repository';

const handlers = new Map<string, (payload: any) => void | Promise<void>>();

jest.mock('../../src/infra/rabbitmq', () => ({
  connectRabbitMQ: jest.fn(),
  publishEvent: jest.fn(),
  subscribeEvent: jest.fn(async (topic: string, handler: (payload: any) => void | Promise<void>) => {
    handlers.set(topic, handler);
  }),
}));

jest.mock('../../src/infra/prisma.client', () => ({
  connectDatabase: jest.fn(),
  prisma: {},
}));

jest.mock('../../src/infra/order.prisma.repository', () => ({
  OrderPrismaRepository: jest.fn(),
}));

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    handlers.clear();
    delete process.env.OS_USE_PRISMA_REPO;
    delete process.env.DATABASE_URL;
    (connectRabbitMQ as jest.Mock).mockResolvedValue(undefined);
    (publishEvent as jest.Mock).mockResolvedValue(undefined);
    (connectDatabase as jest.Mock).mockResolvedValue(undefined);
    (OrderPrismaRepository as unknown as jest.Mock).mockImplementation(() => ({}));
  });

  it('TC0001 - Should subscribe all saga topics on bootstrap', async () => {
    await createApp();

    expect(subscribeEvent).toHaveBeenCalledWith('event.billing.payment_confirmed', expect.any(Function));
    expect(subscribeEvent).toHaveBeenCalledWith('event.billing.payment_failed', expect.any(Function));
    expect(subscribeEvent).toHaveBeenCalledWith('event.execution.completed', expect.any(Function));
    expect(subscribeEvent).toHaveBeenCalledWith('event.execution.failed', expect.any(Function));
  });

  it('TC0002 - Should handle payment_confirmed and publish execution command', async () => {
    const { service } = await createApp();
    const order = await service.open('c1', 'v1', 'desc');

    const handler = handlers.get('event.billing.payment_confirmed');
    await handler?.({ orderId: order.id });

    expect((await service.get(order.id)).status).toBe('PAYMENT_CONFIRMED');
    expect(publishEvent).toHaveBeenCalledWith('command.execution.start', { orderId: order.id });
  });

  it('TC0003 - Should handle payment_failed and cancel order', async () => {
    const { service } = await createApp();
    const order = await service.open('c2', 'v2', 'desc2');

    const handler = handlers.get('event.billing.payment_failed');
    await handler?.({ orderId: order.id, reason: 'declined' });

    const current = await service.get(order.id);
    expect(current.status).toBe('CANCELLED');
    expect(current.history.at(-1)?.reason).toBe('declined');
  });

  it('TC0004 - Should handle execution.completed and complete order', async () => {
    const { service } = await createApp();
    const order = await service.open('c3', 'v3', 'desc3');
    await service.mark(order.id, 'PAYMENT_CONFIRMED');

    const handler = handlers.get('event.execution.completed');
    await handler?.({ orderId: order.id });

    expect((await service.get(order.id)).status).toBe('COMPLETED');
  });

  it('TC0005 - Should handle execution.failed and publish billing refund command', async () => {
    const { service } = await createApp();
    const order = await service.open('c4', 'v4', 'desc4');

    const handler = handlers.get('event.execution.failed');
    await handler?.({ orderId: order.id, reason: 'broken' });

    expect((await service.get(order.id)).status).toBe('CANCELLED');
    expect(publishEvent).toHaveBeenCalledWith('command.billing.refund', { orderId: order.id, reason: 'execution_failed' });
  });

  it('TC0008 - Should not publish duplicate execution command on repeated payment confirmation', async () => {
    const { service } = await createApp();
    const order = await service.open('c5', 'v5', 'desc5');

    const handler = handlers.get('event.billing.payment_confirmed');
    await handler?.({ orderId: order.id });
    await handler?.({ orderId: order.id });

    const executionStartCalls = (publishEvent as jest.Mock).mock.calls.filter(
      ([topic]) => topic === 'command.execution.start',
    );

    expect(executionStartCalls).toHaveLength(1);
  });

  it('TC0009 - Should return 409 on invalid transition via patch endpoint', async () => {
    const { app } = await createApp();

    const create = await request(app)
      .post('/orders')
      .send({ customerId: 'cx', vehicleId: 'vx', description: 'descx' })
      .expect(201);

    await request(app)
      .patch(`/orders/${create.body.id}/status`)
      .send({ status: 'PAYMENT_CONFIRMED' })
      .expect(200);

    await request(app)
      .patch(`/orders/${create.body.id}/status`)
      .send({ status: 'COMPLETED' })
      .expect(200);

    const response = await request(app)
      .patch(`/orders/${create.body.id}/status`)
      .send({ status: 'PAYMENT_CONFIRMED' })
      .expect(409);

    expect(response.body).toEqual({ message: 'Invalid status transition' });
  });

  it('TC0006 - Should return 404 on get order when not found', async () => {
    const { app } = await createApp();

    const response = await request(app).get(`/orders/${randomUUID()}`).expect(404);
    expect(response.body).toEqual({ message: 'Order not found' });
  });

  it('TC0007 - Should return 404 on patch status when not found', async () => {
    const { app } = await createApp();

    const response = await request(app)
      .patch(`/orders/${randomUUID()}/status`)
      .send({ status: 'COMPLETED' })
      .expect(404);

    expect(response.body).toEqual({ message: 'Order not found' });
  });

  it('TC0010 - Should return 400 when post orders receives invalid payload', async () => {
    const { app } = await createApp();

    const response = await request(app)
      .post('/orders')
      .send({ customerId: '', vehicleId: 'v', description: 'd' })
      .expect(400);

    expect(response.body).toEqual({ message: 'customerId is required' });
  });

  it('TC0011 - Should return 400 when get order receives invalid id', async () => {
    const { app } = await createApp();

    const response = await request(app)
      .get('/orders/invalid-id')
      .expect(400);

    expect(response.body).toEqual({ message: 'orderId must be a valid UUID' });
  });

  it('TC0012 - Should return history for existing order', async () => {
    const { app, service } = await createApp();
    const order = await service.open('c1', 'v1', 'd1');

    const response = await request(app)
      .get(`/orders/${order.id}/history`)
      .expect(200);

    expect(response.body).toMatchObject({ orderId: order.id, history: expect.any(Array) });
  });

  it('TC0013 - Should return 400 when history endpoint receives invalid id', async () => {
    const { app } = await createApp();

    const response = await request(app)
      .get('/orders/invalid-id/history')
      .expect(400);

    expect(response.body).toEqual({ message: 'orderId must be a valid UUID' });
  });

  it('TC0014 - Should return 404 when history not found', async () => {
    const { app } = await createApp();

    const response = await request(app)
      .get(`/orders/${randomUUID()}/history`)
      .expect(404);

    expect(response.body).toEqual({ message: 'Order not found' });
  });

  it('TC0015 - Should return 400 when patch receives invalid status', async () => {
    const { app } = await createApp();

    const response = await request(app)
      .patch(`/orders/${randomUUID()}/status`)
      .send({ status: 'INVALID_STATUS' })
      .expect(400);

    expect(response.body).toHaveProperty('message');
  });

  it('TC0016 - Should initialize Prisma repository when feature flag is enabled', async () => {
    process.env.OS_USE_PRISMA_REPO = 'true';
    process.env.DATABASE_URL = 'postgresql://local/test';

    await createApp();

    expect(connectDatabase).toHaveBeenCalledTimes(1);
    expect(OrderPrismaRepository).toHaveBeenCalledTimes(1);
  });

  it('TC0017 - Should swallow transition errors and avoid execution start publish', async () => {
    await createApp();

    const handler = handlers.get('event.billing.payment_confirmed');
    await expect(handler?.({ orderId: randomUUID() })).resolves.toBeUndefined();

    expect(publishEvent).not.toHaveBeenCalledWith('command.execution.start', expect.anything());
  });
});
