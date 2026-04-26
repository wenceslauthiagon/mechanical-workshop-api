import { randomUUID } from 'node:crypto';
import { OrderStatus, ServiceOrder } from '../domain/order';
import { publishEvent } from '../infra/rabbitmq';
import { OrderRepositoryPort } from './order-repository.port';

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  OPENED: ['BUDGET_PENDING', 'BUDGET_APPROVED', 'PAYMENT_CONFIRMED', 'CANCELLED'],
  BUDGET_PENDING: ['BUDGET_APPROVED', 'CANCELLED'],
  BUDGET_APPROVED: ['PAYMENT_CONFIRMED', 'CANCELLED'],
  PAYMENT_CONFIRMED: ['IN_EXECUTION', 'COMPLETED', 'CANCELLED'],
  IN_EXECUTION: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export class OrderService {
  constructor(private readonly repo: OrderRepositoryPort) {}

  async open(customerId: string, vehicleId: string, description: string): Promise<ServiceOrder> {
    const id = randomUUID();
    const order: ServiceOrder = {
      id,
      customerId,
      vehicleId,
      description,
      status: 'OPENED',
      history: [{ status: 'OPENED', at: new Date().toISOString() }],
    };

    await this.repo.create(order);

    // Emitir comando para billing gerar orçamento
    publishEvent('command.billing.generate', { orderId: id, customerId, vehicleId }).catch(() => undefined);

    return order;
  }

  async mark(orderId: string, status: OrderStatus, reason?: string): Promise<ServiceOrder> {
    const order = await this.repo.findById(orderId);
    if (!order) throw new Error('ORDER_NOT_FOUND');

    if (order.status === status) {
      return order;
    }

    if (!ALLOWED_TRANSITIONS[order.status].includes(status)) {
      throw new Error('ORDER_INVALID_STATUS_TRANSITION');
    }

    order.status = status;
    order.history.push({ status, at: new Date().toISOString(), reason });
    await this.repo.save(order);

    // Emitir evento de mudança de status
    publishEvent(`event.order.${status.toLowerCase()}`, { orderId, status, reason }).catch(() => undefined);

    return order;
  }

  async get(orderId: string): Promise<ServiceOrder> {
    const order = await this.repo.findById(orderId);
    if (!order) throw new Error('ORDER_NOT_FOUND');
    return order;
  }
}
