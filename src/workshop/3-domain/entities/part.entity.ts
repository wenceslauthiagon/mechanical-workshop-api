import { Decimal } from '@prisma/client/runtime/library';

export interface PartBase {
  id: string;
  name: string;
  description: string | null;
  partNumber: string | null;
  price: Decimal;
  stock: number;
  minStock: number;
  supplier: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
