import { OrderStatus } from '../../shared/enums';

export interface ServiceOrderItemDto {
  serviceTypeId: string;
  serviceTypeName: string;
  estimatedTimeHours: number;
  price: number;
}

export interface ServiceOrderPartDto {
  partId: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export class CreateServiceOrderDto {
  customerId: string;
  vehicleId: string;
  description: string;
  services: ServiceOrderItemDto[];
  parts: ServiceOrderPartDto[];
}

export class UpdateServiceOrderStatusDto {
  status: OrderStatus;
}

export class ServiceOrderResponseDto {
  id: string;
  orderNumber: string;
  customerId: string;
  vehicleId: string;
  status: OrderStatus;
  description: string;
  services: ServiceOrderItemDto[];
  parts: ServiceOrderPartDto[];
  totalServicePrice: number;
  totalPartsPrice: number;
  totalPrice: number;
  estimatedTimeHours: number;
  estimatedCompletionDate: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  deliveredAt: Date | null;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
