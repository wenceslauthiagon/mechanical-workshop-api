import { randomUUID } from 'node:crypto';
import { Budget, Payment } from './domain';
import { BillingRepository } from './billing.repository';
import { InMemoryBillingRepository } from './infra/billing.repository';

export class BillingService {
  private readonly processedRefunds = new Set<string>();
  private readonly eventEmitter: (topic: string, payload: any) => void;
  private readonly repository: BillingRepository;

  constructor(eventEmitter: (topic: string, payload: any) => void, repository: BillingRepository = new InMemoryBillingRepository()) {
    this.eventEmitter = eventEmitter;
    this.repository = repository;
  }

  async generateBudget(orderId: string, estimatedTotal: number): Promise<Budget> {
    const budget: Budget = {
      id: randomUUID(),
      orderId,
      estimatedTotal,
      status: 'SENT',
    };
    return this.repository.createBudget(budget);
  }

  async approvePayment(budgetId: string, amount: number): Promise<Payment> {
    const budget = await this.repository.findBudgetById(budgetId);
    if (!budget) throw new Error('BUDGET_NOT_FOUND');

    // Idempotent: return existing payment if already confirmed
    const existingPayment = await this.repository.findPaymentByBudgetId(budgetId);
    if (existingPayment) {
      return existingPayment;
    }

    const payment: Payment = {
      id: randomUUID(),
      budgetId,
      amount,
      status: 'CONFIRMED',
    };

    await this.repository.createPayment(payment);
    this.eventEmitter('event.billing.payment_confirmed', { orderId: budget.orderId, paymentId: payment.id });

    return payment;
  }

  async refund(referenceId: string, reason: string): Promise<void> {
    const payment = await this.resolvePayment(referenceId);
    if (!payment) throw new Error('PAYMENT_NOT_FOUND');

    // Idempotent: skip if already processed
    if (this.processedRefunds.has(payment.id)) {
      return;
    }

    this.processedRefunds.add(payment.id);

    const budget = await this.repository.findBudgetById(payment.budgetId);
    await this.repository.updatePayment(payment.id, 'FAILED');
    this.eventEmitter('event.billing.refund_processed', {
      paymentId: payment.id,
      orderId: budget?.orderId,
      reason,
    });
  }

  async getOrderBilling(orderId: string): Promise<{ budget: Budget; payment?: Payment }> {
    const budget = await this.repository.findBudgetByOrderId(orderId);
    if (!budget) {
      throw new Error('BUDGET_NOT_FOUND');
    }

    const payment = await this.repository.findPaymentByBudgetId(budget.id);
    return { budget, payment };
  }

  private async resolvePayment(referenceId: string): Promise<Payment | undefined> {
    const payment = await this.repository.findPaymentById(referenceId);
    if (payment) {
      return payment;
    }

    const budget = await this.repository.findBudgetByOrderId(referenceId);
    if (!budget) {
      return undefined;
    }

    return this.repository.findPaymentByBudgetId(budget.id);
  }
}
