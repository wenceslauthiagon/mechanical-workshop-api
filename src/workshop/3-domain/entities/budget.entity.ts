import { BUDGET_CONSTANTS } from '../../../shared/constants/budget.constants';

export class BudgetEntity {
  constructor(
    public readonly id: string,
    public readonly serviceOrderId: string,
    public readonly customerId: string,
    public readonly items: BudgetItem[],
    public readonly subtotal: number,
    public readonly taxes: number,
    public readonly discount: number,
    public readonly total: number,
    public readonly validUntil: Date,
    public readonly status: BudgetStatus,
    public readonly sentAt?: Date,
    public readonly approvedAt?: Date,
    public readonly rejectedAt?: Date,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  static create(data: {
    serviceOrderId: string;
    customerId: string;
    items: BudgetItem[];
    validDays?: number;
  }): BudgetEntity {
    const subtotal = data.items.reduce((sum, item) => sum + item.total, 0);
    const taxes = subtotal * BUDGET_CONSTANTS.DEFAULT_VALUES.TAX_RATE;
    const discount = BUDGET_CONSTANTS.DEFAULT_VALUES.DISCOUNT;
    const total = subtotal + taxes - discount;

    const validUntil = new Date();
    validUntil.setDate(
      validUntil.getDate() +
        (data.validDays || BUDGET_CONSTANTS.DEFAULT_VALUES.VALID_DAYS),
    );

    return new BudgetEntity(
      `budget_${Date.now()}`,
      data.serviceOrderId,
      data.customerId,
      data.items,
      subtotal,
      taxes,
      discount,
      total,
      validUntil,
      BudgetStatus.RASCUNHO,
      undefined,
      undefined,
      undefined,
    );
  }

  approve(): BudgetEntity {
    if (this.status !== BudgetStatus.ENVIADO) {
      throw new Error(BUDGET_CONSTANTS.MESSAGES.ONLY_SENT_CAN_BE_APPROVED);
    }

    if (this.isExpired()) {
      throw new Error(BUDGET_CONSTANTS.MESSAGES.EXPIRED_CANNOT_BE_APPROVED);
    }

    return new BudgetEntity(
      this.id,
      this.serviceOrderId,
      this.customerId,
      this.items,
      this.subtotal,
      this.taxes,
      this.discount,
      this.total,
      this.validUntil,
      BudgetStatus.APROVADO,
      this.sentAt,
      new Date(),
      undefined,
      this.createdAt,
      new Date(),
    );
  }

  reject(): BudgetEntity {
    if (this.status !== BudgetStatus.ENVIADO) {
      throw new Error(BUDGET_CONSTANTS.MESSAGES.ONLY_SENT_CAN_BE_REJECTED);
    }

    return new BudgetEntity(
      this.id,
      this.serviceOrderId,
      this.customerId,
      this.items,
      this.subtotal,
      this.taxes,
      this.discount,
      this.total,
      this.validUntil,
      BudgetStatus.REJEITADO,
      this.sentAt,
      undefined,
      new Date(),
      this.createdAt,
      new Date(),
    );
  }

  send(): BudgetEntity {
    if (this.status !== BudgetStatus.RASCUNHO) {
      throw new Error(BUDGET_CONSTANTS.MESSAGES.ONLY_DRAFT_CAN_BE_SENT);
    }

    return new BudgetEntity(
      this.id,
      this.serviceOrderId,
      this.customerId,
      this.items,
      this.subtotal,
      this.taxes,
      this.discount,
      this.total,
      this.validUntil,
      BudgetStatus.ENVIADO,
      new Date(),
      undefined,
      undefined,
      this.createdAt,
      new Date(),
    );
  }

  isExpired(): boolean {
    return new Date() > this.validUntil;
  }

  canBeModified(): boolean {
    return this.status === BudgetStatus.RASCUNHO;
  }
}

export interface BudgetItem {
  id: string;
  type: 'SERVICE' | 'PART';
  serviceId?: string;
  partId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export enum BudgetStatus {
  RASCUNHO = 'RASCUNHO',
  ENVIADO = 'ENVIADO',
  APROVADO = 'APROVADO',
  REJEITADO = 'REJEITADO',
  EXPIRADO = 'EXPIRADO',
}
