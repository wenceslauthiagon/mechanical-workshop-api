import { Injectable, HttpStatus } from '@nestjs/common';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';
import { VehicleRepository } from '../../4-infrastructure/repositories/vehicle.repository';
import { CustomerRepository } from '../../4-infrastructure/repositories/customer.repository';
import { CreateVehicleDto } from '../../1-presentation/dtos/vehicle/create-vehicle.dto';
import { UpdateVehicleDto } from '../../1-presentation/dtos/vehicle/update-vehicle.dto';
import { VehicleResponseDto } from '../../1-presentation/dtos/vehicle/vehicle-response.dto';
import { VehicleWithCustomer } from '../../3-domain/entities/vehicle.entity';
import { ERROR_MESSAGES } from '../../../shared/constants/messages.constants';

@Injectable()
export class VehicleService {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async create(data: CreateVehicleDto): Promise<VehicleResponseDto> {
    try {
      const customer = await this.customerRepository.findById(data.customerId);
      if (!customer) {
        this.errorHandler.generateException(
          ERROR_MESSAGES.CLIENT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      const existingVehicle = await this.vehicleRepository.findByLicensePlate(
        data.licensePlate,
      );
      if (existingVehicle) {
        this.errorHandler.generateException(
          ERROR_MESSAGES.LICENSE_PLATE_ALREADY_EXISTS,
          HttpStatus.CONFLICT,
        );
      }

      const vehicle = await this.vehicleRepository.create(data);
      return this.mapToResponseDto(vehicle);
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async findAll(): Promise<VehicleResponseDto[]> {
    const vehicles = await this.vehicleRepository.findAll();
    return vehicles.map((vehicle) => this.mapToResponseDto(vehicle));
  }

  async findById(id: string): Promise<VehicleResponseDto> {
    const vehicle = await this.vehicleRepository.findById(id);
    if (!vehicle) {
      this.errorHandler.handleNotFoundError(ERROR_MESSAGES.VEHICLE_NOT_FOUND);
    }
    return this.mapToResponseDto(vehicle);
  }

  async findByCustomerId(customerId: string): Promise<VehicleResponseDto[]> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      this.errorHandler.handleNotFoundError(ERROR_MESSAGES.CLIENT_NOT_FOUND);
    }

    const vehicles = await this.vehicleRepository.findByCustomerId(customerId);
    return vehicles.map((vehicle) => this.mapToResponseDto(vehicle));
  }

  async findByLicensePlate(licensePlate: string): Promise<VehicleResponseDto> {
    const vehicle =
      await this.vehicleRepository.findByLicensePlate(licensePlate);
    if (!vehicle) {
      this.errorHandler.handleNotFoundError(ERROR_MESSAGES.VEHICLE_NOT_FOUND);
    }
    return this.mapToResponseDto(vehicle);
  }

  async update(
    id: string,
    data: UpdateVehicleDto,
  ): Promise<VehicleResponseDto> {
    const vehicle = await this.vehicleRepository.findById(id);
    if (!vehicle) {
      this.errorHandler.handleNotFoundError(ERROR_MESSAGES.VEHICLE_NOT_FOUND);
    }

    if (data.customerId && data.customerId !== vehicle.customerId) {
      const customer = await this.customerRepository.findById(data.customerId);
      if (!customer) {
        this.errorHandler.handleNotFoundError(ERROR_MESSAGES.CLIENT_NOT_FOUND);
      }
    }

    if (data.licensePlate && data.licensePlate !== vehicle.licensePlate) {
      const existingVehicle = await this.vehicleRepository.findByLicensePlate(
        data.licensePlate,
      );
      if (existingVehicle) {
        this.errorHandler.handleConflictError(
          ERROR_MESSAGES.LICENSE_PLATE_ALREADY_EXISTS,
        );
      }
    }

    const updatedVehicle = await this.vehicleRepository.update(id, data);
    return this.mapToResponseDto(updatedVehicle);
  }

  async remove(id: string): Promise<void> {
    const vehicle = await this.vehicleRepository.findById(id);
    if (!vehicle) {
      this.errorHandler.handleNotFoundError(ERROR_MESSAGES.VEHICLE_NOT_FOUND);
    }

    const hasServiceOrders = await this.vehicleRepository.hasServiceOrders(id);
    if (hasServiceOrders) {
      this.errorHandler.handleConflictError(
        ERROR_MESSAGES.VEHICLE_HAS_SERVICE_ORDERS,
      );
    }

    await this.vehicleRepository.delete(id);
  }

  private mapToResponseDto(vehicle: VehicleWithCustomer): VehicleResponseDto {
    return {
      id: vehicle.id,
      licensePlate: vehicle.licensePlate,
      customerId: vehicle.customerId,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
      customer: vehicle.customer
        ? {
            id: vehicle.customer.id,
            name: vehicle.customer.name,
            document: vehicle.customer.document,
            email: vehicle.customer.email,
            phone: vehicle.customer.phone,
          }
        : undefined,
    };
  }
}
