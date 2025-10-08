import { Injectable } from '@nestjs/common';
import { Customer } from '@prisma/client';
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
      include: {
        vehicles: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Customer | null> {
    return this.prisma.customer.findUnique({
      where: { id },
      include: {
        vehicles: true,
      },
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
      include: {
        vehicles: true,
      },
    });
  }

  async findVehiclesByCustomerId(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        vehicles: true,
      },
    });
    return customer?.vehicles || [];
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
