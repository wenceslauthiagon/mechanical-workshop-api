import { ServiceOrder } from '../entities/service-order.entity';
import { OrderStatus } from '../../shared/enums';

export interface ServiceOrderRepository {
  save(serviceOrder: ServiceOrder): Promise<ServiceOrder>;
  findById(id: string): Promise<ServiceOrder | null>;
  findByOrderNumber(orderNumber: string): Promise<ServiceOrder | null>;
  findByCustomerId(customerId: string): Promise<ServiceOrder[]>;
  findByVehicleId(vehicleId: string): Promise<ServiceOrder[]>;
  findByStatus(status: OrderStatus): Promise<ServiceOrder[]>;
  findAll(
    page?: number,
    limit?: number,
  ): Promise<{ orders: ServiceOrder[]; total: number }>;
  update(serviceOrder: ServiceOrder): Promise<ServiceOrder>;
  delete(id: string): Promise<void>;
  findOrdersForCustomerTracking(customerId: string): Promise<ServiceOrder[]>;
}
