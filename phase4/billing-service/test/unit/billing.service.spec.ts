import { randomUUID } from 'node:crypto';
import { BillingService } from '../../src/billing.service';

const orderId = randomUUID();

describe('BillingService', () => {
  const randomAmount = (min: number, max: number) => Number((Math.random() * (max - min) + min).toFixed(2));
  let eventEmitter: jest.Mock;
  let service: BillingService;

  beforeEach(() => {
    eventEmitter = jest.fn();
    service = new BillingService(eventEmitter);
  });

  it('TC0001 - Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateBudget', () => {
    it('TC0001 - Should create budget successfully with status SENT', async () => {
      
      const estimatedTotal = randomAmount(100, 5000);

      const budget = await service.generateBudget(orderId, estimatedTotal);

      expect(budget.id).toBeDefined();
      expect(budget.orderId).toBe(orderId);
      expect(budget.estimatedTotal).toBe(estimatedTotal);
      expect(budget.status).toBe('SENT');
    });

    it('TC0002 - Should generate unique ids for different budgets', async () => {
      const b1 = await service.generateBudget(randomUUID(), 100);
      const b2 = await service.generateBudget(randomUUID(), 200);

      expect(b1.id).not.toBe(b2.id);
    });
  });

  describe('approvePayment', () => {
    it('TC0001 - Should approve payment and emit payment_confirmed event', async () => {
      const amount = randomAmount(100, 3000);

      const budget = await service.generateBudget(orderId, amount);
      const payment = await service.approvePayment(budget.id, amount);

      expect(payment.id).toBeDefined();
      expect(payment.budgetId).toBe(budget.id);
      expect(payment.amount).toBe(amount);
      expect(payment.status).toBe('CONFIRMED');
      expect(eventEmitter).toHaveBeenCalledWith(
        'event.billing.payment_confirmed',
        expect.objectContaining({ orderId, paymentId: payment.id }),
      );
    });

    it('TC0002 - Should throw error if budget not found', async () => {
      await expect(service.approvePayment(randomUUID(), 500)).rejects.toThrow('BUDGET_NOT_FOUND');
    });

    it('TC0003 - Should not emit event when budget is not found', async () => {
      await expect(service.approvePayment(randomUUID(), 500)).rejects.toThrow('BUDGET_NOT_FOUND');

      expect(eventEmitter).not.toHaveBeenCalled();
    });

    it('TC0004 - Should be idempotent for the same budget', async () => {
      const amount = 500;

      const budget = await service.generateBudget(orderId, amount);
      const payment1 = await service.approvePayment(budget.id, amount);
      eventEmitter.mockClear();

      const payment2 = await service.approvePayment(budget.id, amount);

      expect(payment2.id).toBe(payment1.id);
      expect(eventEmitter).not.toHaveBeenCalled();
    });
  });

  describe('refund', () => {
    it('TC0001 - Should process refund and emit refund_processed event', async () => {
      const budget = await service.generateBudget(orderId, 300);
      const payment = await service.approvePayment(budget.id, 300);
      eventEmitter.mockClear();

      await service.refund(payment.id, 'execution_failed');

      expect(eventEmitter).toHaveBeenCalledWith(
        'event.billing.refund_processed',
        expect.objectContaining({ paymentId: payment.id, reason: 'execution_failed' }),
      );
    });

    it('TC0002 - Should throw error if payment not found', async () => {
      await expect(service.refund(randomUUID(), 'reason')).rejects.toThrow('PAYMENT_NOT_FOUND');
    });

    it('TC0003 - Should not emit event when payment is not found', async () => {
      await expect(service.refund(randomUUID(), 'reason')).rejects.toThrow('PAYMENT_NOT_FOUND');

      expect(eventEmitter).not.toHaveBeenCalled();
    });

    it('TC0004 - Should be idempotent for the same payment id', async () => {
      const budget = await service.generateBudget(orderId, 300);
      const payment = await service.approvePayment(budget.id, 300);
      eventEmitter.mockClear();

      await service.refund(payment.id, 'execution_failed');
      const emitCount1 = eventEmitter.mock.calls.length;
      
      await service.refund(payment.id, 'execution_failed');
      const emitCount2 = eventEmitter.mock.calls.length;

      expect(emitCount2).toBe(emitCount1);
    });

    it('TC0005 - Should refund by orderId and resolve payment via budget', async () => {
      const oid = randomUUID();
      const budget = await service.generateBudget(oid, 100);
      await service.approvePayment(budget.id, 100);
      eventEmitter.mockClear();

      await service.refund(oid, 'no_parts');

      expect(eventEmitter).toHaveBeenCalledWith(
        'event.billing.refund_processed',
        expect.objectContaining({ orderId: oid }),
      );
    });

    it('TC0006 - Should throw PAYMENT_NOT_FOUND when orderId maps to budget but no payment', async () => {
      const oid = randomUUID();
      await service.generateBudget(oid, 100);
      // Budget exists via orderId but no payment was approved
      await expect(service.refund(oid, 'test')).rejects.toThrow('PAYMENT_NOT_FOUND');
    });
  });

  describe('getOrderBilling', () => {
    it('TC0001 - Should throw BUDGET_NOT_FOUND when no budget exists for order', async () => {
      await expect(service.getOrderBilling(randomUUID())).rejects.toThrow('BUDGET_NOT_FOUND');
    });

    it('TC0002 - Should return budget and undefined payment when payment does not exist yet', async () => {
      const oid = randomUUID();
      const budget = await service.generateBudget(oid, 250);

      const result = await service.getOrderBilling(oid);

      expect(result.budget.id).toBe(budget.id);
      expect(result.payment).toBeUndefined();
    });
  });
});
