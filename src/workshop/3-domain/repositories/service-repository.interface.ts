import { Service } from '@prisma/client';

export interface IServiceRepository {
  create(
    data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Service>;
  findAll(filters?: {
    category?: string;
    active?: boolean;
  }): Promise<Service[]>;
  findMany(
    skip: number,
    take: number,
    filters?: {
      category?: string;
      active?: boolean;
    },
  ): Promise<Service[]>;
  count(filters?: { category?: string; active?: boolean }): Promise<number>;
  findById(id: string): Promise<Service | null>;
  findByName(name: string): Promise<Service | null>;
  findByCategory(category: string): Promise<Service[]>;
  update(
    id: string,
    data: Partial<Omit<Service, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Service>;
  delete(id: string): Promise<void>;
}
