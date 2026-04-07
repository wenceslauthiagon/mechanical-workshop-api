import { OrderRepository } from '../../src/infra/order.repository';
import { OrderService } from '../../src/application/order.service';
import * as rabbitmq from '../../src/infra/rabbitmq';

describe('OrderService', () => {
  it('should open order and emit billing command', () => {
    const repo = new OrderRepository();
    const service = new OrderService(repo);

    const publishSpy = jest.spyOn(rabbitmq, 'publishEvent').mockResolvedValue();

    const order = service.open('c1', 'v1', 'troca de óleo');

    expect(order.status).toBe('OPENED');
    expect(publishSpy).toHaveBeenCalledWith(
      'command.billing.generate',
      expect.objectContaining({ orderId: order.id, customerId: 'c1', vehicleId: 'v1' }),
    );
  });
});
