import { randomUUID } from 'node:crypto';
import { Budget, Payment } from './domain';

export class BillingService {
  private readonly budgets = new Map<string, Budget>();
  private readonly payments = new Map<string, Payment>();
  private readonly processedRefunds = new Set<string>();
  private readonly eventEmitter: (topic: string, payload: any) => void;

  constructor(eventEmitter: (topic: string, payload: any) => void) {
    this.eventEmitter = eventEmitter;
  }

  generateBudget(orderId: string, estimatedTotal: number): Budget {
    const budget: Budget = {
      id: randomUUID(),
      orderId,
      estimatedTotal,
      status: 'SENT',
    };
    this.budgets.set(budget.id, budget);
    return budget;
  }

  approvePayment(budgetId: string, amount: number): Payment {
    const budget = this.budgets.get(budgetId);
    if (!budget) throw new Error('BUDGET_NOT_FOUND');

    // Idempotent: return existing payment if already confirmed
    const existingPayment = [...this.payments.values()].find(item => item.budgetId === budgetId && item.status === 'CONFIRMED');
    if (existingPayment) {
      return existingPayment;
    }

    const payment: Payment = {
      id: randomUUID(),
      budgetId,
      amount,
      status: 'CONFIRMED',
    };

    this.payments.set(payment.id, payment);
    budget.status = 'APPROVED';
    this.eventEmitter('event.billing.payment_confirmed', { orderId: budget.orderId, paymentId: payment.id });

    return payment;
  }

  refund(referenceId: string, reason: string): void {
    const payment = this.resolvePayment(referenceId);
    if (!payment) throw new Error('PAYMENT_NOT_FOUND');

    // Idempotent: skip if already processed
    if (this.processedRefunds.has(payment.id)) {
      return;
    }

    this.processedRefunds.add(payment.id);

    const budget = this.budgets.get(payment.budgetId);
    payment.status = 'FAILED';
    this.eventEmitter('event.billing.refund_processed', {
      paymentId: payment.id,
      orderId: budget?.orderId,
      reason,
    });
  }

  getOrderBilling(orderId: string): { budget: Budget; payment?: Payment } {
    const budget = [...this.budgets.values()].find(item => item.orderId === orderId);
    if (!budget) {
      throw new Error('BUDGET_NOT_FOUND');
    }

    const payment = [...this.payments.values()].find(item => item.budgetId === budget.id);
    return { budget, payment };
  }

  private resolvePayment(referenceId: string): Payment | undefined {
    const payment = this.payments.get(referenceId);
    if (payment) {
      return payment;
    }

    const budget = [...this.budgets.values()].find(item => item.orderId === referenceId);
    if (!budget) {
      return undefined;
    }

    return [...this.payments.values()].find(item => item.budgetId === budget.id);
  }
}
