import { Injectable } from '@nestjs/common';
import { BUDGET_CONSTANTS } from '../../../shared/constants/budget.constants';
import {
  IBudgetRepository,
  CreateBudgetData,
  UpdateBudgetData,
  Budget,
  BudgetItem,
} from '../../3-domain/repositories/budget.repository.interface';
import { BudgetStatus } from '../../3-domain/entities/budget.entity';

interface DateProvider {
  now(): Date;
}

class DefaultDateProvider implements DateProvider {
  now(): Date {
    return new Date();
  }
}

@Injectable()
export class BudgetRepository implements IBudgetRepository {
  private budgets: Budget[] = [];
  private dateProvider: DateProvider = new DefaultDateProvider();
  private readonly ID_PREFIX = 'budget';
  private readonly RANDOM_ID_LENGTH = 9;

  private generateId(): string {
    const timestamp = Date.now();
    const randomString = Math.random()
      .toString(36)
      .substring(2, 2 + this.RANDOM_ID_LENGTH);
    return `${this.ID_PREFIX}_${timestamp}_${randomString}`;
  }

  private getCurrentTimestamp(): Date {
    return this.dateProvider.now();
  }

  private calculateTotals(items: BudgetItem[]) {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxes = subtotal * BUDGET_CONSTANTS.DEFAULT_VALUES.TAX_RATE;
    const discount = BUDGET_CONSTANTS.DEFAULT_VALUES.DISCOUNT;
    const total = subtotal + taxes - discount;

    return { subtotal, taxes, discount, total };
  }

  async create(data: CreateBudgetData): Promise<Budget> {
    const currentTime = this.getCurrentTimestamp();
    const { subtotal, taxes, discount, total } = this.calculateTotals(
      data.items,
    );

    const validUntil = new Date(currentTime);
    validUntil.setDate(
      validUntil.getDate() +
        (data.validDays || BUDGET_CONSTANTS.DEFAULT_VALUES.VALID_DAYS),
    );

    const budget: Budget = {
      id: this.generateId(),
      serviceOrderId: data.serviceOrderId,
      customerId: data.customerId,
      items: data.items,
      subtotal,
      taxes,
      discount,
      total,
      validUntil,
      status: BudgetStatus.DRAFT,
      createdAt: currentTime,
      updatedAt: currentTime,
    };

    this.budgets.push(budget);
    return budget;
  }

  async findAll(): Promise<Budget[]> {
    return [...this.budgets];
  }

  async findById(id: string): Promise<Budget | null> {
    return this.budgets.find((budget) => budget.id === id) || null;
  }

  async findByServiceOrderId(serviceOrderId: string): Promise<Budget[]> {
    return this.budgets.filter(
      (budget) => budget.serviceOrderId === serviceOrderId,
    );
  }

  async findByCustomerId(customerId: string): Promise<Budget[]> {
    return this.budgets.filter((budget) => budget.customerId === customerId);
  }

  async findByStatus(status: BudgetStatus): Promise<Budget[]> {
    return this.budgets.filter((budget) => budget.status === status);
  }

  async update(id: string, data: UpdateBudgetData): Promise<Budget> {
    const budgetIndex = this.budgets.findIndex((budget) => budget.id === id);
    if (budgetIndex === -1) {
      throw new Error(BUDGET_CONSTANTS.MESSAGES.NOT_FOUND);
    }

    const budget = this.budgets[budgetIndex];
    let updatedBudget = { ...budget };

    if (data.items) {
      const { subtotal, taxes, discount } = this.calculateTotals(data.items);
      updatedBudget = {
        ...updatedBudget,
        items: data.items,
        subtotal,
        taxes,
        discount: data.discount !== undefined ? data.discount : discount,
        total:
          subtotal +
          taxes -
          (data.discount !== undefined ? data.discount : discount),
      };
    }

    if (data.discount !== undefined) {
      updatedBudget = {
        ...updatedBudget,
        discount: data.discount,
        total: updatedBudget.subtotal + updatedBudget.taxes - data.discount,
      };
    }

    if (data.validUntil) {
      updatedBudget.validUntil = data.validUntil;
    }

    updatedBudget.updatedAt = this.getCurrentTimestamp();

    this.budgets[budgetIndex] = updatedBudget;
    return updatedBudget;
  }

  async updateStatus(id: string, status: BudgetStatus): Promise<Budget> {
    const budgetIndex = this.budgets.findIndex((budget) => budget.id === id);
    if (budgetIndex === -1) {
      throw new Error(BUDGET_CONSTANTS.MESSAGES.NOT_FOUND);
    }

    const budget = this.budgets[budgetIndex];
    const currentTime = this.getCurrentTimestamp();

    const updatedBudget = {
      ...budget,
      status,
      updatedAt: currentTime,
      ...(status === BudgetStatus.SENT && { sentAt: currentTime }),
      ...(status === BudgetStatus.APPROVED && { approvedAt: currentTime }),
      ...(status === BudgetStatus.REJECTED && { rejectedAt: currentTime }),
    };

    this.budgets[budgetIndex] = updatedBudget;
    return updatedBudget;
  }

  async delete(id: string): Promise<Budget> {
    const budgetIndex = this.budgets.findIndex((budget) => budget.id === id);
    if (budgetIndex === -1) {
      throw new Error(BUDGET_CONSTANTS.MESSAGES.NOT_FOUND);
    }

    const budget = this.budgets[budgetIndex];
    this.budgets.splice(budgetIndex, 1);
    return budget;
  }

  async findExpired(): Promise<Budget[]> {
    const now = this.getCurrentTimestamp();
    return this.budgets.filter(
      (budget) =>
        budget.validUntil < now && budget.status === BudgetStatus.SENT,
    );
  }

  async markAsExpired(id: string): Promise<Budget> {
    return this.updateStatus(id, BudgetStatus.EXPIRED);
  }
}
