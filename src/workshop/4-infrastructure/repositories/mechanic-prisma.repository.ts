import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  IMechanicRepository,
  CreateMechanicData,
  UpdateMechanicData,
  MechanicWithStats,
  Mechanic,
} from '../../3-domain/repositories/mechanic.repository.interface';

@Injectable()
export class MechanicPrismaRepository implements IMechanicRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMechanicData): Promise<Mechanic> {
    const createdMechanic = await this.prisma.mechanic.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        specialties: JSON.stringify(data.specialties),
        experienceYears: data.experienceYears || 0,
      },
    });

    return this.mapPrismaMechanic(createdMechanic);
  }

  async findAll(): Promise<MechanicWithStats[]> {
    const mechanics = await this.prisma.mechanic.findMany({
      include: {
        serviceOrders: {
          where: {
            status: {
              notIn: ['FINISHED', 'DELIVERED'],
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return mechanics.map((mechanic) => ({
      ...this.mapPrismaMechanic(mechanic),
      activeServiceOrders: mechanic.serviceOrders.length,
      completedServiceOrders: 0, // TODO: Count completed orders
    }));
  }

  async findById(id: string): Promise<MechanicWithStats | null> {
    const mechanic = await this.prisma.mechanic.findUnique({
      where: { id },
      include: {
        serviceOrders: true,
      },
    });

    if (!mechanic) return null;

    const activeServiceOrders = mechanic.serviceOrders.filter(
      (so) => !['FINISHED', 'DELIVERED'].includes(so.status),
    ).length;

    const completedServiceOrders = mechanic.serviceOrders.filter((so) =>
      ['FINISHED', 'DELIVERED'].includes(so.status),
    ).length;

    return {
      ...this.mapPrismaMechanic(mechanic),
      activeServiceOrders,
      completedServiceOrders,
    };
  }

  async findByEmail(email: string): Promise<Mechanic | null> {
    const mechanic = await this.prisma.mechanic.findUnique({
      where: { email },
    });

    return mechanic ? this.mapPrismaMechanic(mechanic) : null;
  }

  async findAvailable(): Promise<MechanicWithStats[]> {
    const mechanics = await this.prisma.mechanic.findMany({
      where: {
        isActive: true,
        isAvailable: true,
      },
      include: {
        serviceOrders: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return mechanics.map((mechanic) => {
      const activeServiceOrders = mechanic.serviceOrders.filter(
        (so) => !['FINISHED', 'DELIVERED'].includes(so.status),
      ).length;

      const completedServiceOrders = mechanic.serviceOrders.filter((so) =>
        ['FINISHED', 'DELIVERED'].includes(so.status),
      ).length;

      return {
        ...this.mapPrismaMechanic(mechanic),
        activeServiceOrders,
        completedServiceOrders,
      };
    });
  }

  async findBySpecialty(specialty: string): Promise<MechanicWithStats[]> {
    const mechanics = await this.prisma.mechanic.findMany({
      where: {
        isActive: true,
        specialties: {
          contains: specialty, // Search in JSON string
        },
      },
      include: {
        serviceOrders: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter by parsed specialties for exact match
    const filteredMechanics = mechanics.filter((mechanic) => {
      const specialties = JSON.parse(mechanic.specialties);
      return specialties.includes(specialty);
    });

    return filteredMechanics.map((mechanic) => {
      const activeServiceOrders = mechanic.serviceOrders.filter(
        (so) => !['FINISHED', 'DELIVERED'].includes(so.status),
      ).length;

      const completedServiceOrders = mechanic.serviceOrders.filter((so) =>
        ['FINISHED', 'DELIVERED'].includes(so.status),
      ).length;

      return {
        ...this.mapPrismaMechanic(mechanic),
        activeServiceOrders,
        completedServiceOrders,
      };
    });
  }

  async update(id: string, data: UpdateMechanicData): Promise<Mechanic> {
    const updateData: any = {
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.specialties && {
        specialties: JSON.stringify(data.specialties),
      }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
      ...(data.experienceYears !== undefined && {
        experienceYears: data.experienceYears,
      }),
    };

    const updatedMechanic = await this.prisma.mechanic.update({
      where: { id },
      data: updateData,
    });

    return this.mapPrismaMechanic(updatedMechanic);
  }

  async toggleAvailability(id: string): Promise<Mechanic> {
    const mechanic = await this.prisma.mechanic.findUnique({
      where: { id },
      select: { isAvailable: true },
    });

    if (!mechanic) {
      throw new Error('Mechanic not found');
    }

    const updatedMechanic = await this.prisma.mechanic.update({
      where: { id },
      data: { isAvailable: !mechanic.isAvailable },
    });

    return this.mapPrismaMechanic(updatedMechanic);
  }

  async delete(id: string): Promise<Mechanic> {
    const deletedMechanic = await this.prisma.mechanic.update({
      where: { id },
      data: { isActive: false },
    });

    return this.mapPrismaMechanic(deletedMechanic);
  }

  async getWorkload(mechanicId: string): Promise<{
    activeOrders: number;
    completedThisMonth: number;
    averageCompletionTime: number;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const mechanic = await this.prisma.mechanic.findUnique({
      where: { id: mechanicId },
      include: {
        serviceOrders: true,
      },
    });

    if (!mechanic) {
      throw new Error('Mechanic not found');
    }

    const activeOrders = mechanic.serviceOrders.filter(
      (so) => !['FINISHED', 'DELIVERED'].includes(so.status),
    ).length;

    const completedThisMonth = mechanic.serviceOrders.filter(
      (so) =>
        ['FINISHED', 'DELIVERED'].includes(so.status) &&
        so.completedAt &&
        so.completedAt >= startOfMonth,
    ).length;

    // Calculate average completion time (in hours)
    const completedOrders = mechanic.serviceOrders.filter(
      (so) => so.completedAt && so.startedAt,
    );

    let averageCompletionTime = 0;
    if (completedOrders.length > 0) {
      const totalHours = completedOrders.reduce((total, so) => {
        const startTime = so.startedAt!.getTime();
        const endTime = so.completedAt!.getTime();
        const hours = (endTime - startTime) / (1000 * 60 * 60);
        return total + hours;
      }, 0);
      averageCompletionTime = totalHours / completedOrders.length;
    }

    return {
      activeOrders,
      completedThisMonth,
      averageCompletionTime: Math.round(averageCompletionTime * 100) / 100, // Round to 2 decimal places
    };
  }

  async assignToServiceOrder(
    mechanicId: string,
    serviceOrderId?: string,
  ): Promise<void> {
    // Marcar mecânico como indisponível
    await this.prisma.mechanic.update({
      where: { id: mechanicId },
      data: { isAvailable: false },
    });

    // Se foi fornecido um serviceOrderId, associar o mecânico à OS
    if (serviceOrderId) {
      await this.prisma.serviceOrder.update({
        where: { id: serviceOrderId },
        data: { mechanicId },
      });
    }
  }

  private mapPrismaMechanic(prismaMechanic: any): Mechanic {
    return {
      id: prismaMechanic.id,
      name: prismaMechanic.name,
      email: prismaMechanic.email,
      phone: prismaMechanic.phone,
      specialties: JSON.parse(prismaMechanic.specialties),
      experienceYears: prismaMechanic.experienceYears,
      isActive: prismaMechanic.isActive,
      isAvailable: prismaMechanic.isAvailable,
      createdAt: prismaMechanic.createdAt,
      updatedAt: prismaMechanic.updatedAt,
    };
  }
}
