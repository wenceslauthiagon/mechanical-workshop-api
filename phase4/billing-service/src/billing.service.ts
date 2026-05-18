import { randomUUID } from 'node:crypto';
import { Budget, Payment } from './domain';
import { BillingRepository } from './billing.repository';
import { InMemoryBillingRepository } from './infra/billing.repository';
import { BillingEventPayload } from './infra/events';

export class BillingService {
  private readonly processedRefunds = new Set<string>();
  private readonly eventEmitter: (topic: string, payload: BillingEventPayload) => void;
  private readonly repository: BillingRepository;

  constructor(eventEmitter: (topic: string, payload: BillingEventPayload) => void, repository: BillingRepository = new InMemoryBillingRepository()) {
    this.eventEmitter = eventEmitter;
    this.repository = repository;
  }

  async generateBudget(orderId: string, estimatedTotal: number): Promise<Budget> {
    const existingBudget = await this.repository.findBudgetByOrderId(orderId);
    if (existingBudget) {
      this.eventEmitter('event.billing.budget_generated', {
        orderId,
        budgetId: existingBudget.id,
        estimatedTotal: existingBudget.estimatedTotal,
        status: existingBudget.status,
      });
      return existingBudget;
    }

    const budget: Budget = {
      id: randomUUID(),
      orderId,
      estimatedTotal,
      status: 'SENT',
    };
    const createdBudget = await this.repository.createBudget(budget);
    this.eventEmitter('event.billing.budget_generated', {
      orderId,
      budgetId: createdBudget.id,
      estimatedTotal: createdBudget.estimatedTotal,
      status: createdBudget.status,
    });
    return createdBudget;
  }

  async approvePayment(budgetId: string, amount: number, mercadopagoId?: string): Promise<Payment> {
    const budget = await this.repository.findBudgetById(budgetId);
    if (!budget) throw new Error('BUDGET_NOT_FOUND');

    if (budget.status !== 'APPROVED') {
      await this.repository.updateBudget(budget.id, 'APPROVED');
    }

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
      mercadopagoId,
    };

    await this.repository.createPayment(payment);
    this.eventEmitter('event.billing.payment_confirmed', {
      orderId: budget.orderId,
      budgetId,
      paymentId: payment.id,
      amount,
      mercadopagoId,
    });

    return payment;
  }

  async approveOrderPayment(orderId: string, mercadopagoId?: string): Promise<{ budget: Budget; payment: Payment }> {
    const budget = await this.repository.findBudgetByOrderId(orderId);
    if (!budget) {
      throw new Error('BUDGET_NOT_FOUND');
    }

    const payment = await this.approvePayment(budget.id, budget.estimatedTotal, mercadopagoId);
    return {
      budget: {
        ...budget,
        status: 'APPROVED',
      },
      payment,
    };
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
