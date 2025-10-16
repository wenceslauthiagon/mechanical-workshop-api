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
    const taxes = subtotal * 0.1; // 10% de impostos
    const discount = 0;
    const total = subtotal + taxes - discount;

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + (data.validDays || 15)); // 15 dias padrão

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
      BudgetStatus.DRAFT,
      undefined,
      undefined,
      undefined,
    );
  }

  approve(): BudgetEntity {
    if (this.status !== BudgetStatus.SENT) {
      throw new Error('Apenas orçamentos enviados podem ser aprovados');
    }

    if (this.isExpired()) {
      throw new Error('Orçamento expirado não pode ser aprovado');
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
      BudgetStatus.APPROVED,
      this.sentAt,
      new Date(),
      undefined,
      this.createdAt,
      new Date(),
    );
  }

  reject(): BudgetEntity {
    if (this.status !== BudgetStatus.SENT) {
      throw new Error('Apenas orçamentos enviados podem ser rejeitados');
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
      BudgetStatus.REJECTED,
      this.sentAt,
      undefined,
      new Date(),
      this.createdAt,
      new Date(),
    );
  }

  send(): BudgetEntity {
    if (this.status !== BudgetStatus.DRAFT) {
      throw new Error('Apenas orçamentos em rascunho podem ser enviados');
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
      BudgetStatus.SENT,
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
    return this.status === BudgetStatus.DRAFT;
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
  DRAFT = 'RASCUNHO',
  SENT = 'ENVIADO',
  APPROVED = 'APROVADO',
  REJECTED = 'REJEITADO',
  EXPIRED = 'EXPIRADO',
}
