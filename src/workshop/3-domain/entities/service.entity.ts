import { Decimal } from '@prisma/client/runtime/library';

export interface ServiceBase {
  id: string;
  name: string;
  description: string | null;
  price: Decimal;
  estimatedMinutes: number;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
