import { Customer, Vehicle } from '@prisma/client';

export interface ICustomerRepository {
  create(
    data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Customer>;
  findAll(): Promise<Customer[]>;
  findMany(skip: number, take: number): Promise<Customer[]>;
  count(): Promise<number>;
  findById(id: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  findByDocument(document: string): Promise<Customer | null>;
  findVehiclesByCustomerId(customerId: string): Promise<Vehicle[]>;
  update(
    id: string,
    data: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Customer>;
  delete(id: string): Promise<void>;
}
