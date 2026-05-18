import { ServiceOrder } from '../domain/order';

export interface OrderRepositoryPort {
  create(order: ServiceOrder): Promise<ServiceOrder>;
  findById(id: string): Promise<ServiceOrder | undefined>;
  save(order: ServiceOrder): Promise<void>;
}