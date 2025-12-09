import { ServiceOrder } from '../entities/ServiceOrder';

export interface IServiceOrderRepository {
  create(payload: Omit<ServiceOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceOrder>;
  findById(id: string): Promise<ServiceOrder | null>;
  updateStatus(id: string, status: ServiceOrder['status']): Promise<ServiceOrder>;
  approveBudget(id: string, approved: boolean): Promise<ServiceOrder>;
  list(filter?: { excludeFinished?: boolean }): Promise<ServiceOrder[]>;
}
