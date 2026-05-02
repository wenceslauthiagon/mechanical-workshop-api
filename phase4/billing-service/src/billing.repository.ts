import { Budget, Payment } from './domain';

export interface BillingRepository {
  createBudget(budget: Budget): Promise<Budget>;
  findBudgetByOrderId(orderId: string): Promise<Budget | undefined>;
  findBudgetById(id: string): Promise<Budget | undefined>;
  updateBudget(id: string, status: Budget['status']): Promise<void>;
  createPayment(payment: Payment): Promise<Payment>;
  updatePayment(id: string, status: Payment['status']): Promise<void>;
  findPaymentByBudgetId(budgetId: string): Promise<Payment | undefined>;
  findPaymentById(id: string): Promise<Payment | undefined>;
}