import { OrderService } from '../../src/application/order.service';
import { OrderRepository } from '../../src/infra/order.repository';
import { resetSubscribers } from '../../src/infra/rabbitmq';

describe('Saga Pattern Integration - Full Order Flow', () => {
  let service: OrderService;
  let repo: OrderRepository;

  beforeAll(() => {
    repo = new OrderRepository();
    service = new OrderService(repo);
  });

  beforeEach(() => {
    resetSubscribers();
  });

  it('should complete full saga: OPENED -> PAYMENT_CONFIRMED -> COMPLETED', async () => {
    // 1. Open an order - triggers command.billing.generate
    const order = await service.open('CUST123', 'VEH456', 'Engine diagnostic');
    
    expect(order.status).toBe('OPENED');
    expect(order.id).toBeDefined();
    expect(order.history).toHaveLength(1);
    expect(order.history[0].status).toBe('OPENED');

    // 2. Simulate billing payment confirmation
    const confirmedOrder = await service.mark(order.id, 'PAYMENT_CONFIRMED');
    
    expect(confirmedOrder.status).toBe('PAYMENT_CONFIRMED');
    expect(confirmedOrder.history).toHaveLength(2);

    // 3. Simulate execution completion
    const completedOrder = await service.mark(order.id, 'COMPLETED');
    
    expect(completedOrder.status).toBe('COMPLETED');
    expect(completedOrder.history).toHaveLength(3);
  });

  it('should handle payment failure with compensation', async () => {
    const order = await service.open('CUST789', 'VEH789', 'Brake repair');
    expect(order.status).toBe('OPENED');

    // Simulate payment failure - should trigger compensation
    const cancelledOrder = await service.mark(order.id, 'CANCELLED', 'Payment declined');
    
    expect(cancelledOrder.status).toBe('CANCELLED');
    expect(cancelledOrder.history).toHaveLength(2);
    expect(cancelledOrder.history[1].reason).toBe('Payment declined');
  });

  it('should handle execution failure with refund compensation', async () => {
    // Open -> Payment Confirmed
    const order = await service.open('CUST999', 'VEH999', 'Full service');
    await service.mark(order.id, 'PAYMENT_CONFIRMED');

    // Simulate execution failure
    const failedOrder = await service.mark(order.id, 'CANCELLED', 'Execution failed: parts not available');
    
    expect(failedOrder.status).toBe('CANCELLED');
    expect(failedOrder.history).toHaveLength(3);
    expect(failedOrder.history[2].reason).toContain('Execution failed');
  });

  it('should maintain history for complete order lifecycle', async () => {
    const order = await service.open('CUST555', 'VEH555', 'Transmission repair');
    
    await service.mark(order.id, 'PAYMENT_CONFIRMED');
    await service.mark(order.id, 'IN_EXECUTION');
    await service.mark(order.id, 'COMPLETED');

    const finalOrder = await service.get(order.id);
    
    expect(finalOrder.history).toHaveLength(4);
    expect(finalOrder.history.map(h => h.status)).toEqual([
      'OPENED',
      'PAYMENT_CONFIRMED',
      'IN_EXECUTION',
      'COMPLETED',
    ]);
  });
});
