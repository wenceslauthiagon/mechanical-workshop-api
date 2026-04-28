/**
 * Prisma repository for Billing Service.
 * Requires: npx prisma generate (inside phase4/billing-service) before first use.
 *
 * Interfaces below mirror the billing-service Prisma schema to avoid depending
 * on the root-project generated client.
 */

import { Budget, Payment } from '../domain';

// ── Prisma-shape interfaces ──
interface PrismaBudget {
  id: string;
  orderId: string;
  estimatedTotal: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  payments?: PrismaPayment[];
}

interface PrismaPayment {
  id: string;
  budgetId: string;
  amount: number;
  status: string;
  mercadopagoId: string | null;
  createdAt: Date;
}

interface BillingPrismaClient {
  budget: {
    create(args: { data: Omit<PrismaBudget, 'createdAt' | 'updatedAt' | 'payments'> }): Promise<PrismaBudget>;
    findFirst(args: { where: { orderId: string } }): Promise<PrismaBudget | null>;
    findUnique(args: { where: { id: string } }): Promise<PrismaBudget | null>;
    update(args: { where: { id: string }; data: Partial<PrismaBudget> }): Promise<PrismaBudget>;
  };
  payment: {
    create(args: { data: Omit<PrismaPayment, 'createdAt'> }): Promise<PrismaPayment>;
    findUnique(args: { where: { id: string } }): Promise<PrismaPayment | null>;
    findFirst(args: { where: { budgetId: string } }): Promise<PrismaPayment | null>;
    update(args: { where: { id: string }; data: Partial<PrismaPayment> }): Promise<PrismaPayment>;
  };
}

export class BillingPrismaRepository {
  constructor(private readonly db: BillingPrismaClient) {}

  async createBudget(budget: Budget): Promise<Budget> {
    const created = await this.db.budget.create({
      data: {
        id: budget.id,
        orderId: budget.orderId,
        estimatedTotal: budget.estimatedTotal,
        status: budget.status,
      },
    });
    return this.budgetToDomain(created);
  }

  async findBudgetByOrderId(orderId: string): Promise<Budget | undefined> {
    const raw = await this.db.budget.findFirst({ where: { orderId } });
    return raw ? this.budgetToDomain(raw) : undefined;
  }

  async findBudgetById(id: string): Promise<Budget | undefined> {
    const raw = await this.db.budget.findUnique({ where: { id } });
    return raw ? this.budgetToDomain(raw) : undefined;
  }

  async createPayment(payment: Payment): Promise<Payment> {
    const created = await this.db.payment.create({
      data: {
        id: payment.id,
        budgetId: payment.budgetId,
        amount: payment.amount,
        status: payment.status,
        mercadopagoId: payment.mercadopagoId ?? null,
      },
    });
    return this.paymentToDomain(created);
  }

  async updatePayment(id: string, status: Payment['status']): Promise<void> {
    await this.db.payment.update({ where: { id }, data: { status } });
  }

  async findPaymentByBudgetId(budgetId: string): Promise<Payment | undefined> {
    const raw = await this.db.payment.findFirst({ where: { budgetId } });
    return raw ? this.paymentToDomain(raw) : undefined;
  }

  async findPaymentById(id: string): Promise<Payment | undefined> {
    const raw = await this.db.payment.findUnique({ where: { id } });
    return raw ? this.paymentToDomain(raw) : undefined;
  }

  private budgetToDomain(raw: PrismaBudget): Budget {
    return {
      id: raw.id,
      orderId: raw.orderId,
      estimatedTotal: raw.estimatedTotal,
      status: raw.status as Budget['status'],
    };
  }

  private paymentToDomain(raw: PrismaPayment): Payment {
    return {
      id: raw.id,
      budgetId: raw.budgetId,
      amount: raw.amount,
      status: raw.status as Payment['status'],
      mercadopagoId: raw.mercadopagoId ?? undefined,
    };
  }
}
