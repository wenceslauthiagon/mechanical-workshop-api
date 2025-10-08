import { v4 as uuidv4 } from 'uuid';
import { OrderStatus } from '../../shared/enums';

export interface ServiceOrderItem {
  serviceTypeId: string;
  serviceTypeName: string;
  estimatedTimeHours: number;
  price: number;
}

export interface ServiceOrderPart {
  partId: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export class ServiceOrder {
  public readonly id: string;
  public readonly orderNumber: string;
  public readonly customerId: string;
  public readonly vehicleId: string;
  public status: OrderStatus;
  public description: string;
  public services: ServiceOrderItem[];
  public parts: ServiceOrderPart[];
  public totalServicePrice: number;
  public totalPartsPrice: number;
  public totalPrice: number;
  public estimatedTimeHours: number;
  public estimatedCompletionDate: Date;
  public startedAt: Date | null;
  public completedAt: Date | null;
  public deliveredAt: Date | null;
  public approvedAt: Date | null;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(
    customerId: string,
    vehicleId: string,
    description: string,
    services: ServiceOrderItem[] = [],
    parts: ServiceOrderPart[] = [],
    id?: string,
    orderNumber?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    this.id = id || uuidv4();
    this.orderNumber = orderNumber || this.generateOrderNumber();
    this.customerId = customerId;
    this.vehicleId = vehicleId;
    this.status = OrderStatus.RECEIVED;
    this.description = description;
    this.services = services;
    this.parts = parts;
    this.startedAt = null;
    this.completedAt = null;
    this.deliveredAt = null;
    this.approvedAt = null;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();

    this.calculateTotals();
    this.calculateEstimatedCompletion();
  }

  public addService(service: ServiceOrderItem): void {
    this.services.push(service);
    this.calculateTotals();
    this.calculateEstimatedCompletion();
    this.updatedAt = new Date();
  }

  public removeService(serviceTypeId: string): void {
    this.services = this.services.filter(
      (s) => s.serviceTypeId !== serviceTypeId,
    );
    this.calculateTotals();
    this.calculateEstimatedCompletion();
    this.updatedAt = new Date();
  }

  public addPart(part: ServiceOrderPart): void {
    const existingPart = this.parts.find((p) => p.partId === part.partId);
    if (existingPart) {
      existingPart.quantity += part.quantity;
      existingPart.totalPrice = existingPart.quantity * existingPart.unitPrice;
    } else {
      this.parts.push(part);
    }
    this.calculateTotals();
    this.updatedAt = new Date();
  }

  public removePart(partId: string): void {
    this.parts = this.parts.filter((p) => p.partId !== partId);
    this.calculateTotals();
    this.updatedAt = new Date();
  }

  public moveToStatus(newStatus: OrderStatus): void {
    const validTransitions = this.getValidStatusTransitions();

    if (!validTransitions.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from ${this.status} to ${newStatus}`,
      );
    }

    this.status = newStatus;

    switch (newStatus) {
      case OrderStatus.IN_EXECUTION:
        this.startedAt = new Date();
        break;
      case OrderStatus.FINISHED:
        this.completedAt = new Date();
        break;
      case OrderStatus.DELIVERED:
        this.deliveredAt = new Date();
        break;
      case OrderStatus.AWAITING_APPROVAL:
        // Reset approval if moving back to awaiting approval
        this.approvedAt = null;
        break;
    }

    this.updatedAt = new Date();
  }

  public approve(): void {
    if (this.status !== OrderStatus.AWAITING_APPROVAL) {
      throw new Error('Can only approve orders in AWAITING_APPROVAL status');
    }

    this.approvedAt = new Date();
    this.moveToStatus(OrderStatus.IN_EXECUTION);
  }

  private calculateTotals(): void {
    this.totalServicePrice = this.services.reduce(
      (sum, service) => sum + service.price,
      0,
    );
    this.totalPartsPrice = this.parts.reduce(
      (sum, part) => sum + part.totalPrice,
      0,
    );
    this.totalPrice = this.totalServicePrice + this.totalPartsPrice;
  }

  private calculateEstimatedCompletion(): void {
    this.estimatedTimeHours = this.services.reduce(
      (sum, service) => sum + service.estimatedTimeHours,
      0,
    );
    this.estimatedCompletionDate = new Date();
    this.estimatedCompletionDate.setHours(
      this.estimatedCompletionDate.getHours() + this.estimatedTimeHours,
    );
  }

  private getValidStatusTransitions(): OrderStatus[] {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.RECEIVED]: [OrderStatus.IN_DIAGNOSIS],
      [OrderStatus.IN_DIAGNOSIS]: [
        OrderStatus.AWAITING_APPROVAL,
        OrderStatus.IN_EXECUTION,
      ],
      [OrderStatus.AWAITING_APPROVAL]: [
        OrderStatus.IN_EXECUTION,
        OrderStatus.IN_DIAGNOSIS,
      ],
      [OrderStatus.IN_EXECUTION]: [OrderStatus.FINISHED],
      [OrderStatus.FINISHED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [], // Final status
    };

    return transitions[this.status] || [];
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `OS-${timestamp}-${random}`;
  }
}
