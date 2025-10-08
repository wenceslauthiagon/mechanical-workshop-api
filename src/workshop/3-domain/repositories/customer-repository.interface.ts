import { Customer } from '@prisma/client';

export interface ICustomerRepository {
  create(
    data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Customer>;
  findAll(): Promise<Customer[]>;
  findById(id: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  findByDocument(document: string): Promise<Customer | null>;
  update(
    id: string,
    data: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Customer>;
  delete(id: string): Promise<void>;
}
