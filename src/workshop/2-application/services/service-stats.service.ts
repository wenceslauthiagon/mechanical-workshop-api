import { Injectable, Inject } from '@nestjs/common';
import type { IServiceOrderRepository } from '../../3-domain/repositories/service-order.repository.interface';
import type { IServiceRepository } from '../../3-domain/repositories/service-repository.interface';
import { PrismaService } from '../../../prisma/prisma.service';
import { APP_CONSTANTS } from '../../../shared/constants/app.constants';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';

export interface ServiceExecutionStats {
  serviceId: string;
  serviceName: string;
  averageExecutionHours: number;
  totalCompletedOrders: number;
  estimatedTimeHours: number;
  accuracyPercentage: number;
}

export interface OverallStats {
  totalCompletedOrders: number;
  averageExecutionTime: number;
  averageEstimatedTime: number;
  overallAccuracy: number;
}

@Injectable()
export class ServiceStatsService {
  constructor(
    @Inject('IServiceOrderRepository')
    private readonly serviceOrderRepository: IServiceOrderRepository,
    @Inject('IServiceRepository')
    private readonly serviceRepository: IServiceRepository,
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async getServiceExecutionStats(): Promise<ServiceExecutionStats[]> {
    const completedOrders =
      await this.serviceOrderRepository.findCompletedOrders();

    const services = await this.serviceRepository.findAll();

    const statsMap = new Map<
      string,
      {
        totalExecutionTime: number;
        totalEstimatedTime: number;
        orderCount: number;
        serviceName: string;
        estimatedMinutes: number;
      }
    >();

    for (const order of completedOrders) {
      if (!order.startedAt || !order.completedAt) continue;

      const executionTimeMs =
        order.completedAt.getTime() - order.startedAt.getTime();
      const executionTimeHours =
        executionTimeMs / APP_CONSTANTS.MS_TO_HOURS_DIVISOR;

      // Fetch service items for this order
      const serviceItems = await this.prisma.serviceOrderItem.findMany({
        where: { serviceOrderId: order.id },
      });

      const totalQuantity = serviceItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      for (const serviceItem of serviceItems) {
        const serviceId = serviceItem.serviceId;
        const quantity = serviceItem.quantity;

        if (!statsMap.has(serviceId)) {
          const service = services.find((s) => s.id === serviceId);
          if (!service) continue;

          statsMap.set(serviceId, {
            totalExecutionTime: 0,
            totalEstimatedTime: 0,
            orderCount: 0,
            serviceName: service.name,
            estimatedMinutes: service.estimatedMinutes,
          });
        }

        const stats = statsMap.get(serviceId)!;
        const estimatedTimeForQuantity =
          (stats.estimatedMinutes * quantity) / 60;
        const proportionalExecutionTime =
          (executionTimeHours * quantity) / totalQuantity;

        stats.totalExecutionTime += proportionalExecutionTime;
        stats.totalEstimatedTime += estimatedTimeForQuantity;
        stats.orderCount += 1;
      }
    }

    const result: ServiceExecutionStats[] = [];

    for (const [serviceId, stats] of statsMap) {
      if (stats.orderCount === 0) continue;

      const averageExecutionHours = stats.totalExecutionTime / stats.orderCount;
      const averageEstimatedHours = stats.totalEstimatedTime / stats.orderCount;
      const accuracyPercentage =
        averageEstimatedHours > 0
          ? Math.max(
              0,
              APP_CONSTANTS.PERCENTAGE_MAX -
                (Math.abs(averageExecutionHours - averageEstimatedHours) /
                  averageEstimatedHours) *
                  APP_CONSTANTS.PERCENTAGE_MAX,
            )
          : 0;

      result.push({
        serviceId,
        serviceName: stats.serviceName,
        averageExecutionHours: Number(averageExecutionHours.toFixed(2)),
        totalCompletedOrders: stats.orderCount,
        estimatedTimeHours: Number(averageEstimatedHours.toFixed(2)),
        accuracyPercentage: Number(accuracyPercentage.toFixed(2)),
      });
    }

    return result.sort(
      (a, b) => b.totalCompletedOrders - a.totalCompletedOrders,
    );
  }

  async getOverallStats(): Promise<OverallStats> {
    const completedOrders =
      await this.serviceOrderRepository.findCompletedOrders();

    if (completedOrders.length === 0) {
      return {
        totalCompletedOrders: 0,
        averageExecutionTime: 0,
        averageEstimatedTime: 0,
        overallAccuracy: 0,
      };
    }

    let totalExecutionTime = 0;
    let totalEstimatedTime = 0;
    let validOrdersCount = 0;

    for (const order of completedOrders) {
      if (!order.startedAt || !order.completedAt) continue;

      const executionTimeMs =
        order.completedAt.getTime() - order.startedAt.getTime();
      const executionTimeHours =
        executionTimeMs / APP_CONSTANTS.MS_TO_HOURS_DIVISOR;

      totalExecutionTime += executionTimeHours;
      totalEstimatedTime += Number(order.estimatedTimeHours);
      validOrdersCount++;
    }

    const averageExecutionTime = totalExecutionTime / validOrdersCount;
    const averageEstimatedTime = totalEstimatedTime / validOrdersCount;
    const overallAccuracy =
      averageEstimatedTime > 0
        ? Math.max(
            0,
            APP_CONSTANTS.PERCENTAGE_MAX -
              (Math.abs(averageExecutionTime - averageEstimatedTime) /
                averageEstimatedTime) *
                APP_CONSTANTS.PERCENTAGE_MAX,
          )
        : 0;

    return {
      totalCompletedOrders: completedOrders.length,
      averageExecutionTime: Number(averageExecutionTime.toFixed(2)),
      averageEstimatedTime: Number(averageEstimatedTime.toFixed(2)),
      overallAccuracy: Number(overallAccuracy.toFixed(2)),
    };
  }

  async getServiceById(
    serviceId: string,
  ): Promise<ServiceExecutionStats | null> {
    const stats = await this.getServiceExecutionStats();
    return stats.find((stat) => stat.serviceId === serviceId) || null;
  }
}
