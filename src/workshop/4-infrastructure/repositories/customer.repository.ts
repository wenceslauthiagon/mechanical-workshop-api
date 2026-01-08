import { Injectable } from '@nestjs/common';
import type { Customer } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { ICustomerRepository } from '../../3-domain/repositories/customer-repository.interface';

@Injectable()
export class CustomerRepository implements ICustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Customer> {
    return this.prisma.customer.create({
      data,
    });
  }

  async findAll(): Promise<Customer[]> {
    return this.prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMany(skip: number, take: number): Promise<Customer[]> {
    return this.prisma.customer.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(): Promise<number> {
    return this.prisma.customer.count();
  }

  async findById(id: string): Promise<Customer | null> {
    return this.prisma.customer.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return this.prisma.customer.findFirst({
      where: { email },
    });
  }

  async findByDocument(document: string): Promise<Customer | null> {
    return this.prisma.customer.findUnique({
      where: { document },
    });
  }

  async findVehiclesByCustomerId(customerId: string) {
    return this.prisma.vehicle.findMany({
      where: { customerId },
    });
  }

  async update(
    id: string,
    data: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Customer> {
    return this.prisma.customer.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.customer.delete({
      where: { id },
    });
  }
}
