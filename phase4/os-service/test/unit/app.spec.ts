import request from 'supertest';
import { createApp } from '../../src/app';
import { connectRabbitMQ, publishEvent, subscribeEvent } from '../../src/infra/rabbitmq';

const handlers = new Map<string, (payload: any) => void | Promise<void>>();

jest.mock('../../src/infra/rabbitmq', () => ({
  connectRabbitMQ: jest.fn(),
  publishEvent: jest.fn(),
  subscribeEvent: jest.fn(async (topic: string, handler: (payload: any) => void | Promise<void>) => {
    handlers.set(topic, handler);
  }),
}));

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    handlers.clear();
    (connectRabbitMQ as jest.Mock).mockResolvedValue(undefined);
    (publishEvent as jest.Mock).mockResolvedValue(undefined);
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

  it('TC0006 - Should return 404 on get order when not found', async () => {
    const { app } = await createApp();

    const response = await request(app).get('/orders/missing').expect(404);
    expect(response.body).toEqual({ message: 'Order not found' });
  });

  it('TC0007 - Should return 404 on patch status when not found', async () => {
    const { app } = await createApp();

    const response = await request(app)
      .patch('/orders/missing/status')
      .send({ status: 'COMPLETED' })
      .expect(404);

    expect(response.body).toEqual({ message: 'Order not found' });
  });
});
