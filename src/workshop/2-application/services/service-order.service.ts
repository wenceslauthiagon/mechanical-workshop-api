import { HttpStatus, Injectable, Logger, Inject } from '@nestjs/common';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';
import { EmailService } from '../../../shared/services/email.service';
import { ServiceOrderStatus, ServiceOrder } from '@prisma/client';
import { CreateServiceOrderDto } from '../../1-presentation/dtos/service-order/create-service-order.dto';
import { UpdateServiceOrderStatusDto } from '../../1-presentation/dtos/service-order/update-service-order-status.dto';
import { ServiceOrderResponseDto } from '../../1-presentation/dtos/service-order/service-order-response.dto';
import type { IServiceOrderRepository } from '../../3-domain/repositories/service-order.repository.interface';
import type { ICustomerRepository } from '../../3-domain/repositories/customer-repository.interface';
import type { IVehicleRepository } from '../../3-domain/repositories/vehicle-repository.interface';
import type { IServiceRepository } from '../../3-domain/repositories/service-repository.interface';
import type { IPartRepository } from '../../3-domain/repositories/part-repository.interface';
import { NotificationService } from './notification.service';
import { MechanicService } from './mechanic.service';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  ERROR_MESSAGES,
  NOTES_MESSAGES,
} from '../../../shared/constants/messages.constants';
import { APP_CONSTANTS } from '../../../shared/constants/app.constants';
import { PaginationDto, PaginatedResponseDto } from '../../../shared';

@Injectable()
export class ServiceOrderService {
  private readonly logger = new Logger(ServiceOrderService.name);

  constructor(
    @Inject('IServiceOrderRepository')
    private readonly serviceOrderRepository: IServiceOrderRepository,
    @Inject('ICustomerRepository')
    private readonly customerRepository: ICustomerRepository,
    @Inject('IVehicleRepository')
    private readonly vehicleRepository: IVehicleRepository,
    @Inject('IServiceRepository')
    private readonly serviceRepository: IServiceRepository,
    @Inject('IPartRepository')
    private readonly partRepository: IPartRepository,
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
    private readonly emailService: EmailService,
    private readonly notificationService: NotificationService,
    private readonly mechanicService: MechanicService,
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
    const responsePromises = serviceOrders.map((serviceOrder) =>
      this.mapToResponseDto(serviceOrder),
    );
    return Promise.all(responsePromises);
  }

  async findAllPaginated(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<ServiceOrderResponseDto>> {
    const { skip, take, page = 0, size = 10 } = paginationDto;

    const [serviceOrders, total] = await Promise.all([
      this.serviceOrderRepository.findMany(skip, take),
      this.serviceOrderRepository.count(),
    ]);

    const responsePromises = serviceOrders.map((serviceOrder) =>
      this.mapToResponseDto(serviceOrder),
    );
    const responseDtos = await Promise.all(responsePromises);

    return new PaginatedResponseDto(responseDtos, page, size, total);
  }

  async findAllPaginatedWithPriority(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<ServiceOrderResponseDto>> {
    const { skip, take, page = 0, size = 10 } = paginationDto;

    const [serviceOrders, total] = await Promise.all([
      this.serviceOrderRepository.findManyWithPriority(skip, take),
      this.serviceOrderRepository.countWithPriority(),
    ]);

    const responsePromises = serviceOrders.map((serviceOrder) =>
      this.mapToResponseDto(serviceOrder),
    );
    const responseDtos = await Promise.all(responsePromises);

    return new PaginatedResponseDto(responseDtos, page, size, total);
  }

  async findById(id: string): Promise<ServiceOrderResponseDto> {
    const serviceOrder = await this.serviceOrderRepository.findById(id);
    if (!serviceOrder) {
      this.errorHandler.handleNotFoundError(
        ERROR_MESSAGES.SERVICE_ORDER_NOT_FOUND,
      );
    }
    return await this.mapToResponseDto(serviceOrder);
  }

  async findByCustomer(customerId: string): Promise<ServiceOrderResponseDto[]> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      this.errorHandler.handleNotFoundError(ERROR_MESSAGES.CLIENT_NOT_FOUND);
    }

    const serviceOrders =
      await this.serviceOrderRepository.findByCustomerId(customerId);
    const responsePromises = serviceOrders.map((serviceOrder) =>
      this.mapToResponseDto(serviceOrder),
    );
    return Promise.all(responsePromises);
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
      case ServiceOrderStatus.EM_EXECUCAO: {
        // Validate if there is a mechanic assigned to the service order
        if (!serviceOrder.mechanicId) {
          this.errorHandler.generateException(
            ERROR_MESSAGES.MECHANIC_REQUIRED_FOR_EXECUTION,
            HttpStatus.BAD_REQUEST,
          );
        }

        // Check if the mechanic is already executing another service order
        const mechanic = await this.mechanicService.findById(
          serviceOrder.mechanicId,
        );
        if (!mechanic.isAvailable) {
          this.errorHandler.handleConflictError(
            ERROR_MESSAGES.MECHANIC_BUSY_WITH_OTHER_ORDER,
          );
        }

        // Mark mechanic as unavailable when service order starts execution
        await this.mechanicService.markAsUnavailable(serviceOrder.mechanicId);
        if (!serviceOrder.startedAt) {
          updateData.startedAt = now;
        }
        break;
      }
      case ServiceOrderStatus.FINALIZADA: {
        updateData.completedAt = now;
        // Release mechanic when service is completed
        if (serviceOrder.mechanicId) {
          await this.mechanicService.releaseFromServiceOrder(
            serviceOrder.mechanicId,
          );
        }
        break;
      }
      case ServiceOrderStatus.ENTREGUE: {
        updateData.deliveredAt = now;
        // Release mechanic when service is delivered (in case it wasn't released before)
        if (serviceOrder.mechanicId) {
          await this.mechanicService.releaseFromServiceOrder(
            serviceOrder.mechanicId,
          );
        }
        break;
      }
      case ServiceOrderStatus.AGUARDANDO_APROVACAO:
        break;
    }

