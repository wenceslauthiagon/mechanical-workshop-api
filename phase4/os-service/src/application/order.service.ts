import { v4 as uuid } from 'uuid';
import { OrderRepository } from '../infra/order.repository';
import { OrderStatus, ServiceOrder } from '../domain/order';
import { publishEvent } from '../infra/rabbitmq';

export class OrderService {
  constructor(private readonly repo: OrderRepository) {}

  open(customerId: string, vehicleId: string, description: string): ServiceOrder {
    const id = uuid();
    const order: ServiceOrder = {
      id,
      customerId,
      vehicleId,
      description,
      status: 'OPENED',
      history: [{ status: 'OPENED', at: new Date().toISOString() }],
    };

    this.repo.create(order);
    
    // Emitir comando para billing gerar orçamento
    publishEvent('command.billing.generate', { orderId: id, customerId, vehicleId }).catch(console.error);

    return order;
  }

  mark(orderId: string, status: OrderStatus, reason?: string): ServiceOrder {
    const order = this.repo.findById(orderId);
    if (!order) throw new Error('ORDER_NOT_FOUND');

    order.status = status;
    order.history.push({ status, at: new Date().toISOString(), reason });
    this.repo.save(order);
    
    // Emitir evento de mudança de status
    publishEvent(`event.order.${status.toLowerCase()}`, { orderId, status, reason }).catch(console.error);
    
    return order;
  }

  get(orderId: string): ServiceOrder {
    const order = this.repo.findById(orderId);
    if (!order) throw new Error('ORDER_NOT_FOUND');
    return order;
  }
}
