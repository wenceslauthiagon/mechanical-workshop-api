import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { createApp } from '../../src/app';
import { connectRabbitMQ, publishEvent, subscribeEvent } from '../../src/infra/rabbitmq';
import { processPayment } from '../../src/infra/mercadopago.client';
import { connectDatabase } from '../../src/infra/prisma.client';

const handlers = new Map<string, (payload: any) => Promise<void>>();

const mockService = {
  generateBudget: jest.fn(),
  approvePayment: jest.fn(),
  approveOrderPayment: jest.fn(),
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

jest.mock('../../src/infra/prisma.client', () => ({
  connectDatabase: jest.fn(),
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
    (connectDatabase as jest.Mock).mockResolvedValue({});

    budgetId = randomUUID();
    orderId = randomUUID();
    paymentId = randomUUID();

    mockService.generateBudget.mockResolvedValue({ id: budgetId, orderId, estimatedTotal: 1000, status: 'SENT' });
    mockService.approvePayment.mockResolvedValue({ id: paymentId, budgetId, amount: 1000, status: 'CONFIRMED' });
    mockService.approveOrderPayment.mockResolvedValue({
      budget: { id: budgetId, orderId, estimatedTotal: 1000, status: 'APPROVED' },
      payment: { id: paymentId, budgetId, amount: 1000, status: 'CONFIRMED', mercadopagoId: 'mp-1' },
    });
    mockService.getOrderBilling.mockResolvedValue({
      budget: { id: budgetId, orderId, estimatedTotal: 1000, status: 'SENT' },
    });
    mockService.refund.mockResolvedValue(undefined);
  });

  it('TC0001 - Should register event subscriptions on bootstrap', async () => {
    await createApp();

    expect(subscribeEvent).toHaveBeenCalledWith('command.billing.generate', expect.any(Function));
    expect(subscribeEvent).toHaveBeenCalledWith('command.billing.approve', expect.any(Function));
    expect(subscribeEvent).toHaveBeenCalledWith('command.billing.refund', expect.any(Function));
  });

  it('TC0002 - Should generate budget when generate command succeeds', async () => {
    await createApp();

    const handler = handlers.get('command.billing.generate');
    await handler?.({ orderId, estimatedTotal: 1000 });

    expect(mockService.generateBudget).toHaveBeenCalledWith(orderId, 1000);
    expect(mockService.approvePayment).not.toHaveBeenCalled();
  });

  it('TC0002A - Should publish payment_failed when Mercado Pago does not approve on approve command', async () => {
    const failedOrderId = randomUUID();
    (processPayment as jest.Mock).mockResolvedValue({ id: 'mp-2', status: 'rejected' });

    await createApp();

    const handler = handlers.get('command.billing.approve');
    await handler?.({ orderId: failedOrderId });

    expect(publishEvent).toHaveBeenCalledWith(
      'event.billing.payment_failed',
      expect.objectContaining({ orderId: failedOrderId, reason: 'PAYMENT_NOT_APPROVED_REJECTED' }),
    );
  });

  it('TC0003 - Should publish budget_generation_failed when generate command throws', async () => {
    const failedOrderId = randomUUID();
    mockService.generateBudget.mockImplementation(async () => {
      throw new Error('BUDGET_ERROR');
    });

    await createApp();

    const handler = handlers.get('command.billing.generate');
    await handler?.({ orderId: failedOrderId, estimatedTotal: 800 });

    expect(publishEvent).toHaveBeenCalledWith(
      'event.billing.budget_generation_failed',
      expect.objectContaining({ orderId: failedOrderId, reason: 'BUDGET_ERROR' }),
    );
  });

  it('TC0003A - Should call payment approval flow on approve command success', async () => {
    await createApp();

    const handler = handlers.get('command.billing.approve');
    await handler?.({ orderId });

    expect(mockService.getOrderBilling).toHaveBeenCalledWith(orderId);
    expect(processPayment).toHaveBeenCalledWith(1000, expect.stringContaining(orderId));
    expect(mockService.approveOrderPayment).toHaveBeenCalledWith(orderId, 'mp-1');
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
    mockService.refund.mockImplementation(async () => {
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
    mockService.approvePayment.mockImplementation(async () => {
      throw new Error('BUDGET_NOT_FOUND');
    });

    const { app } = await createApp();

    const response = await request(app)
      .post('/billing/payment/approve')
      .send({ budgetId: randomUUID(), amount: 100 })
      .expect(404);

    expect(response.body).toEqual({ message: 'BUDGET_NOT_FOUND' });
  });

  it('TC0006A - Should return 500 on payment approve endpoint when unknown error occurs', async () => {
    mockService.approvePayment.mockImplementation(async () => {
      throw new Error('DB_ERROR');
    });

    const { app } = await createApp();

    const response = await request(app)
      .post('/billing/payment/approve')
      .send({ budgetId: randomUUID(), amount: 100 })
      .expect(500);

    expect(response.body).toEqual({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
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
    mockService.getOrderBilling.mockResolvedValue({ budget: { id: 'b1' } });
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
    mockService.getOrderBilling.mockImplementation(async () => {
      throw new Error('BUDGET_NOT_FOUND');
    });
    const { app } = await createApp();

    const response = await request(app)
      .get(`/billing/order/${randomUUID()}`)
      .expect(404);

    expect(response.body).toEqual({ message: 'BUDGET_NOT_FOUND' });
  });

  it('TC0012A - Should return 500 when order billing fails with unknown error', async () => {
    mockService.getOrderBilling.mockImplementation(async () => {
      throw new Error('DB_ERROR');
    });
    const { app } = await createApp();

    const response = await request(app)
      .get(`/billing/order/${randomUUID()}`)
      .expect(500);

    expect(response.body).toEqual({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
  });

  it('TC0013 - Should swallow publishEvent rejection after payment_confirmed', async () => {
    (publishEvent as jest.Mock).mockRejectedValue(new Error('PUB_ERR'));
    await createApp();
    const handler = handlers.get('command.billing.generate');
    await expect(handler?.({ orderId: 'o1', estimatedTotal: 500 })).resolves.toBeUndefined();
  });

  it('TC0014 - Should swallow publishEvent rejection after payment_failed', async () => {
    mockService.getOrderBilling.mockResolvedValue({
      budget: { id: budgetId, orderId: 'o1', estimatedTotal: 500, status: 'SENT' },
    });
    (processPayment as jest.Mock).mockResolvedValue({ id: 'mp-2', status: 'rejected' });
    (publishEvent as jest.Mock).mockRejectedValue(new Error('PUB_ERR'));
    await createApp();
    const handler = handlers.get('command.billing.approve');
    await expect(handler?.({ orderId: 'o1' })).resolves.toBeUndefined();
  });

  it('TC0015 - Should return 500 when budget creation fails with unknown error', async () => {
    mockService.generateBudget.mockImplementation(async () => {
      throw new Error('DB_ERROR');
    });

    const { app } = await createApp();

    const response = await request(app)
      .post('/billing/budget')
      .send({ orderId: randomUUID(), estimatedTotal: 1000 })
      .expect(500);

    expect(response.body).toEqual({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
  });
});
