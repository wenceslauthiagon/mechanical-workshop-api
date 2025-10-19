import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  IBudgetRepository,
  CreateBudgetData,
  UpdateBudgetData,
  Budget,
  BudgetItem,
} from '../../3-domain/repositories/budget.repository.interface';
import { BudgetStatus } from '../../3-domain/entities/budget.entity';
import { BUDGET_CONSTANTS } from '../../../shared/constants/budget.constants';

@Injectable()
export class BudgetRepository implements IBudgetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateBudgetData): Promise<Budget> {
    const validDays =
      data.validDays || BUDGET_CONSTANTS.DEFAULT_VALUES.VALID_DAYS;
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validDays);

    const subtotal = data.items.reduce((sum, item) => sum + item.total, 0);
    const taxes = subtotal * BUDGET_CONSTANTS.DEFAULT_VALUES.TAX_RATE;
    const total = subtotal + taxes;

    const budget = await this.prisma.budget.create({
      data: {
        serviceOrderId: data.serviceOrderId,
        customerId: data.customerId,
        subtotal,
        taxes,
        discount: 0,
        total,
        validUntil,
        status: BudgetStatus.RASCUNHO,
        items: {
          create: data.items.map((item) => ({
            type: item.type,
            serviceId: item.serviceId,
            partId: item.partId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return this.mapToEntity(budget);
  }

  async findById(id: string): Promise<Budget | null> {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    return budget ? this.mapToEntity(budget) : null;
  }

  async findByCustomerId(customerId: string): Promise<Budget[]> {
    const budgets = await this.prisma.budget.findMany({
      where: { customerId },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return budgets.map((budget) => this.mapToEntity(budget));
  }

  async findByServiceOrderId(serviceOrderId: string): Promise<Budget[]> {
    const budgets = await this.prisma.budget.findMany({
      where: { serviceOrderId },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return budgets.map((budget) => this.mapToEntity(budget));
  }

  async findByStatus(status: BudgetStatus): Promise<Budget[]> {
    const budgets = await this.prisma.budget.findMany({
      where: { status },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return budgets.map((budget) => this.mapToEntity(budget));
  }

  async update(id: string, data: UpdateBudgetData): Promise<Budget> {
    const updateData: any = {};

    if (data.items) {
      const subtotal = data.items.reduce((sum, item) => sum + item.total, 0);
      const taxes = subtotal * BUDGET_CONSTANTS.DEFAULT_VALUES.TAX_RATE;
      const discount = data.discount || 0;
      const total = subtotal + taxes - discount;

      updateData.subtotal = subtotal;
      updateData.taxes = taxes;
      updateData.discount = discount;
      updateData.total = total;
    }

    if (data.validUntil) {
      updateData.validUntil = data.validUntil;
    }

    if (data.discount !== undefined) {
      updateData.discount = data.discount;
      // Recalculate total if only discount is updated
      if (!data.items) {
        const existingBudget = await this.prisma.budget.findUnique({
          where: { id },
        });
        if (existingBudget) {
          updateData.total =
            existingBudget.subtotal.toNumber() +
            existingBudget.taxes.toNumber() -
            data.discount;
        }
      }
    }

    const budget = await this.prisma.budget.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
      },
    });

    // Update items if provided
    if (data.items) {
      await this.prisma.budgetItem.deleteMany({
        where: { budgetId: id },
      });

      await this.prisma.budgetItem.createMany({
        data: data.items.map((item) => ({
          budgetId: id,
          type: item.type,
          serviceId: item.serviceId,
          partId: item.partId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
      });

      // Fetch updated budget with items
      const updatedBudget = await this.prisma.budget.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });

      return this.mapToEntity(updatedBudget);
    }

    return this.mapToEntity(budget);
  }

  async updateStatus(id: string, status: BudgetStatus): Promise<Budget> {
    const updateData: any = { status };

    if (status === BudgetStatus.ENVIADO) {
      updateData.sentAt = new Date();
    } else if (status === BudgetStatus.APROVADO) {
      updateData.approvedAt = new Date();
    } else if (status === BudgetStatus.REJEITADO) {
      updateData.rejectedAt = new Date();
    }

    const budget = await this.prisma.budget.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
      },
    });

    return this.mapToEntity(budget);
  }

  async delete(id: string): Promise<Budget> {
    const budget = await this.prisma.budget.delete({
      where: { id },
      include: {
        items: true,
      },
    });

    return this.mapToEntity(budget);
  }

  async findAll(): Promise<Budget[]> {
    const budgets = await this.prisma.budget.findMany({
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return budgets.map((budget) => this.mapToEntity(budget));
  }

  async findExpired(): Promise<Budget[]> {
    const now = new Date();
    const budgets = await this.prisma.budget.findMany({
      where: {
        validUntil: {
          lt: now,
        },
        status: {
          not: BudgetStatus.EXPIRADO,
        },
      },
      include: {
        items: true,
      },
    });

    return budgets.map((budget) => this.mapToEntity(budget));
  }

  async markAsExpired(id: string): Promise<Budget> {
    const budget = await this.prisma.budget.update({
      where: { id },
      data: { status: BudgetStatus.EXPIRADO },
      include: {
        items: true,
      },
    });

    return this.mapToEntity(budget);
  }

  private mapToEntity(budget: any): Budget {
    return {
      id: budget.id,
      serviceOrderId: budget.serviceOrderId,
      customerId: budget.customerId,
      items: budget.items.map(
        (item: any): BudgetItem => ({
          id: item.id,
          type: item.type,
          serviceId: item.serviceId,
          partId: item.partId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        }),
      ),
      subtotal: budget.subtotal,
      taxes: budget.taxes,
      discount: budget.discount,
      total: budget.total,
      validUntil: budget.validUntil,
      status: budget.status as BudgetStatus,
      sentAt: budget.sentAt,
      approvedAt: budget.approvedAt,
      rejectedAt: budget.rejectedAt,
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt,
    };
  }
}
