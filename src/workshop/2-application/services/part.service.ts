import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PartRepository } from '../../4-infrastructure/repositories/part.repository';
import { CreatePartDto } from '../../1-presentation/dtos/part/create-part.dto';
import { UpdatePartDto } from '../../1-presentation/dtos/part/update-part.dto';
import { PartBase } from '../../3-domain/entities/part.entity';
import { ERROR_MESSAGES } from '../../../shared/constants/messages.constants';

@Injectable()
export class PartService {
  constructor(private readonly partRepository: PartRepository) {}

  async create(data: CreatePartDto): Promise<PartBase> {
    // Verificar se número da peça já existe (se fornecido)
    if (data.partNumber) {
      const existingPart = await this.partRepository.findByPartNumber(
        data.partNumber,
      );
      if (existingPart) {
        throw new ConflictException(ERROR_MESSAGES.PART_NUMBER_ALREADY_EXISTS);
      }
    }

    return this.partRepository.create({
      name: data.name,
      description: data.description ?? null,
      partNumber: data.partNumber ?? null,
      price: new Decimal(data.price),
      stock: data.stock,
      minStock: data.minStock,
      supplier: data.supplier ?? null,
      isActive: true,
    });
  }

  async findAll(filters?: {
    supplier?: string;
    active?: boolean;
    lowStock?: boolean;
  }): Promise<PartBase[]> {
    return this.partRepository.findAll(filters);
  }

  async findById(id: string): Promise<PartBase> {
    const part = await this.partRepository.findById(id);
    if (!part) {
      throw new NotFoundException(ERROR_MESSAGES.PART_NOT_FOUND);
    }
    return part;
  }

  async findByPartNumber(partNumber: string): Promise<PartBase> {
    const part = await this.partRepository.findByPartNumber(partNumber);
    if (!part) {
      throw new NotFoundException(ERROR_MESSAGES.PART_NOT_FOUND);
    }
    return part;
  }

  async findBySupplier(supplier: string): Promise<PartBase[]> {
    return this.partRepository.findBySupplier(supplier);
  }

  async findLowStock(): Promise<PartBase[]> {
    return this.partRepository.findLowStock();
  }

  async update(id: string, data: UpdatePartDto): Promise<PartBase> {
    const part = await this.partRepository.findById(id);
    if (!part) {
      throw new NotFoundException(ERROR_MESSAGES.PART_NOT_FOUND);
    }

    // Se está mudando o número da peça, verificar se não existe
    if (data.partNumber && data.partNumber !== part.partNumber) {
      const existingPart = await this.partRepository.findByPartNumber(
        data.partNumber,
      );
      if (existingPart && existingPart.id !== id) {
        throw new ConflictException(ERROR_MESSAGES.PART_NUMBER_ALREADY_EXISTS);
      }
    }

    const updateData = {
      name: data.name,
      description: data.description ?? null,
      partNumber: data.partNumber ?? null,
      price: data.price ? new Decimal(data.price) : undefined,
      stock: data.stock,
      minStock: data.minStock,
      supplier: data.supplier ?? null,
    };

    return this.partRepository.update(id, updateData);
  }

  async updateStock(id: string, quantity: number): Promise<PartBase> {
    const part = await this.partRepository.findById(id);
    if (!part) {
      throw new NotFoundException(ERROR_MESSAGES.PART_NOT_FOUND);
    }

    const newStock = part.stock + quantity;
    if (newStock < 0) {
      throw new ConflictException(ERROR_MESSAGES.INSUFFICIENT_STOCK);
    }

    return this.partRepository.update(id, { stock: newStock });
  }

  async remove(id: string): Promise<PartBase> {
    const part = await this.partRepository.findById(id);
    if (!part) {
      throw new NotFoundException(ERROR_MESSAGES.PART_NOT_FOUND);
    }

    // Soft delete - marca como inativo
    return this.partRepository.update(id, { isActive: false });
  }
}
