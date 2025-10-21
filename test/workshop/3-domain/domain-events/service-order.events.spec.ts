import { ServiceOrderStatus } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/pt_BR';
import {
  ServiceOrderCreatedEvent,
  ServiceOrderStatusChangedEvent,
  ServiceOrderCompletedEvent,
  ServiceOrderDeliveredEvent,
} from '../../../../src/workshop/3-domain/domain-events/service-order.events';

describe('ServiceOrderCreatedEvent', () => {
  it('TC0001 - Should create event with all required properties', () => {
    const serviceOrderId = faker.string.uuid();
    const orderNumber = 'OS-2024-001';
    const customerId = faker.string.uuid();
    const vehicleId = faker.string.uuid();
    const description = faker.lorem.sentence();

    const event = new ServiceOrderCreatedEvent(
      serviceOrderId,
      orderNumber,
      customerId,
      vehicleId,
      description,
    );

    expect(event.serviceOrderId).toBe(serviceOrderId);
    expect(event.orderNumber).toBe(orderNumber);
    expect(event.customerId).toBe(customerId);
    expect(event.vehicleId).toBe(vehicleId);
    expect(event.description).toBe(description);
    expect(event.eventId).toBeDefined();
    expect(event.occurredOn).toBeInstanceOf(Date);
    expect(event.eventVersion).toBe(1);
  });
});

describe('ServiceOrderStatusChangedEvent', () => {
  it('TC0001 - Should create event with all required properties and notes', () => {
    const serviceOrderId = faker.string.uuid();
    const orderNumber = 'OS-2024-001';
    const previousStatus = ServiceOrderStatus.RECEBIDA;
    const newStatus = ServiceOrderStatus.EM_EXECUCAO;
    const notes = faker.lorem.sentence();

    const event = new ServiceOrderStatusChangedEvent(
      serviceOrderId,
      orderNumber,
      previousStatus,
      newStatus,
      notes,
    );

    expect(event.serviceOrderId).toBe(serviceOrderId);
    expect(event.orderNumber).toBe(orderNumber);
    expect(event.previousStatus).toBe(previousStatus);
    expect(event.newStatus).toBe(newStatus);
    expect(event.notes).toBe(notes);
    expect(event.eventId).toBeDefined();
    expect(event.occurredOn).toBeInstanceOf(Date);
    expect(event.eventVersion).toBe(1);
  });

  it('TC0002 - Should create event without notes', () => {
    const serviceOrderId = faker.string.uuid();
    const orderNumber = 'OS-2024-001';
    const previousStatus = ServiceOrderStatus.RECEBIDA;
    const newStatus = ServiceOrderStatus.EM_EXECUCAO;

    const event = new ServiceOrderStatusChangedEvent(
      serviceOrderId,
      orderNumber,
      previousStatus,
      newStatus,
    );

    expect(event.serviceOrderId).toBe(serviceOrderId);
    expect(event.orderNumber).toBe(orderNumber);
    expect(event.previousStatus).toBe(previousStatus);
    expect(event.newStatus).toBe(newStatus);
    expect(event.notes).toBeUndefined();
  });
});

describe('ServiceOrderCompletedEvent', () => {
  it('TC0001 - Should create event with all required properties', () => {
    const serviceOrderId = faker.string.uuid();
    const orderNumber = 'OS-2024-001';
    const customerId = faker.string.uuid();
    const totalAmount = faker.number.float({
      min: 100,
      max: 10000,
      multipleOf: 0.01,
    });
    const completedAt = faker.date.recent();

    const event = new ServiceOrderCompletedEvent(
      serviceOrderId,
      orderNumber,
      customerId,
      totalAmount,
      completedAt,
    );

    expect(event.serviceOrderId).toBe(serviceOrderId);
    expect(event.orderNumber).toBe(orderNumber);
    expect(event.customerId).toBe(customerId);
    expect(event.totalAmount).toBe(totalAmount);
    expect(event.completedAt).toBe(completedAt);
    expect(event.eventId).toBeDefined();
    expect(event.occurredOn).toBeInstanceOf(Date);
    expect(event.eventVersion).toBe(1);
  });
});

describe('ServiceOrderDeliveredEvent', () => {
  it('TC0001 - Should create event with all required properties', () => {
    const serviceOrderId = faker.string.uuid();
    const orderNumber = 'OS-2024-001';
    const customerId = faker.string.uuid();
    const deliveredAt = faker.date.recent();

    const event = new ServiceOrderDeliveredEvent(
      serviceOrderId,
      orderNumber,
      customerId,
      deliveredAt,
    );

    expect(event.serviceOrderId).toBe(serviceOrderId);
    expect(event.orderNumber).toBe(orderNumber);
    expect(event.customerId).toBe(customerId);
    expect(event.deliveredAt).toBe(deliveredAt);
    expect(event.eventId).toBeDefined();
    expect(event.occurredOn).toBeInstanceOf(Date);
    expect(event.eventVersion).toBe(1);
  });
});
