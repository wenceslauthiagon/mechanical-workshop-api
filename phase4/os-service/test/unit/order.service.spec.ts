import { faker } from '@faker-js/faker/locale/pt_BR';
import { OrderRepository } from '../../src/infra/order.repository';
import { OrderService } from '../../src/application/order.service';
import * as rabbitmq from '../../src/infra/rabbitmq';

describe('OrderService', () => {
  let repo: OrderRepository;
  let service: OrderService;
  let publishSpy: jest.SpyInstance;

  beforeEach(() => {
    repo = new OrderRepository();
    service = new OrderService(repo);
    publishSpy = jest.spyOn(rabbitmq, 'publishEvent').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('TC0001 - Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('open', () => {
    it('TC0001 - Should open order with status OPENED and emit billing command', () => {
      const customerId = faker.string.uuid();
      const vehicleId = faker.string.uuid();
      const description = faker.lorem.sentence();

      const order = service.open(customerId, vehicleId, description);

      expect(order.id).toBeDefined();
      expect(order.customerId).toBe(customerId);
      expect(order.vehicleId).toBe(vehicleId);
      expect(order.description).toBe(description);
      expect(order.status).toBe('OPENED');
      expect(order.history).toHaveLength(1);
      expect(order.history[0].status).toBe('OPENED');
      expect(publishSpy).toHaveBeenCalledWith(
        'command.billing.generate',
        expect.objectContaining({ orderId: order.id, customerId, vehicleId }),
      );
    });

    it('TC0002 - Should generate unique id for each order', () => {
      const o1 = service.open(faker.string.uuid(), faker.string.uuid(), faker.lorem.sentence());
      const o2 = service.open(faker.string.uuid(), faker.string.uuid(), faker.lorem.sentence());

      expect(o1.id).not.toBe(o2.id);
    });
  });

  describe('mark', () => {
    it('TC0001 - Should update status and append to history', () => {
      const order = service.open(faker.string.uuid(), faker.string.uuid(), faker.lorem.sentence());

      const updated = service.mark(order.id, 'PAYMENT_CONFIRMED');

      expect(updated.status).toBe('PAYMENT_CONFIRMED');
      expect(updated.history).toHaveLength(2);
      expect(updated.history[1].status).toBe('PAYMENT_CONFIRMED');
    });

    it('TC0002 - Should store reason in history when provided', () => {
      const order = service.open(faker.string.uuid(), faker.string.uuid(), faker.lorem.sentence());
      const reason = faker.lorem.sentence();

      const updated = service.mark(order.id, 'CANCELLED', reason);

      expect(updated.history[1].reason).toBe(reason);
    });

    it('TC0003 - Should throw error if order not found', () => {
      expect(() => service.mark(faker.string.uuid(), 'COMPLETED')).toThrow('ORDER_NOT_FOUND');
    });
  });

  describe('get', () => {
    it('TC0001 - Should return order by id', () => {
      const order = service.open(faker.string.uuid(), faker.string.uuid(), faker.lorem.sentence());

      const found = service.get(order.id);

      expect(found).toEqual(order);
    });

    it('TC0002 - Should throw error if order not found', () => {
      expect(() => service.get(faker.string.uuid())).toThrow('ORDER_NOT_FOUND');
    });
  });
});
