import { Service } from '@prisma/client';

export interface IServiceRepository {
  create(
    data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Service>;
  findAll(): Promise<Service[]>;
  findById(id: string): Promise<Service | null>;
  findByName(name: string): Promise<Service | null>;
  findByCategory(category: string): Promise<Service[]>;
  update(
    id: string,
    data: Partial<Omit<Service, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Service>;
  delete(id: string): Promise<void>;
}
