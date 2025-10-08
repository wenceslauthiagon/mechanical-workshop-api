import { Part } from '@prisma/client';

export interface IPartRepository {
  create(data: Omit<Part, 'id' | 'createdAt' | 'updatedAt'>): Promise<Part>;
  findAll(filters?: {
    supplier?: string;
    active?: boolean;
    lowStock?: boolean;
  }): Promise<Part[]>;
  findById(id: string): Promise<Part | null>;
  findByPartNumber(partNumber: string): Promise<Part | null>;
  findBySupplier(supplier: string): Promise<Part[]>;
  findLowStock(): Promise<Part[]>;
  updateStock(id: string, quantity: number): Promise<Part>;
  update(
    id: string,
    data: Partial<Omit<Part, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Part>;
  delete(id: string): Promise<void>;
}
