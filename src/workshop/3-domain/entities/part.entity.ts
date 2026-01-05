import { Decimal } from '@prisma/client/runtime/library';

export interface Part {
  id: string;
  name: string;
  partNumber: string | null;
  description?: string | null;
  price: number | Decimal;
  stock: number;
  minStock: number;
  supplier?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PartBase = Part;

export class PartEntity implements Part {
  id: string;
  name: string;
  partNumber: string | null;
  description?: string;
  price: number;
  stock: number;
  minStock: number;
  supplier?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Part) {
    this.id = data.id;
    this.name = data.name;
    this.partNumber = data.partNumber;
    this.description = data.description ?? undefined;
    this.price = typeof data.price === 'number' ? data.price : data.price.toNumber();
    this.stock = data.stock;
    this.minStock = data.minStock;
    this.supplier = data.supplier ?? undefined;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
