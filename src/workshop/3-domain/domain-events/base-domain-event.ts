export interface DomainEvent {
  eventId: string;
  occurredOn: Date;
  eventVersion: number;
}

export abstract class BaseDomainEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly occurredOn: Date;
  public readonly eventVersion: number = 1;

  constructor() {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
  }
}
