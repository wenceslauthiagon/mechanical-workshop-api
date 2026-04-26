import { randomUUID } from 'node:crypto';
import { OrderRepository } from '../../src/infra/order.repository';
import { OrderService } from '../../src/application/order.service';
import * as rabbitmq from '../../src/infra/rabbitmq';

describe('Saga Orchestration - OrderService', () => {
  const randomText = () => `desc-${Math.random().toString(36).slice(2, 10)}`;
  let service: OrderService;

  beforeEach(() => {
    jest.spyOn(rabbitmq, 'publishEvent').mockResolvedValue(undefined);
    service = new OrderService(new OrderRepository());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Fluxo principal - OS aberta até conclusão', () => {
    it('TC0001 - Should complete full lifecycle: OPENED -> PAYMENT_CONFIRMED -> COMPLETED', async () => {
      const order = await service.open(randomUUID(), randomUUID(), 'revisão geral');
      expect(order.status).toBe('OPENED');

      await service.mark(order.id, 'PAYMENT_CONFIRMED');
      await service.mark(order.id, 'COMPLETED');

      const final = await service.get(order.id);
      expect(final.status).toBe('COMPLETED');
      expect(final.history.map(h => h.status)).toEqual([
        'OPENED',
        'PAYMENT_CONFIRMED',
        'COMPLETED',
      ]);
    });
  });

  describe('Compensação - falha no pagamento', () => {
    it('TC0001 - Should cancel order when payment fails', async () => {
      const order = await service.open(randomUUID(), randomUUID(), 'troca de óleo');

      await service.mark(order.id, 'CANCELLED', 'Pagamento recusado');

      const cancelled = await service.get(order.id);
      expect(cancelled.status).toBe('CANCELLED');
      expect(cancelled.history[1].reason).toBe('Pagamento recusado');
    });
  });

  describe('Compensação - falha na execução', () => {
    it('TC0001 - Should cancel order when execution fails after payment confirmed', async () => {
      const order = await service.open(randomUUID(), randomUUID(), randomText());
      await service.mark(order.id, 'PAYMENT_CONFIRMED');

      await service.mark(order.id, 'CANCELLED', 'Peças indisponíveis');

      const cancelled = await service.get(order.id);
      expect(cancelled.status).toBe('CANCELLED');
      expect(cancelled.history).toHaveLength(3);
      expect(cancelled.history[2].reason).toBe('Peças indisponíveis');
    });
  });
});
