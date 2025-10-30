import { Injectable } from '@nestjs/common';
import type { Part } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { IPartRepository } from '../../3-domain/repositories/part-repository.interface';

@Injectable()
export class PartRepository implements IPartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Omit<Part, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Part> {
    return this.prisma.part.create({
      data,
    });
  }

  async findAll(filters?: {
    supplier?: string;
    active?: boolean;
    lowStock?: boolean;
  }): Promise<Part[]> {
    if (filters?.lowStock) {
      return this.prisma.$queryRaw`
        SELECT * FROM parts 
        WHERE stock <= min_stock 
        AND is_active = true
        ORDER BY name ASC
      `;
    }

    const where: any = {};

    if (filters?.supplier) {
      where.supplier = filters.supplier;
    }

    if (filters?.active !== undefined) {
      where.isActive = filters.active;
    }

    return this.prisma.part.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findMany(
    skip: number,
    take: number,
    filters?: {
      supplier?: string;
      active?: boolean;
      lowStock?: boolean;
    },
  ): Promise<Part[]> {
    if (filters?.lowStock) {
      return this.prisma.$queryRaw`
        SELECT * FROM parts 
        WHERE stock <= min_stock 
        AND is_active = true
        ORDER BY name ASC
        LIMIT ${take} OFFSET ${skip}
      `;
    }

    const where: any = {};

    if (filters?.supplier) {
      where.supplier = filters.supplier;
    }

    if (filters?.active !== undefined) {
      where.isActive = filters.active;
    }

    return this.prisma.part.findMany({
      skip,
      take,
      where,
      orderBy: {
        name: 'asc',
      },
    });
  }

  async count(filters?: {
    supplier?: string;
    active?: boolean;
    lowStock?: boolean;
  }): Promise<number> {
    if (filters?.lowStock) {
      const result: any = await this.prisma.$queryRaw`
        SELECT COUNT(*) as count FROM parts 
        WHERE stock <= min_stock 
        AND is_active = true
      `;
      return parseInt(result[0]?.count || '0');
    }

    const where: any = {};

    if (filters?.supplier) {
      where.supplier = filters.supplier;
    }

    if (filters?.active !== undefined) {
      where.isActive = filters.active;
    }

    return this.prisma.part.count({ where });
  }

  async findById(id: string): Promise<Part | null> {
    return this.prisma.part.findUnique({
      where: { id },
    });
  }

  async findByPartNumber(partNumber: string): Promise<Part | null> {
    return this.prisma.part.findUnique({
      where: { partNumber },
    });
  }

  async findLowStock(): Promise<Part[]> {
    return this.prisma.$queryRaw`
      SELECT * FROM parts 
      WHERE stock <= min_stock 
      AND is_active = true
      ORDER BY name ASC
    `;
  }

  async findBySupplier(supplier: string): Promise<Part[]> {
    return this.prisma.part.findMany({
      where: { supplier },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async updateStock(id: string, quantity: number): Promise<Part> {
    return this.prisma.part.update({
      where: { id },
      data: { stock: quantity },
    });
  }

  async update(
    id: string,
    data: Partial<Omit<Part, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Part> {
    return this.prisma.part.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.part.delete({
      where: { id },
    });
  }
}
