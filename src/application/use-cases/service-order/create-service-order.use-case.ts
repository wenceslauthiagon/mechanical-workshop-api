import { Injectable } from '@nestjs/common';
import { ServiceOrder } from '../../../domain/entities';
import type {
  ServiceOrderRepository,
  CustomerRepository,
} from '../../../domain/repositories';
import {
  CreateServiceOrderDto,
  ServiceOrderResponseDto,
} from '../../dtos/service-order.dto';

@Injectable()
export class CreateServiceOrderUseCase {
  constructor(
    private readonly serviceOrderRepository: ServiceOrderRepository,
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(
    createOrderDto: CreateServiceOrderDto,
  ): Promise<ServiceOrderResponseDto> {
    // Verificar se cliente existe
    const customer = await this.customerRepository.findById(
      createOrderDto.customerId,
    );
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Criar ordem de serviço
    const serviceOrder = new ServiceOrder(
      createOrderDto.customerId,
      createOrderDto.vehicleId,
      createOrderDto.description,
      createOrderDto.services,
      createOrderDto.parts,
    );

    const savedOrder = await this.serviceOrderRepository.save(serviceOrder);

    return this.mapToResponseDto(savedOrder);
  }

  private mapToResponseDto(order: ServiceOrder): ServiceOrderResponseDto {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      vehicleId: order.vehicleId,
      status: order.status,
      description: order.description,
      services: order.services,
      parts: order.parts,
      totalServicePrice: order.totalServicePrice,
      totalPartsPrice: order.totalPartsPrice,
      totalPrice: order.totalPrice,
      estimatedTimeHours: order.estimatedTimeHours,
      estimatedCompletionDate: order.estimatedCompletionDate,
      startedAt: order.startedAt,
      completedAt: order.completedAt,
      deliveredAt: order.deliveredAt,
      approvedAt: order.approvedAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
