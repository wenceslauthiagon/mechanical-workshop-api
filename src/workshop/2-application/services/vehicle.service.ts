import { Injectable, HttpStatus, Inject } from '@nestjs/common';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';
import type { IVehicleRepository } from '../../3-domain/repositories/vehicle-repository.interface';
import type { ICustomerRepository } from '../../3-domain/repositories/customer-repository.interface';
import { CreateVehicleDto } from '../../1-presentation/dtos/vehicle/create-vehicle.dto';
import { UpdateVehicleDto } from '../../1-presentation/dtos/vehicle/update-vehicle.dto';
import { VehicleResponseDto } from '../../1-presentation/dtos/vehicle/vehicle-response.dto';
import type { Vehicle, Customer } from '@prisma/client';
import { ERROR_MESSAGES } from '../../../shared/constants/messages.constants';
import { PaginationDto, PaginatedResponseDto } from '../../../shared';

@Injectable()
export class VehicleService {
  constructor(
    @Inject('IVehicleRepository')
    private readonly vehicleRepository: IVehicleRepository,
    @Inject('ICustomerRepository')
    private readonly customerRepository: ICustomerRepository,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async create(data: CreateVehicleDto): Promise<VehicleResponseDto> {
    const customer = await this.customerRepository.findById(data.customerId);
    if (!customer) {
      this.errorHandler.generateException(
        ERROR_MESSAGES.CLIENT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const existingVehicle = await this.vehicleRepository.findByPlate(
      data.licensePlate,
    );
    if (existingVehicle) {
      this.errorHandler.generateException(
        ERROR_MESSAGES.LICENSE_PLATE_ALREADY_EXISTS,
        HttpStatus.CONFLICT,
      );
    }

    const vehicle = await this.vehicleRepository.create(data);
    // Fetch fresh customer data
    const freshCustomer = await this.customerRepository.findById(
      data.customerId,
    );
    return this.mapToResponseDto(vehicle, freshCustomer);
  }

  async findAll(): Promise<VehicleResponseDto[]> {
    const vehicles = await this.vehicleRepository.findAll();
    // Fetch fresh customer data for each vehicle
    const vehiclesWithCustomers = await Promise.all(
      vehicles.map(async (vehicle) => {
        const customer = await this.customerRepository.findById(
          vehicle.customerId,
        );
        return this.mapToResponseDto(vehicle, customer);
      }),
    );
    return vehiclesWithCustomers;
  }

  async findAllPaginated(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<VehicleResponseDto>> {
    const { skip, take, page = 0, size = 10 } = paginationDto;

    const [vehicles, total] = await Promise.all([
      this.vehicleRepository.findMany(skip, take),
      this.vehicleRepository.count(),
    ]);

    const vehiclesWithCustomers = await Promise.all(
      vehicles.map(async (vehicle) => {
        const customer = await this.customerRepository.findById(
          vehicle.customerId,
        );
        return this.mapToResponseDto(vehicle, customer);
      }),
    );

    return new PaginatedResponseDto(vehiclesWithCustomers, page, size, total);
  }

  async findById(id: string): Promise<VehicleResponseDto> {
    const vehicle = await this.vehicleRepository.findById(id);
    if (!vehicle) {
      this.errorHandler.handleNotFoundError(ERROR_MESSAGES.VEHICLE_NOT_FOUND);
    }
    // Fetch fresh customer data
    const customer = await this.customerRepository.findById(vehicle.customerId);
    return this.mapToResponseDto(vehicle, customer);
  }

  async findByCustomerId(customerId: string): Promise<VehicleResponseDto[]> {
    const vehicles = await this.vehicleRepository.findByCustomerId(customerId);
    // Fetch fresh customer data
    const customer = await this.customerRepository.findById(customerId);
    return vehicles.map((vehicle) => this.mapToResponseDto(vehicle, customer));
  }

  async findByLicensePlate(licensePlate: string): Promise<VehicleResponseDto> {
    const vehicle = await this.vehicleRepository.findByPlate(licensePlate);
    if (!vehicle) {
      this.errorHandler.handleNotFoundError(ERROR_MESSAGES.VEHICLE_NOT_FOUND);
    }
    // Fetch fresh customer data
    const customer = await this.customerRepository.findById(vehicle.customerId);
    return this.mapToResponseDto(vehicle, customer);
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
      const existingVehicle = await this.vehicleRepository.findByPlate(
        data.licensePlate,
      );
      if (existingVehicle) {
        this.errorHandler.handleConflictError(
          ERROR_MESSAGES.LICENSE_PLATE_ALREADY_EXISTS,
        );
      }
    }

    const updatedVehicle = await this.vehicleRepository.update(id, data);
    // Fetch fresh customer data
    const customer = await this.customerRepository.findById(
      updatedVehicle.customerId,
    );
    return this.mapToResponseDto(updatedVehicle, customer);
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

  private mapToResponseDto(
    vehicle: Vehicle,
    customer?: Customer | null,
  ): VehicleResponseDto {
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
      customer: customer
        ? {
            id: customer.id,
            name: customer.name,
            document: customer.document,
            email: customer.email,
            phone: customer.phone,
          }
        : undefined,
    };
  }
}
