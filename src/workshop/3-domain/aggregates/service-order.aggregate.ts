import { ServiceOrderStatus } from '@prisma/client';
import { Money } from '../value-objects';

export interface ServiceOrderItem {
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: Money;
  totalPrice: Money;
}

export interface PartOrderItem {
  partId: string;
  partName: string;
  quantity: number;
  unitPrice: Money;
  totalPrice: Money;
}

export interface StatusHistoryEntry {
  status: ServiceOrderStatus;
  changedAt: Date;
  notes?: string;
}

export class ServiceOrderAggregate {
  private constructor(
    public readonly id: string,
    public readonly orderNumber: string,
    public readonly customerId: string,
    public readonly vehicleId: string,
    private _status: ServiceOrderStatus,
    private _services: ServiceOrderItem[],
    private _parts: PartOrderItem[],
    private _statusHistory: StatusHistoryEntry[],
    public readonly description: string,
    public readonly reportedIssue: string,
    public readonly diagnosticNotes?: string,
    public readonly estimatedTimeHours?: number,
    public readonly estimatedCompletionDate?: Date,
    public readonly createdAt?: Date,
    public readonly startedAt?: Date,
    public readonly completedAt?: Date,
    public readonly deliveredAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  static create(
    id: string,
    orderNumber: string,
    customerId: string,
    vehicleId: string,
    description: string,
    reportedIssue: string,
  ): ServiceOrderAggregate {
    const statusHistory: StatusHistoryEntry[] = [
      {
        status: ServiceOrderStatus.RECEBIDA,
        changedAt: new Date(),
        notes: 'Ordem de serviço recebida',
      },
    ];

    return new ServiceOrderAggregate(
      id,
      orderNumber,
      customerId,
      vehicleId,
      ServiceOrderStatus.RECEBIDA,
      [],
      [],
      statusHistory,
      description,
      reportedIssue,
      undefined,
      undefined,
      undefined,
      new Date(),
    );
  }

  static fromDatabase(data: any): ServiceOrderAggregate {
    const services: ServiceOrderItem[] =
      data.services?.map((s: any) => ({
        serviceId: s.serviceId,
        serviceName: s.service?.name || '',
        quantity: s.quantity,
        unitPrice: new Money(Number(s.price)),
        totalPrice: new Money(Number(s.totalPrice)),
      })) || [];

    const parts: PartOrderItem[] =
      data.parts?.map((p: any) => ({
        partId: p.partId,
        partName: p.part?.name || '',
        quantity: p.quantity,
        unitPrice: new Money(Number(p.price)),
        totalPrice: new Money(Number(p.totalPrice)),
      })) || [];

    const statusHistory: StatusHistoryEntry[] =
      data.statusHistory?.map((h: any) => ({
        status: h.status,
        changedAt: h.createdAt,
        notes: h.notes,
      })) || [];

    return new ServiceOrderAggregate(
      data.id,
      data.orderNumber,
      data.customerId,
      data.vehicleId,
      data.status,
      services,
      parts,
      statusHistory,
      data.description,
      data.reportedIssue,
      data.diagnosticNotes,
      data.estimatedTimeHours,
      data.estimatedCompletionDate,
      data.createdAt,
      data.startedAt,
      data.completedAt,
      data.deliveredAt,
      data.updatedAt,
    );
  }

  get status(): ServiceOrderStatus {
    return this._status;
  }

  get services(): readonly ServiceOrderItem[] {
    return [...this._services];
  }

  get parts(): readonly PartOrderItem[] {
    return [...this._parts];
  }

  get statusHistory(): readonly StatusHistoryEntry[] {
    return [...this._statusHistory];
  }

  get totalServicePrice(): Money {
    return this._services.reduce(
      (total, service) => total.add(service.totalPrice),
      new Money(0),
    );
  }

  get totalPartsPrice(): Money {
    return this._parts.reduce(
      (total, part) => total.add(part.totalPrice),
      new Money(0),
    );
  }

  get totalPrice(): Money {
    return this.totalServicePrice.add(this.totalPartsPrice);
  }

  addService(serviceItem: ServiceOrderItem): void {
    this.ensureCanBeModified();
    const existingIndex = this._services.findIndex(
      (s) => s.serviceId === serviceItem.serviceId,
    );

    if (existingIndex >= 0) {
      this._services[existingIndex] = serviceItem;
    } else {
      this._services.push(serviceItem);
    }
  }

  removeService(serviceId: string): void {
    this.ensureCanBeModified();
    this._services = this._services.filter((s) => s.serviceId !== serviceId);
  }

  addPart(partItem: PartOrderItem): void {
    this.ensureCanBeModified();
    const existingIndex = this._parts.findIndex(
      (p) => p.partId === partItem.partId,
    );

    if (existingIndex >= 0) {
      this._parts[existingIndex] = partItem;
    } else {
      this._parts.push(partItem);
    }
  }

  removePart(partId: string): void {
    this.ensureCanBeModified();
    this._parts = this._parts.filter((p) => p.partId !== partId);
  }

  changeStatus(newStatus: ServiceOrderStatus, notes?: string): void {
    this.validateStatusTransition(newStatus);

    const previousStatus = this._status;
    this._status = newStatus;

    this._statusHistory.push({
      status: newStatus,
      changedAt: new Date(),
      notes: notes || `Status alterado de ${previousStatus} para ${newStatus}`,
    });
  }

  startExecution(): void {
    if (this._status !== ServiceOrderStatus.AGUARDANDO_APROVACAO) {
      throw new Error('Só é possível iniciar execução de ordens aprovadas');
    }
    this.changeStatus(ServiceOrderStatus.EM_EXECUCAO, 'Execução iniciada');
  }

  finish(): void {
    if (this._status !== ServiceOrderStatus.EM_EXECUCAO) {
      throw new Error('Só é possível finalizar ordens em execução');
    }
    this.changeStatus(ServiceOrderStatus.FINALIZADA, 'Serviço finalizado');
  }

  deliver(): void {
    if (this._status !== ServiceOrderStatus.FINALIZADA) {
      throw new Error('Só é possível entregar ordens finalizadas');
    }
    this.changeStatus(
      ServiceOrderStatus.ENTREGUE,
      'Veículo entregue ao cliente',
    );
  }

  private ensureCanBeModified(): void {
    if (this._status === ServiceOrderStatus.ENTREGUE) {
      throw new Error(
        'Não é possível modificar ordens de serviço já entregues',
      );
    }
  }

  private validateStatusTransition(newStatus: ServiceOrderStatus): void {
    const validTransitions: Record<ServiceOrderStatus, ServiceOrderStatus[]> = {
      [ServiceOrderStatus.RECEBIDA]: [ServiceOrderStatus.EM_DIAGNOSTICO],
      [ServiceOrderStatus.EM_DIAGNOSTICO]: [
        ServiceOrderStatus.AGUARDANDO_APROVACAO,
      ],
      [ServiceOrderStatus.AGUARDANDO_APROVACAO]: [
        ServiceOrderStatus.EM_EXECUCAO,
        ServiceOrderStatus.EM_DIAGNOSTICO,
      ],
      [ServiceOrderStatus.EM_EXECUCAO]: [ServiceOrderStatus.FINALIZADA],
      [ServiceOrderStatus.FINALIZADA]: [ServiceOrderStatus.ENTREGUE],
      [ServiceOrderStatus.ENTREGUE]: [],
    };

    const allowedTransitions = validTransitions[this._status] || [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(
        `Transição de status inválida: ${this._status} → ${newStatus}`,
      );
    }
  }
}
