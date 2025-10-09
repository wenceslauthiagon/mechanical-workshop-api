import { ServiceOrderStatus } from '@prisma/client';
import { BaseDomainEvent } from './base-domain-event';

export class ServiceOrderCreatedEvent extends BaseDomainEvent {
  constructor(
    public readonly serviceOrderId: string,
    public readonly orderNumber: string,
    public readonly customerId: string,
    public readonly vehicleId: string,
    public readonly description: string,
  ) {
    super();
  }
}

export class ServiceOrderStatusChangedEvent extends BaseDomainEvent {
  constructor(
    public readonly serviceOrderId: string,
    public readonly orderNumber: string,
    public readonly previousStatus: ServiceOrderStatus,
    public readonly newStatus: ServiceOrderStatus,
    public readonly notes?: string,
  ) {
    super();
  }
}

export class ServiceOrderCompletedEvent extends BaseDomainEvent {
  constructor(
    public readonly serviceOrderId: string,
    public readonly orderNumber: string,
    public readonly customerId: string,
    public readonly totalAmount: number,
    public readonly completedAt: Date,
  ) {
    super();
  }
}

export class ServiceOrderDeliveredEvent extends BaseDomainEvent {
  constructor(
    public readonly serviceOrderId: string,
    public readonly orderNumber: string,
    public readonly customerId: string,
    public readonly deliveredAt: Date,
  ) {
    super();
  }
}
