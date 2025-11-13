import { Injectable } from '@nestjs/common';
import { ServiceOrderStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { IServiceOrderRepository } from 'src/workshop/3-domain/repositories/service-order.repository.interface';

@Injectable()
export class ServiceOrderRepository implements IServiceOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    orderNumber: string;
    customerId: string;
    vehicleId: string;
    description: string;
    status: ServiceOrderStatus;
    totalServicePrice: number;
    totalPartsPrice: number;
    totalPrice: number;
    estimatedTimeHours: number;
    estimatedCompletionDate: Date;
  }) {
    return this.prisma.serviceOrder.create({
      data: {
        ...data,
        totalServicePrice: data.totalServicePrice,
        totalPartsPrice: data.totalPartsPrice,
        totalPrice: data.totalPrice,
        estimatedTimeHours: data.estimatedTimeHours,
      },
    });
  }

  async findAll() {
    return this.prisma.serviceOrder.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMany(skip: number, take: number) {
    return this.prisma.serviceOrder.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findManyWithPriority(skip: number, take: number) {
    const statusPriority = {
      [ServiceOrderStatus.EM_EXECUCAO]: 1,
      [ServiceOrderStatus.AGUARDANDO_APROVACAO]: 2,
      [ServiceOrderStatus.EM_DIAGNOSTICO]: 3,
      [ServiceOrderStatus.RECEBIDA]: 4,
    };

    const orders = await this.prisma.serviceOrder.findMany({
      where: {
        status: {
          notIn: [ServiceOrderStatus.FINALIZADA, ServiceOrderStatus.ENTREGUE],
        },
      },
    });

    const sortedOrders = orders
      .sort((a, b) => {
        const priorityDiff =
          (statusPriority[a.status] || 999) - (statusPriority[b.status] || 999);
        if (priorityDiff !== 0) return priorityDiff;
        return a.createdAt.getTime() - b.createdAt.getTime();
      })
      .slice(skip, skip + take);

    return sortedOrders;
  }

  async countWithPriority(): Promise<number> {
    return this.prisma.serviceOrder.count({
      where: {
        status: {
          notIn: [ServiceOrderStatus.FINALIZADA, ServiceOrderStatus.ENTREGUE],
        },
      },
    });
  }

  async count(): Promise<number> {
    return this.prisma.serviceOrder.count();
  }

  async findById(id: string) {
    return this.prisma.serviceOrder.findUnique({
      where: { id },
    });
  }

  async findByCustomerId(customerId: string) {
    return this.prisma.serviceOrder.findMany({
      where: { customerId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateStatus(
    id: string,
    data: {
      status: ServiceOrderStatus;
      startedAt?: Date;
      completedAt?: Date;
      deliveredAt?: Date;
      approvedAt?: Date;
    },
  ) {
    return this.prisma.serviceOrder.update({
      where: { id },
      data,
    });
  }

  async updateTotals(
    id: string,
    data: {
      totalServicePrice: number;
      totalPartsPrice: number;
      totalPrice: number;
      estimatedTimeHours: number;
      estimatedCompletionDate: Date;
    },
  ) {
    return this.prisma.serviceOrder.update({
      where: { id },
      data: {
        totalServicePrice: data.totalServicePrice,
        totalPartsPrice: data.totalPartsPrice,
        totalPrice: data.totalPrice,
        estimatedTimeHours: data.estimatedTimeHours,
        estimatedCompletionDate: data.estimatedCompletionDate,
      },
    });
  }

  async addServiceItem(data: {
    serviceOrderId: string;
    serviceId: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }) {
    return this.prisma.serviceOrderItem.create({
      data: {
        serviceOrderId: data.serviceOrderId,
        serviceId: data.serviceId,
        quantity: data.quantity,
        price: data.price,
        totalPrice: data.totalPrice,
      },
    });
  }

  async addPartItem(data: {
    serviceOrderId: string;
    partId: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }) {
    return this.prisma.serviceOrderPart.create({
      data: {
        serviceOrderId: data.serviceOrderId,
        partId: data.partId,
        quantity: data.quantity,
        price: data.price,
        totalPrice: data.totalPrice,
      },
    });
  }

  async addStatusHistory(data: {
    serviceOrderId: string;
    status: ServiceOrderStatus;
    notes?: string;
    changedBy?: string;
  }) {
    return this.prisma.serviceOrderStatusHistory.create({
      data,
    });
  }

  async getStatusHistory(serviceOrderId: string) {
    return this.prisma.serviceOrderStatusHistory.findMany({
      where: { serviceOrderId },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async countByYear(year: number): Promise<number> {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);

    return this.prisma.serviceOrder.count({
      where: {
        createdAt: {
          gte: startOfYear,
          lt: endOfYear,
        },
      },
    });
  }

  async findByOrderNumber(orderNumber: string) {
    return this.prisma.serviceOrder.findUnique({
      where: { orderNumber },
    });
  }

  async findByVehicleId(vehicleId: string) {
    return this.prisma.serviceOrder.findMany({
      where: { vehicleId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findCompletedOrders() {
    return this.prisma.serviceOrder.findMany({
      where: {
        status: {
          in: [ServiceOrderStatus.FINALIZADA, ServiceOrderStatus.ENTREGUE],
        },
        startedAt: { not: null },
        completedAt: { not: null },
      },
      orderBy: {
        completedAt: 'desc',
      },
    });
  }

  async delete(id: string) {
    return this.prisma.serviceOrder.delete({
      where: { id },
    });
  }
}
