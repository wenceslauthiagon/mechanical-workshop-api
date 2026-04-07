import { randomUUID } from 'crypto';
import { Budget, Payment } from './domain';

export class BillingService {
  private readonly budgets = new Map<string, Budget>();
  private readonly payments = new Map<string, Payment>();
  private eventEmitter: (topic: string, payload: any) => void;

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

    const payment: Payment = {
      id: randomUUID(),
      budgetId,
      amount,
      status: 'CONFIRMED',
    };

    this.payments.set(payment.id, payment);
    this.eventEmitter('event.billing.payment_confirmed', { orderId: budget.orderId, paymentId: payment.id });

    return payment;
  }

  refund(paymentId: string, reason: string): void {
    const payment = this.payments.get(paymentId);
    if (!payment) throw new Error('PAYMENT_NOT_FOUND');
    payment.status = 'FAILED';
    this.eventEmitter('event.billing.refund_processed', { paymentId, reason });
  }
}
