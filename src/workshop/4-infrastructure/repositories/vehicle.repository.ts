import { Injectable } from '@nestjs/common';
import { Vehicle } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { IVehicleRepository } from '../../3-domain/repositories/vehicle-repository.interface';

@Injectable()
export class VehicleRepository implements IVehicleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Vehicle> {
    return this.prisma.vehicle.create({
      data,
      include: {
        customer: true,
      },
    });
  }

  async findAll(): Promise<Vehicle[]> {
    return this.prisma.vehicle.findMany({
      include: {
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Vehicle | null> {
    return this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });
  }

  async findByPlate(plate: string): Promise<Vehicle | null> {
    return this.prisma.vehicle.findUnique({
      where: { licensePlate: plate },
      include: {
        customer: true,
      },
    });
  }

  async findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    return this.prisma.vehicle.findUnique({
      where: { licensePlate },
      include: {
        customer: true,
      },
    });
  }

  async hasServiceOrders(vehicleId: string): Promise<boolean> {
    const count = await this.prisma.serviceOrder.count({
      where: { vehicleId },
    });
    return count > 0;
  }

  async findByCustomerId(customerId: string): Promise<Vehicle[]> {
    return this.prisma.vehicle.findMany({
      where: { customerId },
      include: {
        customer: true,
      },
    });
  }

  async update(
    id: string,
    data: Partial<Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Vehicle> {
    return this.prisma.vehicle.update({
      where: { id },
      data,
      include: {
        customer: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.vehicle.delete({
      where: { id },
    });
  }
}
