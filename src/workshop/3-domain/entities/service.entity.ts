import { Decimal } from '@prisma/client/runtime/library';

export interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number | Decimal;
  estimatedMinutes: number;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ServiceBase = Service;

export class ServiceEntity implements Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  estimatedMinutes: number;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Service) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.price = data.price;
    this.estimatedMinutes = data.estimatedMinutes;
    this.category = data.category;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
