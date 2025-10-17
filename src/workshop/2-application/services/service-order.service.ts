import { HttpStatus, Injectable, Logger } from '@nestjs/common';
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
import { NotificationService } from './notification.service';
import { ServiceOrderWithRelations } from '../../3-domain/repositories/service-order.repository.interface';
import {
  ERROR_MESSAGES,
  NOTES_MESSAGES,
  NOTIFICATION_MESSAGES,
} from '../../../shared/constants/messages.constants';
import { APP_CONSTANTS } from '../../../shared/constants/app.constants';

@Injectable()
export class ServiceOrderService {
  private readonly logger = new Logger(ServiceOrderService.name);

  constructor(
    private readonly serviceOrderRepository: ServiceOrderRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly partRepository: PartRepository,
    private readonly errorHandler: ErrorHandlerService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(data: CreateServiceOrderDto): Promise<ServiceOrderResponseDto> {
    const customer = await this.customerRepository.findById(data.customerId);
    if (!customer) {
      this.errorHandler.handleNotFoundError(ERROR_MESSAGES.CLIENT_NOT_FOUND);
    }

    const vehicle = await this.vehicleRepository.findById(data.vehicleId);
    if (!vehicle) {
      this.errorHandler.handleNotFoundError(ERROR_MESSAGES.VEHICLE_NOT_FOUND);
    }
    if (vehicle.customerId !== data.customerId) {
      this.errorHandler.generateException(
        ERROR_MESSAGES.VEHICLE_NOT_BELONGS_TO_CLIENT,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (data.services && data.services.length > 0) {
      for (const serviceItem of data.services) {
        const service = await this.serviceRepository.findById(
          serviceItem.serviceId,
        );
        if (!service) {
          this.errorHandler.handleNotFoundError(
            `Serviço ${serviceItem.serviceId} não encontrado`,
          );
        }
        if (!service.isActive) {
          this.errorHandler.generateException(
            `Serviço ${service.name} não está ativo`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }

    if (data.parts && data.parts.length > 0) {
      for (const partItem of data.parts) {
        const part = await this.partRepository.findById(partItem.partId);
        if (!part) {
          this.errorHandler.handleNotFoundError(
            `${ERROR_MESSAGES.PART_NOT_FOUND}: ${partItem.partId}`,
          );
        }
        if (!part.isActive) {
          this.errorHandler.generateException(
            `${ERROR_MESSAGES.PART_NOT_ACTIVE}: ${part.name}`,
            HttpStatus.BAD_REQUEST,
          );
        }
        if (part.stock < partItem.quantity) {
          this.errorHandler.generateException(
            `${ERROR_MESSAGES.INSUFFICIENT_STOCK_FOR_PART} ${part.name}. Disponível: ${part.stock}, Solicitado: ${partItem.quantity}`,
            HttpStatus.BAD_REQUEST,
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
      status: ServiceOrderStatus.RECEBIDA,
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
      status: ServiceOrderStatus.RECEBIDA,
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
      this.errorHandler.handleNotFoundError(
        ERROR_MESSAGES.SERVICE_ORDER_NOT_FOUND,
      );
    }
    return this.mapToResponseDto(serviceOrder);
  }

  async findByCustomer(customerId: string): Promise<ServiceOrderResponseDto[]> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      this.errorHandler.handleNotFoundError(ERROR_MESSAGES.CLIENT_NOT_FOUND);
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
      this.errorHandler.handleNotFoundError(
        ERROR_MESSAGES.SERVICE_ORDER_NOT_FOUND,
      );
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
      case ServiceOrderStatus.EM_EXECUCAO:
        if (!serviceOrder.startedAt) {
          updateData.startedAt = now;
        }
        break;
      case ServiceOrderStatus.FINALIZADA:
        updateData.completedAt = now;
        break;
      case ServiceOrderStatus.ENTREGUE:
        updateData.deliveredAt = now;
        break;
      case ServiceOrderStatus.AGUARDANDO_APROVACAO:
        break;
    }

    await this.serviceOrderRepository.updateStatus(id, updateData);

    await this.serviceOrderRepository.addStatusHistory({
      serviceOrderId: id,
      status: data.status,
      notes: data.notes || `Status alterado para ${data.status}`,
    });

    // Enviar notificação para o cliente
    try {
      const customer = await this.customerRepository.findById(
        serviceOrder.customerId,
      );
      const vehicle = await this.vehicleRepository.findById(
        serviceOrder.vehicleId,
      );

      if (customer && vehicle) {
        const vehicleInfo = `${vehicle.brand} ${vehicle.model} - ${vehicle.licensePlate}`;

        await this.notificationService.sendServiceOrderStatusNotification(
          id,
          serviceOrder.orderNumber,
          data.status,
          customer.email,
          customer.name,
          vehicleInfo,
          customer.phone,
        );
      }
    } catch (error) {
      this.logger.error(
        `${NOTIFICATION_MESSAGES.FAILED_TO_SEND_STATUS_NOTIFICATION} ${serviceOrder.orderNumber}`,
        error,
      );
    }

    return this.findById(id);
  }

  async approveOrder(id: string): Promise<ServiceOrderResponseDto> {
    const serviceOrder = await this.serviceOrderRepository.findById(id);
    if (!serviceOrder) {
      this.errorHandler.handleNotFoundError(
        ERROR_MESSAGES.SERVICE_ORDER_NOT_FOUND,
      );
    }

    if (serviceOrder.status !== ServiceOrderStatus.AGUARDANDO_APROVACAO) {
      this.errorHandler.generateException(
        ERROR_MESSAGES.SERVICE_ORDER_NOT_AWAITING_APPROVAL,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.serviceOrderRepository.updateStatus(id, {
      status: ServiceOrderStatus.EM_EXECUCAO,
      approvedAt: new Date(),
      startedAt: new Date(),
    });

    await this.serviceOrderRepository.addStatusHistory({
      serviceOrderId: id,
      status: ServiceOrderStatus.EM_EXECUCAO,
      notes: NOTES_MESSAGES.BUDGET_APPROVED_EXECUTION_STARTED,
    });

    return this.findById(id);
  }

  async getStatusHistory(id: string) {
    const serviceOrder = await this.serviceOrderRepository.findById(id);
    if (!serviceOrder) {
      this.errorHandler.handleNotFoundError(
        ERROR_MESSAGES.SERVICE_ORDER_NOT_FOUND,
      );
    }

    return this.serviceOrderRepository.getStatusHistory(id);
  }

  async findByOrderNumber(
    orderNumber: string,
  ): Promise<ServiceOrderResponseDto> {
    const serviceOrder =
      await this.serviceOrderRepository.findByOrderNumber(orderNumber);
    if (!serviceOrder) {
      this.errorHandler.handleNotFoundError(
        ERROR_MESSAGES.SERVICE_ORDER_NOT_FOUND,
      );
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
      this.errorHandler.handleNotFoundError(ERROR_MESSAGES.CLIENT_NOT_FOUND);
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
      this.errorHandler.handleNotFoundError(ERROR_MESSAGES.VEHICLE_NOT_FOUND);
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
      [ServiceOrderStatus.RECEBIDA]: [ServiceOrderStatus.EM_DIAGNOSTICO],
      [ServiceOrderStatus.EM_DIAGNOSTICO]: [
        ServiceOrderStatus.AGUARDANDO_APROVACAO,
        ServiceOrderStatus.EM_EXECUCAO,
      ],
      [ServiceOrderStatus.AGUARDANDO_APROVACAO]: [
        ServiceOrderStatus.EM_EXECUCAO,
        ServiceOrderStatus.EM_DIAGNOSTICO,
      ],
      [ServiceOrderStatus.EM_EXECUCAO]: [ServiceOrderStatus.FINALIZADA],
      [ServiceOrderStatus.FINALIZADA]: [ServiceOrderStatus.ENTREGUE],
      [ServiceOrderStatus.ENTREGUE]: [],
    };

    const allowedTransitions = validTransitions[currentStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      this.errorHandler.generateException(
        `Transição de status inválida: ${currentStatus} → ${newStatus}. Transições permitidas: ${allowedTransitions.join(', ')}`,
        HttpStatus.BAD_REQUEST,
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
      startedAt: serviceOrder.startedAt ?? null,
      completedAt: serviceOrder.completedAt ?? null,
      deliveredAt: serviceOrder.deliveredAt ?? null,
      approvedAt: serviceOrder.approvedAt ?? null,
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
            description: item.service.description ?? null,
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
            description: item.part.description ?? null,
            partNumber: item.part.partNumber ?? null,
          },
        })) || [],
    };
  }
}
