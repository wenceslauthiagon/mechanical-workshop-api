import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { createApp } from '../../src/app';
import { connectRabbitMQ, publishEvent, subscribeEvent } from '../../src/infra/rabbitmq';
import { processPayment } from '../../src/infra/mercadopago.client';

const handlers = new Map<string, (payload: any) => Promise<void>>();

const mockService = {
  generateBudget: jest.fn(),
  approvePayment: jest.fn(),
  refund: jest.fn(),
  getOrderBilling: jest.fn(),
};

jest.mock('../../src/infra/rabbitmq', () => ({
  connectRabbitMQ: jest.fn(),
  publishEvent: jest.fn(),
  subscribeEvent: jest.fn(async (topic: string, handler: (payload: any) => Promise<void>) => {
    handlers.set(topic, handler);
  }),
}));

jest.mock('../../src/billing.service', () => ({
  BillingService: jest.fn().mockImplementation(() => mockService),
}));

jest.mock('../../src/infra/mercadopago.client', () => ({
  processPayment: jest.fn(),
}));

describe('App', () => {
  let budgetId: string;
  let orderId: string;
  let paymentId: string;

  beforeEach(() => {
    jest.clearAllMocks();
    handlers.clear();
    (connectRabbitMQ as jest.Mock).mockResolvedValue(undefined);
    (publishEvent as jest.Mock).mockResolvedValue(undefined);
    (processPayment as jest.Mock).mockResolvedValue({ id: 'mp-1', status: 'approved' });

    budgetId = randomUUID();
    orderId = randomUUID();
    paymentId = randomUUID();

    mockService.generateBudget.mockReturnValue({ id: budgetId, orderId, estimatedTotal: 1000, status: 'SENT' });
    mockService.approvePayment.mockReturnValue({ id: paymentId, budgetId, amount: 1000, status: 'CONFIRMED' });
    mockService.refund.mockReturnValue(undefined);
  });

  it('TC0001 - Should register event subscriptions on bootstrap', async () => {
    await createApp();

    expect(subscribeEvent).toHaveBeenCalledWith('command.billing.generate', expect.any(Function));
    expect(subscribeEvent).toHaveBeenCalledWith('command.billing.refund', expect.any(Function));
  });

  it('TC0002 - Should publish payment_confirmed when generate command succeeds', async () => {
    await createApp();

    const handler = handlers.get('command.billing.generate');
    await handler?.({ orderId, estimatedTotal: 1000 });

    expect(mockService.generateBudget).toHaveBeenCalledWith(orderId, 1000);
    expect(mockService.approvePayment).toHaveBeenCalledWith(budgetId, 1000);
    expect(publishEvent).toHaveBeenCalledWith(
      'event.billing.payment_confirmed',
      expect.objectContaining({ orderId, budgetId, paymentId, mercadopagoId: 'mp-1', amount: 1000 }),
    );
  });

  it('TC0002A - Should publish payment_failed when Mercado Pago does not approve', async () => {
    const failedOrderId = randomUUID();
    (processPayment as jest.Mock).mockResolvedValue({ id: 'mp-2', status: 'rejected' });

    await createApp();

    const handler = handlers.get('command.billing.generate');
    await handler?.({ orderId: failedOrderId, estimatedTotal: 1000 });

    expect(publishEvent).toHaveBeenCalledWith(
      'event.billing.payment_failed',
      expect.objectContaining({ orderId: failedOrderId, reason: 'PAYMENT_NOT_APPROVED_REJECTED' }),
    );
  });

  it('TC0003 - Should publish payment_failed when generate command throws', async () => {
    const failedOrderId = randomUUID();
    mockService.approvePayment.mockImplementation(() => {
      throw new Error('PAYMENT_ERROR');
    });

    await createApp();

    const handler = handlers.get('command.billing.generate');
    await handler?.({ orderId: failedOrderId, estimatedTotal: 800 });

    expect(publishEvent).toHaveBeenCalledWith(
      'event.billing.payment_failed',
      expect.objectContaining({ orderId: failedOrderId, reason: 'PAYMENT_ERROR' }),
    );
  });

  it('TC0004 - Should publish refunded event on refund command success', async () => {
    const refundedOrderId = randomUUID();
    await createApp();

    const handler = handlers.get('command.billing.refund');
    await handler?.({ orderId: refundedOrderId, reason: 'execution_failed' });

    expect(mockService.refund).toHaveBeenCalledWith(refundedOrderId, 'execution_failed');
    expect(publishEvent).toHaveBeenCalledWith('event.billing.refunded', { orderId: refundedOrderId });
  });

  it('TC0005 - Should swallow refund errors without rethrowing', async () => {
    const refundOrderId = randomUUID();
    mockService.refund.mockImplementation(() => {
      throw new Error('REFUND_ERROR');
    });

    await createApp();

    const handler = handlers.get('command.billing.refund');
    await expect(handler?.({ orderId: refundOrderId, reason: 'execution_failed' })).resolves.toBeUndefined();
    expect(publishEvent).toHaveBeenCalledWith(
      'event.billing.refund_failed',
      expect.objectContaining({ orderId: refundOrderId, reason: 'REFUND_ERROR' }),
    );
  });

  it('TC0006 - Should return 404 on payment approve endpoint when budget is missing', async () => {
    mockService.approvePayment.mockImplementation(() => {
      throw new Error('BUDGET_NOT_FOUND');
    });

    const { app } = await createApp();

    const response = await request(app)
      .post('/billing/payment/approve')
      .send({ budgetId: randomUUID(), amount: 100 })
      .expect(404);

    expect(response.body).toEqual({ message: 'BUDGET_NOT_FOUND' });
  });

  it('TC0007 - Should return 402 when Mercado Pago does not approve endpoint payment', async () => {
    (processPayment as jest.Mock).mockResolvedValue({ id: 'mp-3', status: 'in_process' });

    const { app } = await createApp();

    const response = await request(app)
      .post('/billing/payment/approve')
      .send({ budgetId: randomUUID(), amount: 100 })
      .expect(402);

    expect(response.body).toEqual({ message: 'Payment not approved: in_process' });
  });

  it('TC0008 - Should return 400 when budget endpoint receives invalid order id', async () => {
    const { app } = await createApp();

    const response = await request(app)
      .post('/billing/budget')
      .send({ orderId: 'invalid-id', estimatedTotal: 500 })
      .expect(400);

    expect(response.body).toEqual({ message: 'orderId must be a valid UUID' });
  });

  it('TC0009 - Should return 400 when approve endpoint receives invalid budget id', async () => {
    const { app } = await createApp();

    const response = await request(app)
      .post('/billing/payment/approve')
      .send({ budgetId: 'invalid-id', amount: 100 })
      .expect(400);

    expect(response.body).toEqual({ message: 'budgetId must be a valid UUID' });
  });

  it('TC0010 - Should return order billing info', async () => {
    mockService.getOrderBilling.mockReturnValue({ budget: { id: 'b1' } });
    const { app } = await createApp();
    const orderId = randomUUID();

    const response = await request(app)
      .get(`/billing/order/${orderId}`)
      .expect(200);

    expect(mockService.getOrderBilling).toHaveBeenCalledWith(orderId);
    expect(response.body).toEqual({ budget: { id: 'b1' } });
  });

  it('TC0011 - Should return 400 when order billing receives invalid order id', async () => {
    const { app } = await createApp();

    const response = await request(app)
      .get('/billing/order/invalid-id')
      .expect(400);

    expect(response.body).toEqual({ message: 'orderId must be a valid UUID' });
  });

  it('TC0012 - Should return 404 when order billing is not found', async () => {
    mockService.getOrderBilling.mockImplementation(() => {
      throw new Error('BUDGET_NOT_FOUND');
    });
    const { app } = await createApp();

    const response = await request(app)
      .get(`/billing/order/${randomUUID()}`)
      .expect(404);

    expect(response.body).toEqual({ message: 'BUDGET_NOT_FOUND' });
  });

  it('TC0013 - Should swallow publishEvent rejection after payment_confirmed', async () => {
    (publishEvent as jest.Mock).mockRejectedValue(new Error('PUB_ERR'));
    await createApp();
    const handler = handlers.get('command.billing.generate');
    await expect(handler?.({ orderId: 'o1', estimatedTotal: 500 })).resolves.toBeUndefined();
  });

  it('TC0014 - Should swallow publishEvent rejection after payment_failed', async () => {
    mockService.approvePayment.mockImplementation(() => { throw new Error('PAY_ERR'); });
    (publishEvent as jest.Mock).mockRejectedValue(new Error('PUB_ERR'));
    await createApp();
    const handler = handlers.get('command.billing.generate');
    await expect(handler?.({ orderId: 'o1', estimatedTotal: 500 })).resolves.toBeUndefined();
  });
});
