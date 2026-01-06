import { Injectable } from '@nestjs/common';
import type { Service } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { IServiceRepository } from '../../3-domain/repositories/service-repository.interface';

@Injectable()
export class ServiceRepository implements IServiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Service> {
    return this.prisma.service.create({ data });
  }

  async findAll(filters?: {
    category?: string;
    active?: boolean;
  }): Promise<Service[]> {
    const where: {
      category?: string;
      isActive?: boolean;
    } = {};

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.active !== undefined) {
      where.isActive = filters.active;
    }

    return this.prisma.service.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMany(
    skip: number,
    take: number,
    filters?: {
      category?: string;
      active?: boolean;
    },
  ): Promise<Service[]> {
    const where: {
      category?: string;
      isActive?: boolean;
    } = {};

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.active !== undefined) {
      where.isActive = filters.active;
    }

    return this.prisma.service.findMany({
      skip,
      take,
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(filters?: {
    category?: string;
    active?: boolean;
  }): Promise<number> {
    const where: {
      category?: string;
      isActive?: boolean;
    } = {};

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.active !== undefined) {
      where.isActive = filters.active;
    }

    return this.prisma.service.count({ where });
  }

  async findById(id: string): Promise<Service | null> {
    return this.prisma.service.findUnique({ where: { id } });
  }

  async findByName(name: string): Promise<Service | null> {
    return this.prisma.service.findFirst({ where: { name } });
  }

  async findByCategory(category: string): Promise<Service[]> {
    return this.prisma.service.findMany({ where: { category } });
  }

  async update(
    id: string,
    data: Partial<Omit<Service, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Service> {
    return this.prisma.service.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.service.delete({ where: { id } });
  }
}
