import { Customer } from '../entities/customer.entity';
import { CustomerType } from '../../shared/enums';

export interface CustomerRepository {
  save(customer: Customer): Promise<Customer>;
  findById(id: string): Promise<Customer | null>;
  findByDocument(document: string): Promise<Customer | null>;
  findAll(
    page?: number,
    limit?: number,
  ): Promise<{ customers: Customer[]; total: number }>;
  findByType(type: CustomerType): Promise<Customer[]>;
  update(customer: Customer): Promise<Customer>;
  delete(id: string): Promise<void>;
}
