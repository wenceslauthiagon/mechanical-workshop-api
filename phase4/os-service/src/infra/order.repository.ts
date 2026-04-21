import { ServiceOrder } from '../domain/order';

export class OrderRepository {
  private readonly db = new Map<string, ServiceOrder>();

  create(order: ServiceOrder): ServiceOrder {
    this.db.set(order.id, order);
    return order;
  }

  findById(id: string): ServiceOrder | undefined {
    return this.db.get(id);
  }

  save(order: ServiceOrder): void {
    this.db.set(order.id, order);
  }
}
