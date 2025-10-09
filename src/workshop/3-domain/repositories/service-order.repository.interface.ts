import {
  ServiceOrderStatus,
  ServiceOrder,
  Customer,
  Vehicle,
  Service,
  Part,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface ServiceOrderWithRelations extends ServiceOrder {
  customer: Customer;
  vehicle: Vehicle;
  services: Array<{
    id: string;
    serviceId: string;
    quantity: number;
    price: Decimal;
    totalPrice: Decimal;
    service: Service;
  }>;
  parts: Array<{
    id: string;
    partId: string;
    quantity: number;
    price: Decimal;
    totalPrice: Decimal;
    part: Part;
  }>;
}

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
  create(data: CreateServiceOrderData): Promise<ServiceOrderWithRelations>;

  findAll(): Promise<ServiceOrderWithRelations[]>;

  findById(id: string): Promise<ServiceOrderWithRelations | null>;

  findByCustomerId(customerId: string): Promise<ServiceOrderWithRelations[]>;

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
  }): Promise<{
    id: string;
    serviceOrderId: string;
    serviceId: string;
    quantity: number;
    price: Decimal;
    totalPrice: Decimal;
    createdAt: Date;
  }>;

  addPartItem(data: {
    serviceOrderId: string;
    partId: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }): Promise<{
    id: string;
    serviceOrderId: string;
    partId: string;
    quantity: number;
    price: Decimal;
    totalPrice: Decimal;
    createdAt: Date;
  }>;

  addStatusHistory(data: {
    serviceOrderId: string;
    status: ServiceOrderStatus;
    notes?: string;
    changedBy?: string;
  }): Promise<{
    id: string;
    serviceOrderId: string;
    status: ServiceOrderStatus;
    notes: string | null;
    changedBy: string | null;
    createdAt: Date;
  }>;

  getStatusHistory(serviceOrderId: string): Promise<
    Array<{
      id: string;
      serviceOrderId: string;
      status: ServiceOrderStatus;
      notes: string | null;
      changedBy: string | null;
      createdAt: Date;
    }>
  >;

  countByYear(year: number): Promise<number>;

  findByOrderNumber(
    orderNumber: string,
  ): Promise<ServiceOrderWithRelations | null>;

  findByVehicleId(vehicleId: string): Promise<ServiceOrderWithRelations[]>;

  findCompletedOrders(): Promise<ServiceOrderWithRelations[]>;

  delete(id: string): Promise<ServiceOrder>;
}
