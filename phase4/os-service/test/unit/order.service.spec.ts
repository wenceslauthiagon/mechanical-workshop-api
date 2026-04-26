import { randomUUID } from 'node:crypto';
import { OrderRepository } from '../../src/infra/order.repository';
import { OrderService } from '../../src/application/order.service';
import * as rabbitmq from '../../src/infra/rabbitmq';

describe('OrderService', () => {
  const randomText = () => `desc-${Math.random().toString(36).slice(2, 10)}`;
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
    it('TC0001 - Should open order with status OPENED and emit billing command', async () => {
      const customerId = randomUUID();
      const vehicleId = randomUUID();
      const description = randomText();

      const order = await service.open(customerId, vehicleId, description);

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

    it('TC0002 - Should generate unique id for each order', async () => {
      const o1 = await service.open(randomUUID(), randomUUID(), randomText());
      const o2 = await service.open(randomUUID(), randomUUID(), randomText());

      expect(o1.id).not.toBe(o2.id);
    });
  });

  describe('mark', () => {
    it('TC0001 - Should update status and append to history', async () => {
      const order = await service.open(randomUUID(), randomUUID(), randomText());

      const updated = await service.mark(order.id, 'PAYMENT_CONFIRMED');

      expect(updated.status).toBe('PAYMENT_CONFIRMED');
      expect(updated.history).toHaveLength(2);
      expect(updated.history[1].status).toBe('PAYMENT_CONFIRMED');
    });

    it('TC0002 - Should store reason in history when provided', async () => {
      const order = await service.open(randomUUID(), randomUUID(), randomText());
      const reason = randomText();

      const updated = await service.mark(order.id, 'CANCELLED', reason);

      expect(updated.history[1].reason).toBe(reason);
    });

    it('TC0003 - Should throw error if order not found', async () => {
      await expect(service.mark(randomUUID(), 'COMPLETED')).rejects.toThrow('ORDER_NOT_FOUND');
    });

    it('TC0004 - Should be idempotent when receiving the same status', async () => {
      const order = await service.open(randomUUID(), randomUUID(), randomText());

      const same = await service.mark(order.id, 'OPENED');

      expect(same.status).toBe('OPENED');
      expect(same.history).toHaveLength(1);
    });

    it('TC0005 - Should reject invalid terminal transition', async () => {
      const order = await service.open(randomUUID(), randomUUID(), randomText());
      await service.mark(order.id, 'PAYMENT_CONFIRMED');
      await service.mark(order.id, 'COMPLETED');

      await expect(service.mark(order.id, 'PAYMENT_CONFIRMED')).rejects.toThrow('ORDER_INVALID_STATUS_TRANSITION');
    });
  });

  describe('get', () => {
    it('TC0001 - Should return order by id', async () => {
      const order = await service.open(randomUUID(), randomUUID(), randomText());

      const found = await service.get(order.id);

      expect(found).toEqual(order);
    });

    it('TC0002 - Should throw error if order not found', async () => {
      await expect(service.get(randomUUID())).rejects.toThrow('ORDER_NOT_FOUND');
    });
  });
});
