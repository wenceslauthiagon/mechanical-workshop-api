import { ServiceOrder } from '../domain/order';
import { OrderRepositoryPort } from '../application/order-repository.port';

export class OrderRepository implements OrderRepositoryPort {
  private readonly db = new Map<string, ServiceOrder>();

  async create(order: ServiceOrder): Promise<ServiceOrder> {
    this.db.set(order.id, order);
    return order;
  }

  async findById(id: string): Promise<ServiceOrder | undefined> {
    return this.db.get(id);
  }

  async save(order: ServiceOrder): Promise<void> {
    this.db.set(order.id, order);
  }
}
