import { EventBus } from '../../src/infra/event-bus';
import { OrderRepository } from '../../src/infra/order.repository';
import { OrderService } from '../../src/application/order.service';

describe('OrderService', () => {
  it('should open order and emit billing command', () => {
    const bus = new EventBus();
    const repo = new OrderRepository();
    const service = new OrderService(repo, bus);

    let emitted = false;
    bus.on('command.billing.generate', () => {
      emitted = true;
    });

    const order = service.open('c1', 'v1', 'troca de óleo');

    expect(order.status).toBe('OPENED');
    expect(emitted).toBe(true);
  });
});
