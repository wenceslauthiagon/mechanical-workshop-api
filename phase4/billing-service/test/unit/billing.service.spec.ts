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
    it('TC0001 - Should create budget successfully with status SENT', () => {
      
      const estimatedTotal = randomAmount(100, 5000);

      const budget = service.generateBudget(orderId, estimatedTotal);

      expect(budget.id).toBeDefined();
      expect(budget.orderId).toBe(orderId);
      expect(budget.estimatedTotal).toBe(estimatedTotal);
      expect(budget.status).toBe('SENT');
    });

    it('TC0002 - Should generate unique ids for different budgets', () => {
      const b1 = service.generateBudget(randomUUID(), 100);
      const b2 = service.generateBudget(randomUUID(), 200);

      expect(b1.id).not.toBe(b2.id);
    });
  });

  describe('approvePayment', () => {
    it('TC0001 - Should approve payment and emit payment_confirmed event', () => {
      const amount = randomAmount(100, 3000);

      const budget = service.generateBudget(orderId, amount);
      const payment = service.approvePayment(budget.id, amount);

      expect(payment.id).toBeDefined();
      expect(payment.budgetId).toBe(budget.id);
      expect(payment.amount).toBe(amount);
      expect(payment.status).toBe('CONFIRMED');
      expect(eventEmitter).toHaveBeenCalledWith(
        'event.billing.payment_confirmed',
        expect.objectContaining({ orderId, paymentId: payment.id }),
      );
    });

    it('TC0002 - Should throw error if budget not found', () => {
      expect(() => service.approvePayment(randomUUID(), 500)).toThrow('BUDGET_NOT_FOUND');
    });

    it('TC0003 - Should not emit event when budget is not found', () => {
      expect(() => service.approvePayment(randomUUID(), 500)).toThrow('BUDGET_NOT_FOUND');

      expect(eventEmitter).not.toHaveBeenCalled();
    });

    it('TC0004 - Should be idempotent for the same budget', () => {
      const amount = 500;

      const budget = service.generateBudget(orderId, amount);
      const payment1 = service.approvePayment(budget.id, amount);
      eventEmitter.mockClear();

      const payment2 = service.approvePayment(budget.id, amount);

      expect(payment2.id).toBe(payment1.id);
      expect(eventEmitter).not.toHaveBeenCalled();
    });
  });

  describe('refund', () => {
    it('TC0001 - Should process refund and emit refund_processed event', () => {
      const budget = service.generateBudget(orderId, 300);
      const payment = service.approvePayment(budget.id, 300);
      eventEmitter.mockClear();

      service.refund(payment.id, 'execution_failed');

      expect(eventEmitter).toHaveBeenCalledWith(
        'event.billing.refund_processed',
        expect.objectContaining({ paymentId: payment.id, reason: 'execution_failed' }),
      );
    });

    it('TC0002 - Should throw error if payment not found', () => {
      expect(() => service.refund(randomUUID(), 'reason')).toThrow('PAYMENT_NOT_FOUND');
    });

    it('TC0003 - Should not emit event when payment is not found', () => {
      expect(() => service.refund(randomUUID(), 'reason')).toThrow('PAYMENT_NOT_FOUND');

      expect(eventEmitter).not.toHaveBeenCalled();
    });

    it('TC0004 - Should be idempotent for the same payment id', () => {
      const budget = service.generateBudget(orderId, 300);
      const payment = service.approvePayment(budget.id, 300);
      eventEmitter.mockClear();

      service.refund(payment.id, 'execution_failed');
      const emitCount1 = eventEmitter.mock.calls.length;
      
      service.refund(payment.id, 'execution_failed');
      const emitCount2 = eventEmitter.mock.calls.length;

      expect(emitCount2).toBe(emitCount1);
    });
  });
});

