import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';
import { ServiceOrderStatus } from '@prisma/client';
import { CreateServiceOrderDto } from '../../1-presentation/dtos/service-order/create-service-order.dto';
import { UpdateServiceOrderStatusDto } from '../../1-presentation/dtos/service-order/update-service-order-status.dto';
import { ServiceOrderResponseDto } from '../../1-presentation/dtos/service-order/service-order-response.dto';
import { ServiceOrderRepository } from '../../4-infrastructure/repositories/service-order.repository';
import { CustomerRepository } from '../../4-infrastructure/repositories/customer.repository';
import { VehicleRepository } from '../../4-infrastructure/repositories/vehicle.repository';
import { ServiceRepository } from '../../4-infrastructure/repositories/service.repository';
import { PartRepository } from '../../4-infrastructure/repositories/part.repository';
import { ServiceOrderWithRelations } from '../../3-domain/repositories/service-order.repository.interface';
import {
  ERROR_MESSAGES,
  NOTES_MESSAGES,
} from '../../../shared/constants/messages.constants';
import { APP_CONSTANTS } from '../../../shared/constants/app.constants';

@Injectable()
export class ServiceOrderService {
  constructor(
    private readonly serviceOrderRepository: ServiceOrderRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly partRepository: PartRepository,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async create(data: CreateServiceOrderDto): Promise<ServiceOrderResponseDto> {
    const customer = await this.customerRepository.findById(data.customerId);
    if (!customer) {
      throw new NotFoundException(ERROR_MESSAGES.CLIENT_NOT_FOUND);
    }

    const vehicle = await this.vehicleRepository.findById(data.vehicleId);
    if (!vehicle) {
      throw new NotFoundException(ERROR_MESSAGES.VEHICLE_NOT_FOUND);
    }
    if (vehicle.customerId !== data.customerId) {
      throw new BadRequestException(
        ERROR_MESSAGES.VEHICLE_NOT_BELONGS_TO_CLIENT,
      );
    }

    if (data.services && data.services.length > 0) {
      for (const serviceItem of data.services) {
        const service = await this.serviceRepository.findById(
          serviceItem.serviceId,
        );
        if (!service) {
          throw new NotFoundException(
            `Serviço ${serviceItem.serviceId} não encontrado`,
          );
        }
        if (!service.isActive) {
          throw new BadRequestException(
            `Serviço ${service.name} não está ativo`,
          );
        }
      }
    }

    if (data.parts && data.parts.length > 0) {
      for (const partItem of data.parts) {
        const part = await this.partRepository.findById(partItem.partId);
        if (!part) {
          throw new NotFoundException(
            `${ERROR_MESSAGES.PART_NOT_FOUND}: ${partItem.partId}`,
          );
        }
        if (!part.isActive) {
          throw new BadRequestException(
            `${ERROR_MESSAGES.PART_NOT_ACTIVE}: ${part.name}`,
          );
        }
        if (part.stock < partItem.quantity) {
          throw new BadRequestException(
            `${ERROR_MESSAGES.INSUFFICIENT_STOCK_FOR_PART} ${part.name}. Disponível: ${part.stock}, Solicitado: ${partItem.quantity}`,
          );
        }
      }
    }

    const orderNumber = await this.generateOrderNumber();
    let totalServicePrice = 0;
    let totalPartsPrice = 0;
    let estimatedTimeHours = 0;

    const serviceOrderData = {
      orderNumber,
      customerId: data.customerId,
      vehicleId: data.vehicleId,
      description: data.description,
      status: ServiceOrderStatus.RECEIVED,
      totalServicePrice: 0,
      totalPartsPrice: 0,
      totalPrice: 0,
      estimatedTimeHours: 0,
      estimatedCompletionDate: new Date(),
    };

    const serviceOrder =
      await this.serviceOrderRepository.create(serviceOrderData);

    if (data.services && data.services.length > 0) {
      for (const serviceItem of data.services) {
        const service = await this.serviceRepository.findById(
          serviceItem.serviceId,
        );
        const itemTotalPrice = Number(service!.price) * serviceItem.quantity;
        totalServicePrice += itemTotalPrice;
        estimatedTimeHours +=
          (service!.estimatedMinutes * serviceItem.quantity) / 60;

        await this.serviceOrderRepository.addServiceItem({
          serviceOrderId: serviceOrder.id,
          serviceId: serviceItem.serviceId,
          quantity: serviceItem.quantity,
          price: Number(service!.price),
          totalPrice: itemTotalPrice,
        });
      }
    }

    if (data.parts && data.parts.length > 0) {
      for (const partItem of data.parts) {
        const part = await this.partRepository.findById(partItem.partId);
        const itemTotalPrice = Number(part!.price) * partItem.quantity;
        totalPartsPrice += itemTotalPrice;

        await this.serviceOrderRepository.addPartItem({
          serviceOrderId: serviceOrder.id,
          partId: partItem.partId,
          quantity: partItem.quantity,
          price: Number(part!.price),
          totalPrice: itemTotalPrice,
        });

        await this.partRepository.updateStock(
          partItem.partId,
          part!.stock - partItem.quantity,
        );
      }
    }

    const estimatedCompletionDate = new Date();
    const totalHoursWithBuffer = estimatedTimeHours * 1.2;
    estimatedCompletionDate.setHours(
      estimatedCompletionDate.getHours() + totalHoursWithBuffer,
    );

    const totalPrice = totalServicePrice + totalPartsPrice;
    await this.serviceOrderRepository.updateTotals(serviceOrder.id, {
      totalServicePrice,
      totalPartsPrice,
      totalPrice,
      estimatedTimeHours,
      estimatedCompletionDate,
    });

    await this.serviceOrderRepository.addStatusHistory({
      serviceOrderId: serviceOrder.id,
      status: ServiceOrderStatus.RECEIVED,
      notes: NOTES_MESSAGES.SERVICE_ORDER_CREATED,
    });

    return this.findById(serviceOrder.id);
  }

  async findAll(): Promise<ServiceOrderResponseDto[]> {
    const serviceOrders = await this.serviceOrderRepository.findAll();
    return serviceOrders.map((serviceOrder) =>
      this.mapToResponseDto(serviceOrder),
    );
  }

  async findById(id: string): Promise<ServiceOrderResponseDto> {
    const serviceOrder = await this.serviceOrderRepository.findById(id);
    if (!serviceOrder) {
      throw new NotFoundException(ERROR_MESSAGES.SERVICE_ORDER_NOT_FOUND);
    }
    return this.mapToResponseDto(serviceOrder);
  }

  async findByCustomer(customerId: string): Promise<ServiceOrderResponseDto[]> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new NotFoundException(ERROR_MESSAGES.CLIENT_NOT_FOUND);
    }

