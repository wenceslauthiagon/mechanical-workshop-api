import {
  BaseDomainEvent,
  DomainEvent,
} from '../../../../src/workshop/3-domain/domain-events/base-domain-event';

class TestDomainEvent extends BaseDomainEvent {
  constructor(public readonly testData: string) {
    super();
  }
}

describe('BaseDomainEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('TC0001 - Should create event with generated eventId', () => {
    const event = new TestDomainEvent('test');

    expect(event.eventId).toBeDefined();
    expect(typeof event.eventId).toBe('string');
    expect(event.eventId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('TC0002 - Should create event with occurredOn date', () => {
    const beforeCreation = new Date();
    const event = new TestDomainEvent('test');
    const afterCreation = new Date();

    expect(event.occurredOn).toBeInstanceOf(Date);
    expect(event.occurredOn.getTime()).toBeGreaterThanOrEqual(
      beforeCreation.getTime(),
    );
    expect(event.occurredOn.getTime()).toBeLessThanOrEqual(
      afterCreation.getTime(),
    );
  });

  it('TC0003 - Should create event with eventVersion set to 1', () => {
    const event = new TestDomainEvent('test');

    expect(event.eventVersion).toBe(1);
  });

  it('TC0004 - Should implement DomainEvent interface', () => {
    const event = new TestDomainEvent('test');

    const domainEvent: DomainEvent = event;

    expect(domainEvent.eventId).toBeDefined();
    expect(domainEvent.occurredOn).toBeDefined();
    expect(domainEvent.eventVersion).toBeDefined();
  });
});
