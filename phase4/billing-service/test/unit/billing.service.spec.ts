import { faker } from '@faker-js/faker/locale/pt_BR';
import { BillingService } from '../../src/billing.service';

describe('BillingService', () => {
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
      const orderId = faker.string.uuid();
      const estimatedTotal = faker.number.float({ min: 100, max: 5000, fractionDigits: 2 });

      const budget = service.generateBudget(orderId, estimatedTotal);

      expect(budget.id).toBeDefined();
      expect(budget.orderId).toBe(orderId);
      expect(budget.estimatedTotal).toBe(estimatedTotal);
      expect(budget.status).toBe('SENT');
    });

    it('TC0002 - Should generate unique ids for different budgets', () => {
      const b1 = service.generateBudget(faker.string.uuid(), 100);
      const b2 = service.generateBudget(faker.string.uuid(), 200);

      expect(b1.id).not.toBe(b2.id);
    });
  });

  describe('approvePayment', () => {
    it('TC0001 - Should approve payment and emit payment_confirmed event', () => {
      const orderId = faker.string.uuid();
      const amount = faker.number.float({ min: 100, max: 3000, fractionDigits: 2 });

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
      expect(() => service.approvePayment(faker.string.uuid(), 500)).toThrow('BUDGET_NOT_FOUND');
    });

    it('TC0003 - Should not emit event when budget is not found', () => {
      expect(() => service.approvePayment(faker.string.uuid(), 500)).toThrow('BUDGET_NOT_FOUND');

      expect(eventEmitter).not.toHaveBeenCalled();
    });
  });

  describe('refund', () => {
    it('TC0001 - Should process refund and emit refund_processed event', () => {
      const orderId = faker.string.uuid();
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
      expect(() => service.refund(faker.string.uuid(), 'reason')).toThrow('PAYMENT_NOT_FOUND');
    });

    it('TC0003 - Should not emit event when payment is not found', () => {
      expect(() => service.refund(faker.string.uuid(), 'reason')).toThrow('PAYMENT_NOT_FOUND');

      expect(eventEmitter).not.toHaveBeenCalled();
    });
  });
});

