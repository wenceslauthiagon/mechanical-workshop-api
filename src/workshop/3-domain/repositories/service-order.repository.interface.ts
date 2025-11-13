import type { ServiceOrderStatus, ServiceOrder } from '@prisma/client';

export interface CreateServiceOrderData {
  orderNumber: string;
  customerId: string;
  vehicleId: string;
  description: string;
  status: ServiceOrderStatus;
  totalServicePrice: number;
  totalPartsPrice: number;
  totalPrice: number;
  estimatedTimeHours: number;
  estimatedCompletionDate: Date;
}

export interface IServiceOrderRepository {
  create(data: CreateServiceOrderData): Promise<ServiceOrder>;

  findAll(): Promise<ServiceOrder[]>;

  findMany(skip: number, take: number): Promise<ServiceOrder[]>;

  findManyWithPriority(skip: number, take: number): Promise<ServiceOrder[]>;

  countWithPriority(): Promise<number>;

  count(): Promise<number>;

  findById(id: string): Promise<ServiceOrder | null>;

  findByCustomerId(customerId: string): Promise<ServiceOrder[]>;

  updateStatus(
    id: string,
    data: {
      status: ServiceOrderStatus;
      startedAt?: Date;
      completedAt?: Date;
      deliveredAt?: Date;
      approvedAt?: Date;
    },
  ): Promise<ServiceOrder>;

  updateTotals(
    id: string,
    data: {
      totalServicePrice: number;
      totalPartsPrice: number;
      totalPrice: number;
      estimatedTimeHours: number;
      estimatedCompletionDate: Date;
    },
  ): Promise<ServiceOrder>;

  addServiceItem(data: {
    serviceOrderId: string;
    serviceId: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }): Promise<any>;

  addPartItem(data: {
    serviceOrderId: string;
    partId: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }): Promise<any>;

  addStatusHistory(data: {
    serviceOrderId: string;
    status: ServiceOrderStatus;
    notes?: string;
    changedBy?: string;
  }): Promise<any>;

  getStatusHistory(serviceOrderId: string): Promise<any[]>;

  countByYear(year: number): Promise<number>;

  findByOrderNumber(orderNumber: string): Promise<ServiceOrder | null>;

  findByVehicleId(vehicleId: string): Promise<ServiceOrder[]>;

  findCompletedOrders(): Promise<ServiceOrder[]>;

  delete(id: string): Promise<ServiceOrder>;
}
