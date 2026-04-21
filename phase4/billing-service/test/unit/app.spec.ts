import request from 'supertest';
import { createApp } from '../../src/app';
import { connectRabbitMQ, publishEvent, subscribeEvent } from '../../src/infra/rabbitmq';
import { processPayment } from '../../src/infra/mercadopago.client';

const handlers = new Map<string, (payload: any) => Promise<void>>();

const mockService = {
  generateBudget: jest.fn(),
  approvePayment: jest.fn(),
  refund: jest.fn(),
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
  beforeEach(() => {
    jest.clearAllMocks();
    handlers.clear();
    (connectRabbitMQ as jest.Mock).mockResolvedValue(undefined);
    (publishEvent as jest.Mock).mockResolvedValue(undefined);
    (processPayment as jest.Mock).mockResolvedValue({ id: 'mp-1', status: 'approved' });

    mockService.generateBudget.mockReturnValue({ id: 'budget-1', orderId: 'order-1', estimatedTotal: 1000, status: 'SENT' });
    mockService.approvePayment.mockReturnValue({ id: 'payment-1', budgetId: 'budget-1', amount: 1000, status: 'CONFIRMED' });
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
    await handler?.({ orderId: 'order-1', estimatedTotal: 1000 });

    expect(mockService.generateBudget).toHaveBeenCalledWith('order-1', 1000);
    expect(mockService.approvePayment).toHaveBeenCalledWith('budget-1', 1000);
    expect(publishEvent).toHaveBeenCalledWith(
      'event.billing.payment_confirmed',
      expect.objectContaining({ orderId: 'order-1', budgetId: 'budget-1', paymentId: 'payment-1', mercadopagoId: 'mp-1', amount: 1000 }),
    );
  });

  it('TC0002A - Should publish payment_failed when Mercado Pago does not approve', async () => {
    (processPayment as jest.Mock).mockResolvedValue({ id: 'mp-2', status: 'rejected' });

    await createApp();

    const handler = handlers.get('command.billing.generate');
    await handler?.({ orderId: 'order-1', estimatedTotal: 1000 });

    expect(publishEvent).toHaveBeenCalledWith(
      'event.billing.payment_failed',
      expect.objectContaining({ orderId: 'order-1', reason: 'PAYMENT_NOT_APPROVED_REJECTED' }),
    );
  });

  it('TC0003 - Should publish payment_failed when generate command throws', async () => {
    mockService.approvePayment.mockImplementation(() => {
      throw new Error('PAYMENT_ERROR');
    });

    await createApp();

    const handler = handlers.get('command.billing.generate');
    await handler?.({ orderId: 'order-2', estimatedTotal: 800 });

    expect(publishEvent).toHaveBeenCalledWith(
      'event.billing.payment_failed',
      expect.objectContaining({ orderId: 'order-2', reason: 'PAYMENT_ERROR' }),
    );
  });

  it('TC0004 - Should publish refunded event on refund command success', async () => {
    await createApp();

    const handler = handlers.get('command.billing.refund');
    await handler?.({ orderId: 'order-3', reason: 'execution_failed' });

    expect(mockService.refund).toHaveBeenCalledWith('order-3', 'execution_failed');
    expect(publishEvent).toHaveBeenCalledWith('event.billing.refunded', { orderId: 'order-3' });
  });

  it('TC0005 - Should swallow refund errors without rethrowing', async () => {
    mockService.refund.mockImplementation(() => {
      throw new Error('REFUND_ERROR');
    });

    await createApp();

    const handler = handlers.get('command.billing.refund');
    await expect(handler?.({ orderId: 'order-3', reason: 'execution_failed' })).resolves.toBeUndefined();
    expect(publishEvent).toHaveBeenCalledWith(
      'event.billing.refund_failed',
      expect.objectContaining({ orderId: 'order-3', reason: 'REFUND_ERROR' }),
    );
  });

  it('TC0006 - Should return 404 on payment approve endpoint when budget is missing', async () => {
    mockService.approvePayment.mockImplementation(() => {
      throw new Error('BUDGET_NOT_FOUND');
    });

    const { app } = await createApp();

    const response = await request(app)
      .post('/billing/payment/approve')
      .send({ budgetId: 'missing', amount: 100 })
      .expect(404);

    expect(response.body).toEqual({ message: 'BUDGET_NOT_FOUND' });
  });

  it('TC0007 - Should return 402 when Mercado Pago does not approve endpoint payment', async () => {
    (processPayment as jest.Mock).mockResolvedValue({ id: 'mp-3', status: 'in_process' });

    const { app } = await createApp();

    const response = await request(app)
      .post('/billing/payment/approve')
      .send({ budgetId: 'budget-1', amount: 100 })
      .expect(402);

    expect(response.body).toEqual({ message: 'Payment not approved: in_process' });
  });
});
