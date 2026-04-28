import { Budget, Payment } from '../domain';
import { BillingRepository } from '../billing.repository';

export class InMemoryBillingRepository implements BillingRepository {
  private readonly budgets = new Map<string, Budget>();
  private readonly payments = new Map<string, Payment>();

  async createBudget(budget: Budget): Promise<Budget> {
    this.budgets.set(budget.id, budget);
    return budget;
  }

  async findBudgetByOrderId(orderId: string): Promise<Budget | undefined> {
    return [...this.budgets.values()].find(item => item.orderId === orderId);
  }

  async findBudgetById(id: string): Promise<Budget | undefined> {
    return this.budgets.get(id);
  }

  async createPayment(payment: Payment): Promise<Payment> {
    this.payments.set(payment.id, payment);
    return payment;
  }

  async updatePayment(id: string, status: Payment['status']): Promise<void> {
    const payment = this.payments.get(id);
    if (!payment) {
      return;
    }
    this.payments.set(id, {
      ...payment,
      status,
    });
  }

  async findPaymentByBudgetId(budgetId: string): Promise<Payment | undefined> {
    return [...this.payments.values()].find(item => item.budgetId === budgetId);
  }

  async findPaymentById(id: string): Promise<Payment | undefined> {
    return this.payments.get(id);
  }
}