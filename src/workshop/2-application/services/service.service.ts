import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { ServiceRepository } from '../../4-infrastructure/repositories/service.repository';
import { CreateServiceDto } from '../../1-presentation/dtos/service/create-service.dto';
import { UpdateServiceDto } from '../../1-presentation/dtos/service/update-service.dto';
import { ServiceBase } from '../../3-domain/entities/service.entity';

@Injectable()
export class ServiceService {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  async create(data: CreateServiceDto): Promise<ServiceBase> {
    // Verificar se serviço com mesmo nome já existe
    const existingService = await this.serviceRepository.findByName(data.name);
    if (existingService) {
      throw new ConflictException('Serviço com este nome já existe');
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

  async findById(id: string): Promise<ServiceBase> {
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }
    return service;
  }

  async findByCategory(category: string): Promise<ServiceBase[]> {
    return this.serviceRepository.findByCategory(category);
  }

  async update(id: string, data: UpdateServiceDto): Promise<ServiceBase> {
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }

    // Se está mudando o nome, verificar se não existe outro com mesmo nome
    if (data.name && data.name !== service.name) {
      const existingService = await this.serviceRepository.findByName(
        data.name,
      );
      if (existingService && existingService.id !== id) {
        throw new ConflictException('Serviço com este nome já existe');
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
      throw new NotFoundException('Serviço não encontrado');
    }

    // Soft delete - marca como inativo
    return this.serviceRepository.update(id, { isActive: false });
  }
}
