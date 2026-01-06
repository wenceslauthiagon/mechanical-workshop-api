import { Injectable } from '@nestjs/common';
import type { Vehicle } from '@prisma/client';
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
    });
  }

  async findAll(): Promise<Vehicle[]> {
    return this.prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMany(skip: number, take: number): Promise<Vehicle[]> {
    return this.prisma.vehicle.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(): Promise<number> {
    return this.prisma.vehicle.count();
  }

  async findById(id: string): Promise<Vehicle | null> {
    return this.prisma.vehicle.findUnique({
      where: { id },
    });
  }

  async findByPlate(plate: string): Promise<Vehicle | null> {
    return this.prisma.vehicle.findUnique({
      where: { licensePlate: plate },
    });
  }

  async findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    return this.prisma.vehicle.findUnique({
      where: { licensePlate },
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
    });
  }

  async update(
    id: string,
    data: Partial<Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Vehicle> {
    return this.prisma.vehicle.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.vehicle.delete({
      where: { id },
    });
  }
}
