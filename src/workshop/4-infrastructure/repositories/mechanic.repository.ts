import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ServiceOrderStatus } from '@prisma/client';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';
import { MECHANIC_CONSTANTS } from '../../../shared/constants/mechanic.constants';
import {
  IMechanicRepository,
  CreateMechanicData,
  UpdateMechanicData,
  MechanicWithStats,
  Mechanic,
} from '../../3-domain/repositories/mechanic.repository.interface';

@Injectable()
export class MechanicRepository implements IMechanicRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

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
      orderBy: { createdAt: 'desc' },
    });

    const mechanicsWithStats = await Promise.all(
      mechanics.map(async (mechanic) => {
        const serviceOrders = await this.prisma.serviceOrder.findMany({
          where: { mechanicId: mechanic.id },
        });

        const activeServiceOrders = serviceOrders.filter(
          (so) =>
            so.status !== ServiceOrderStatus.FINALIZADA &&
            so.status !== ServiceOrderStatus.ENTREGUE,
        ).length;

        const completedServiceOrders = serviceOrders.filter(
          (so) =>
            so.status === ServiceOrderStatus.FINALIZADA ||
            so.status === ServiceOrderStatus.ENTREGUE,
        ).length;

        return {
          ...this.mapPrismaMechanic(mechanic),
          activeServiceOrders,
          completedServiceOrders,
        };
      }),
    );

    return mechanicsWithStats;
  }

  async findMany(skip: number, take: number): Promise<MechanicWithStats[]> {
    const mechanics = await this.prisma.mechanic.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    const mechanicsWithStats = await Promise.all(
      mechanics.map(async (mechanic) => {
        const serviceOrders = await this.prisma.serviceOrder.findMany({
          where: { mechanicId: mechanic.id },
        });

        const activeServiceOrders = serviceOrders.filter(
          (so) =>
            so.status !== ServiceOrderStatus.FINALIZADA &&
            so.status !== ServiceOrderStatus.ENTREGUE,
        ).length;

        const completedServiceOrders = serviceOrders.filter(
          (so) =>
            so.status === ServiceOrderStatus.FINALIZADA ||
            so.status === ServiceOrderStatus.ENTREGUE,
        ).length;

        return {
          ...this.mapPrismaMechanic(mechanic),
          activeServiceOrders,
          completedServiceOrders,
        };
      }),
    );

    return mechanicsWithStats;
  }

  async count(): Promise<number> {
    return this.prisma.mechanic.count();
  }

  async findById(id: string): Promise<MechanicWithStats | null> {
    const mechanic = await this.prisma.mechanic.findUnique({
      where: { id },
    });

    if (!mechanic) return null;

    const serviceOrders = await this.prisma.serviceOrder.findMany({
      where: { mechanicId: mechanic.id },
    });

    const activeServiceOrders = serviceOrders.filter(
      (so) =>
        so.status !== ServiceOrderStatus.FINALIZADA &&
        so.status !== ServiceOrderStatus.ENTREGUE,
    ).length;

    const completedServiceOrders = serviceOrders.filter(
      (so) =>
        so.status === ServiceOrderStatus.FINALIZADA ||
        so.status === ServiceOrderStatus.ENTREGUE,
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
      orderBy: { createdAt: 'desc' },
    });

    const mechanicsWithStats = await Promise.all(
      mechanics.map(async (mechanic) => {
        const serviceOrders = await this.prisma.serviceOrder.findMany({
          where: { mechanicId: mechanic.id },
        });

        const activeServiceOrders = serviceOrders.filter(
          (so) =>
            so.status !== ServiceOrderStatus.FINALIZADA &&
            so.status !== ServiceOrderStatus.ENTREGUE,
        ).length;

        const completedServiceOrders = serviceOrders.filter(
          (so) =>
            so.status === ServiceOrderStatus.FINALIZADA ||
            so.status === ServiceOrderStatus.ENTREGUE,
        ).length;

        return {
          ...this.mapPrismaMechanic(mechanic),
          activeServiceOrders,
          completedServiceOrders,
        };
      }),
    );

    return mechanicsWithStats;
  }

  async findBySpecialty(specialty: string): Promise<MechanicWithStats[]> {
    const mechanics = await this.prisma.mechanic.findMany({
      where: {
        isActive: true,
        specialties: {
          contains: specialty,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter by parsed specialties for exact match
    const filteredMechanics = mechanics.filter((mechanic) => {
      const specialties = JSON.parse(mechanic.specialties);
      return specialties.includes(specialty);
    });

    const mechanicsWithStats = await Promise.all(
      filteredMechanics.map(async (mechanic) => {
        const serviceOrders = await this.prisma.serviceOrder.findMany({
          where: { mechanicId: mechanic.id },
        });

        const activeServiceOrders = serviceOrders.filter(
          (so) =>
            so.status !== ServiceOrderStatus.FINALIZADA &&
            so.status !== ServiceOrderStatus.ENTREGUE,
        ).length;

        const completedServiceOrders = serviceOrders.filter(
          (so) =>
            so.status === ServiceOrderStatus.FINALIZADA ||
            so.status === ServiceOrderStatus.ENTREGUE,
        ).length;

        return {
          ...this.mapPrismaMechanic(mechanic),
          activeServiceOrders,
          completedServiceOrders,
        };
      }),
    );

    return mechanicsWithStats;
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
      this.errorHandler.handleNotFoundError(
        MECHANIC_CONSTANTS.MESSAGES.NOT_FOUND,
      );
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
    });

    if (!mechanic) {
      this.errorHandler.handleNotFoundError(
        MECHANIC_CONSTANTS.MESSAGES.NOT_FOUND,
      );
    }

    const serviceOrders = await this.prisma.serviceOrder.findMany({
      where: { mechanicId },
    });

    const activeOrders = serviceOrders.filter(
      (so) =>
        so.status !== ServiceOrderStatus.FINALIZADA &&
        so.status !== ServiceOrderStatus.ENTREGUE,
    ).length;

    const completedThisMonth = serviceOrders.filter(
      (so) =>
        (so.status === ServiceOrderStatus.FINALIZADA ||
          so.status === ServiceOrderStatus.ENTREGUE) &&
        so.completedAt &&
        so.completedAt >= startOfMonth,
    ).length;

    const completedOrders = serviceOrders.filter(
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
      averageCompletionTime: Math.round(averageCompletionTime * 100) / 100,
    };
  }

  async assignToServiceOrder(
    mechanicId: string,
    serviceOrderId?: string,
  ): Promise<void> {
    // If a serviceOrderId was provided, associate the mechanic with the service order
    // Do NOT mark as unavailable yet - that happens when OS enters EM_EXECUCAO
    if (serviceOrderId) {
      await this.prisma.serviceOrder.update({
        where: { id: serviceOrderId },
        data: { mechanicId },
      });
    }
  }

  async markAsUnavailable(mechanicId: string): Promise<void> {
    // Mark mechanic as unavailable when OS enters EM_EXECUCAO
    await this.prisma.mechanic.update({
      where: { id: mechanicId },
      data: { isAvailable: false },
    });
  }

  async releaseFromServiceOrder(mechanicId: string): Promise<void> {
    // Mark mechanic as available again
    await this.prisma.mechanic.update({
      where: { id: mechanicId },
      data: { isAvailable: true },
    });
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
