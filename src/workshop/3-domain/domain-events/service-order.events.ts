import { BaseDomainEvent } from './base-domain-event';
import { ServiceOrderStatus } from '@prisma/client';

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

  getEventName(): string {
    return 'ServiceOrderCreated';
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

  getEventName(): string {
    return 'ServiceOrderStatusChanged';
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

  getEventName(): string {
    return 'ServiceOrderCompleted';
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

  getEventName(): string {
    return 'ServiceOrderDelivered';
  }
}