    await this.serviceOrderRepository.updateStatus(id, updateData);

    await this.serviceOrderRepository.addStatusHistory({
      serviceOrderId: id,
      status: data.status,
      notes: data.notes || `Status alterado para ${data.status}`,
    });

    const customer = await this.customerRepository.findById(
      serviceOrder.customerId,
    );
    const vehicle = await this.vehicleRepository.findById(
      serviceOrder.vehicleId,
    );

    if (customer && vehicle) {
      const vehicleInfo = `${vehicle.brand} ${vehicle.model} - ${vehicle.licensePlate}`;

      try {
        await this.notificationService.sendServiceOrderStatusNotification(
          id,
          serviceOrder.orderNumber,
          data.status,
          customer.email,
          customer.name,
          vehicleInfo,
          customer.phone,
        );
      } catch (error) {
        this.logger.warn(`Failed to send push notification: ${error.message}`);
      }

      if (customer.email) {
        try {
          await this.emailService.sendStatusChangeNotification({
            customerName: customer.name,
            customerEmail: customer.email,
            orderNumber: serviceOrder.orderNumber,
            newStatus: data.status,
            statusMessage: data.notes || `Status alterado para ${data.status}`,
          });
        } catch (error) {
          this.logger.warn(
            `Failed to send email notification: ${error.message}`,
          );
        }
      }
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
    const responsePromises = serviceOrders.map((serviceOrder) =>
      this.mapToResponseDto(serviceOrder),
    );
    return Promise.all(responsePromises);
  }

  async findByVehiclePlate(
    licensePlate: string,
  ): Promise<ServiceOrderResponseDto[]> {
    const vehicle = await this.vehicleRepository.findByPlate(licensePlate);
    if (!vehicle) {
      this.errorHandler.handleNotFoundError(ERROR_MESSAGES.VEHICLE_NOT_FOUND);
    }

    const serviceOrders = await this.serviceOrderRepository.findByVehicleId(
      vehicle.id,
    );
    const responsePromises = serviceOrders.map((serviceOrder) =>
      this.mapToResponseDto(serviceOrder),
    );
    return Promise.all(responsePromises);
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

  private async mapToResponseDto(
    serviceOrder: ServiceOrder,
  ): Promise<ServiceOrderResponseDto> {
    // Fetch related data separately to ensure freshness
    const customer = await this.customerRepository.findById(
      serviceOrder.customerId,
    );
    const vehicle = await this.vehicleRepository.findById(
      serviceOrder.vehicleId,
    );
    const mechanic = serviceOrder.mechanicId
      ? await this.mechanicService.findById(serviceOrder.mechanicId)
      : null;

    // Fetch service order items separately
    const serviceItems = await this.prisma.serviceOrderItem.findMany({
      where: { serviceOrderId: serviceOrder.id },
    });
    const partItems = await this.prisma.serviceOrderPart.findMany({
      where: { serviceOrderId: serviceOrder.id },
    });

    // Fetch related services and parts
    const services = await Promise.all(
      serviceItems.map(async (item) => {
        const service = await this.serviceRepository.findById(item.serviceId);
        return {
          id: item.id,
          serviceId: item.serviceId,
          quantity: item.quantity,
          price: item.price.toString(),
          totalPrice: item.totalPrice.toString(),
          service: {
            name: service?.name || '',
            description: service?.description || null,
            category: service?.category || '',
          },
        };
      }),
    );

    const parts = await Promise.all(
      partItems.map(async (item) => {
        const part = await this.partRepository.findById(item.partId);
        return {
          id: item.id,
          partId: item.partId,
          quantity: item.quantity,
          price: item.price.toString(),
          totalPrice: item.totalPrice.toString(),
          part: {
            name: part?.name || '',
            description: part?.description || null,
            partNumber: part?.partNumber || null,
          },
        };
      }),
    );

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
      customer: customer
        ? {
            id: customer.id,
            name: customer.name,
            document: customer.document,
            type: customer.type,
            email: customer.email,
            phone: customer.phone,
          }
        : undefined,
      vehicle: vehicle
        ? {
            id: vehicle.id,
            licensePlate: vehicle.licensePlate,
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            color: vehicle.color,
          }
        : undefined,
      mechanic: mechanic
        ? {
            id: mechanic.id,
            name: mechanic.name,
            specialty: mechanic.specialties?.[0] || 'Geral',
            phone: mechanic.phone || '',
            isAvailable: mechanic.isAvailable,
          }
        : null,
      services,
      parts,
    };
  }
}