    const serviceOrders =
      await this.serviceOrderRepository.findByCustomerId(customerId);
    return serviceOrders.map((serviceOrder) =>
      this.mapToResponseDto(serviceOrder),
    );
  }

  async updateStatus(
    id: string,
    data: UpdateServiceOrderStatusDto,
  ): Promise<ServiceOrderResponseDto> {
    const serviceOrder = await this.serviceOrderRepository.findById(id);
    if (!serviceOrder) {
      throw new NotFoundException(ERROR_MESSAGES.SERVICE_ORDER_NOT_FOUND);
    }

    this.validateStatusTransition(serviceOrder.status, data.status);
    const updateData: {
      status: ServiceOrderStatus;
      startedAt?: Date;
      completedAt?: Date;
      deliveredAt?: Date;
    } = {
      status: data.status,
    };

    const now = new Date();
    switch (data.status) {
      case ServiceOrderStatus.IN_EXECUTION:
        if (!serviceOrder.startedAt) {
          updateData.startedAt = now;
        }
        break;
      case ServiceOrderStatus.FINISHED:
        updateData.completedAt = now;
        break;
      case ServiceOrderStatus.DELIVERED:
        updateData.deliveredAt = now;
        break;
      case ServiceOrderStatus.AWAITING_APPROVAL:
        break;
    }

    await this.serviceOrderRepository.updateStatus(id, updateData);

    await this.serviceOrderRepository.addStatusHistory({
      serviceOrderId: id,
      status: data.status,
      notes: data.notes || `Status alterado para ${data.status}`,
    });

    return this.findById(id);
  }

  async approveOrder(id: string): Promise<ServiceOrderResponseDto> {
    const serviceOrder = await this.serviceOrderRepository.findById(id);
    if (!serviceOrder) {
      throw new NotFoundException(ERROR_MESSAGES.SERVICE_ORDER_NOT_FOUND);
    }

    if (serviceOrder.status !== ServiceOrderStatus.AWAITING_APPROVAL) {
      throw new BadRequestException(
        ERROR_MESSAGES.SERVICE_ORDER_NOT_AWAITING_APPROVAL,
      );
    }

    await this.serviceOrderRepository.updateStatus(id, {
      status: ServiceOrderStatus.IN_EXECUTION,
      approvedAt: new Date(),
      startedAt: new Date(),
    });

    await this.serviceOrderRepository.addStatusHistory({
      serviceOrderId: id,
      status: ServiceOrderStatus.IN_EXECUTION,
      notes: NOTES_MESSAGES.BUDGET_APPROVED_EXECUTION_STARTED,
    });

    return this.findById(id);
  }

  async getStatusHistory(id: string) {
    const serviceOrder = await this.serviceOrderRepository.findById(id);
    if (!serviceOrder) {
      throw new NotFoundException(ERROR_MESSAGES.SERVICE_ORDER_NOT_FOUND);
    }

    return this.serviceOrderRepository.getStatusHistory(id);
  }

  async findByOrderNumber(
    orderNumber: string,
  ): Promise<ServiceOrderResponseDto> {
    const serviceOrder =
      await this.serviceOrderRepository.findByOrderNumber(orderNumber);
    if (!serviceOrder) {
      throw new NotFoundException(ERROR_MESSAGES.SERVICE_ORDER_NOT_FOUND);
    }
    return this.mapToResponseDto(serviceOrder);
  }

  async findByCustomerDocument(
    document: string,
  ): Promise<ServiceOrderResponseDto[]> {
    const cleanDocument = document.replace(/[^\d]/g, '');
    const customer =
      await this.customerRepository.findByDocument(cleanDocument);
    if (!customer) {
      throw new NotFoundException(ERROR_MESSAGES.CLIENT_NOT_FOUND);
    }

    const serviceOrders = await this.serviceOrderRepository.findByCustomerId(
      customer.id,
    );
    return serviceOrders.map((serviceOrder) =>
      this.mapToResponseDto(serviceOrder),
    );
  }

  async findByVehiclePlate(
    licensePlate: string,
  ): Promise<ServiceOrderResponseDto[]> {
    const vehicle =
      await this.vehicleRepository.findByLicensePlate(licensePlate);
    if (!vehicle) {
      throw new NotFoundException(ERROR_MESSAGES.VEHICLE_NOT_FOUND);
    }

    const serviceOrders = await this.serviceOrderRepository.findByVehicleId(
      vehicle.id,
    );
    return serviceOrders.map((serviceOrder) =>
      this.mapToResponseDto(serviceOrder),
    );
  }

  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.serviceOrderRepository.countByYear(year);
    return `OS-${year}-${String(count + 1).padStart(
      APP_CONSTANTS.ORDER_NUMBER_PADDING,
      APP_CONSTANTS.ORDER_NUMBER_PAD_CHAR,
    )}`;
  }

  private validateStatusTransition(
    currentStatus: ServiceOrderStatus,
    newStatus: ServiceOrderStatus,
  ): void {
    const validTransitions: Record<ServiceOrderStatus, ServiceOrderStatus[]> = {
      [ServiceOrderStatus.RECEIVED]: [ServiceOrderStatus.IN_DIAGNOSIS],
      [ServiceOrderStatus.IN_DIAGNOSIS]: [
        ServiceOrderStatus.AWAITING_APPROVAL,
        ServiceOrderStatus.IN_EXECUTION,
      ],
      [ServiceOrderStatus.AWAITING_APPROVAL]: [
        ServiceOrderStatus.IN_EXECUTION,
        ServiceOrderStatus.IN_DIAGNOSIS,
      ],
      [ServiceOrderStatus.IN_EXECUTION]: [ServiceOrderStatus.FINISHED],
      [ServiceOrderStatus.FINISHED]: [ServiceOrderStatus.DELIVERED],
      [ServiceOrderStatus.DELIVERED]: [],
    };

    const allowedTransitions = validTransitions[currentStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Transição de status inválida: ${currentStatus} → ${newStatus}. Transições permitidas: ${allowedTransitions.join(', ')}`,
      );
    }
  }

  private mapToResponseDto(
    serviceOrder: ServiceOrderWithRelations,
  ): ServiceOrderResponseDto {
    return {
      id: serviceOrder.id,
      orderNumber: serviceOrder.orderNumber,
      customerId: serviceOrder.customerId,
      vehicleId: serviceOrder.vehicleId,
      status: serviceOrder.status,
      description: serviceOrder.description,
      totalServicePrice: serviceOrder.totalServicePrice.toString(),
      totalPartsPrice: serviceOrder.totalPartsPrice.toString(),
      totalPrice: serviceOrder.totalPrice.toString(),
      estimatedTimeHours: serviceOrder.estimatedTimeHours.toString(),
      estimatedCompletionDate: serviceOrder.estimatedCompletionDate,
      startedAt: serviceOrder.startedAt,
      completedAt: serviceOrder.completedAt,
      deliveredAt: serviceOrder.deliveredAt,
      approvedAt: serviceOrder.approvedAt,
      createdAt: serviceOrder.createdAt,
      updatedAt: serviceOrder.updatedAt,
      customer: serviceOrder.customer
        ? {
            id: serviceOrder.customer.id,
            name: serviceOrder.customer.name,
            document: serviceOrder.customer.document,
            type: serviceOrder.customer.type,
            email: serviceOrder.customer.email,
            phone: serviceOrder.customer.phone,
          }
        : undefined,
      vehicle: serviceOrder.vehicle
        ? {
            id: serviceOrder.vehicle.id,
            licensePlate: serviceOrder.vehicle.licensePlate,
            brand: serviceOrder.vehicle.brand,
            model: serviceOrder.vehicle.model,
            year: serviceOrder.vehicle.year,
            color: serviceOrder.vehicle.color,
          }
        : undefined,
      services:
        serviceOrder.services?.map((item) => ({
          id: item.id,
          serviceId: item.serviceId,
          quantity: item.quantity,
          price: item.price.toString(),
          totalPrice: item.totalPrice.toString(),
          service: {
            name: item.service.name,
            description: item.service.description,
            category: item.service.category,
          },
        })) || [],
      parts:
        serviceOrder.parts?.map((item) => ({
          id: item.id,
          partId: item.partId,
          quantity: item.quantity,
          price: item.price.toString(),
          totalPrice: item.totalPrice.toString(),
          part: {
            name: item.part.name,
            description: item.part.description,
            partNumber: item.part.partNumber,
          },
        })) || [],
    };
  }
}
