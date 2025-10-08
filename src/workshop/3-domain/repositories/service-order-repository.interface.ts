import { ServiceOrder, ServiceOrderStatus } from '@prisma/client';

export interface IServiceOrderRepository {
  create(
    data: Omit<ServiceOrder, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ServiceOrder>;
  findAll(): Promise<ServiceOrder[]>;
  findById(id: string): Promise<ServiceOrder | null>;
  findByCustomerId(customerId: string): Promise<ServiceOrder[]>;
  findByStatus(status: ServiceOrderStatus): Promise<ServiceOrder[]>;
  updateStatus(id: string, status: ServiceOrderStatus): Promise<ServiceOrder>;
  update(
    id: string,
    data: Partial<Omit<ServiceOrder, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<ServiceOrder>;
  delete(id: string): Promise<void>;
}
