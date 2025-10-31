import { Injectable, Inject } from '@nestjs/common';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';
import { Decimal } from '@prisma/client/runtime/library';
import type { IServiceRepository } from '../../3-domain/repositories/service-repository.interface';
import { CreateServiceDto } from '../../1-presentation/dtos/service/create-service.dto';
import { UpdateServiceDto } from '../../1-presentation/dtos/service/update-service.dto';
import { ServiceBase } from '../../3-domain/entities/service.entity';
import { ERROR_MESSAGES } from '../../../shared/constants/messages.constants';
import { PaginationDto, PaginatedResponseDto } from '../../../shared';

@Injectable()
export class ServiceService {
  constructor(
    @Inject('IServiceRepository')
    private readonly serviceRepository: IServiceRepository,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async create(data: CreateServiceDto): Promise<ServiceBase> {
    const existingService = await this.serviceRepository.findByName(data.name);
    if (existingService) {
      this.errorHandler.handleConflictError(
        ERROR_MESSAGES.SERVICE_NAME_ALREADY_EXISTS,
      );
    }

    return this.serviceRepository.create({
      name: data.name,
      description: data.description ?? null,
      price: new Decimal(data.price),
      category: data.category,
      estimatedMinutes: data.estimatedMinutes,
      isActive: data.isActive ?? true,
    });
  }

  async findAll(filters?: {
    category?: string;
    active?: boolean;
  }): Promise<ServiceBase[]> {
    return this.serviceRepository.findAll(filters);
  }

  async findAllPaginated(
    paginationDto: PaginationDto,
    filters?: {
      category?: string;
      active?: boolean;
    },
  ): Promise<PaginatedResponseDto<ServiceBase>> {
    const [services, total] = await Promise.all([
      this.serviceRepository.findMany(
        paginationDto.skip,
        paginationDto.take,
        filters,
      ),
      this.serviceRepository.count(filters),
    ]);

    return new PaginatedResponseDto(
      services,
      paginationDto.page || 0,
      paginationDto.size || 10,
      total,
    );
  }

  async findById(id: string): Promise<ServiceBase> {
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      this.errorHandler.handleNotFoundError(ERROR_MESSAGES.SERVICE_NOT_FOUND);
    }
    return service;
  }

  async findByCategory(category: string): Promise<ServiceBase[]> {
    return this.serviceRepository.findByCategory(category);
  }

  async update(id: string, data: UpdateServiceDto): Promise<ServiceBase> {
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      this.errorHandler.handleNotFoundError(ERROR_MESSAGES.SERVICE_NOT_FOUND);
    }

    if (data.name && service.name !== data.name) {
      const existingService = await this.serviceRepository.findByName(
        data.name,
      );
      if (existingService && existingService.id !== id) {
        this.errorHandler.handleConflictError(
          ERROR_MESSAGES.SERVICE_NAME_ALREADY_EXISTS,
        );
      }
    }

    const updateData = {
      name: data.name,
      description: data.description ?? null,
      price: data.price ? new Decimal(data.price) : undefined,
      category: data.category,
      estimatedMinutes: data.estimatedMinutes,
      isActive: data.isActive,
    };

    return this.serviceRepository.update(id, updateData);
  }

  async remove(id: string): Promise<ServiceBase> {
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      this.errorHandler.handleNotFoundError(ERROR_MESSAGES.SERVICE_NOT_FOUND);
    }

    const updatedService = await this.serviceRepository.update(id, {
      isActive: false,
    });

    return updatedService;
  }
}
