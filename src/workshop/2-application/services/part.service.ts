import { Injectable, Inject } from '@nestjs/common';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';
import { Decimal } from '@prisma/client/runtime/library';
import type { IPartRepository } from '../../3-domain/repositories/part-repository.interface';
import { CreatePartDto } from '../../1-presentation/dtos/part/create-part.dto';
import { UpdatePartDto } from '../../1-presentation/dtos/part/update-part.dto';
import { PartBase } from '../../3-domain/entities/part.entity';
import { ERROR_MESSAGES } from '../../../shared/constants/messages.constants';
import { PaginationDto, PaginatedResponseDto } from '../../../shared';

@Injectable()
export class PartService {
  constructor(
    @Inject('IPartRepository')
    private readonly partRepository: IPartRepository,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async create(data: CreatePartDto): Promise<PartBase> {
    if (data.partNumber) {
      const existingPart = await this.partRepository.findByPartNumber(
        data.partNumber,
      );
      if (existingPart) {
        this.errorHandler.handleConflictError(
          ERROR_MESSAGES.PART_NUMBER_ALREADY_EXISTS,
        );
      }
    }

    const partFromDb = await this.partRepository.create({
      name: data.name,
      description: data.description ?? null,
      partNumber: data.partNumber ?? null,
      price: new Decimal(data.price),
      stock: data.stock,
      minStock: data.minStock,
      supplier: data.supplier ?? null,
      isActive: true,
    });
    
    return {
      ...partFromDb,
      description: partFromDb.description ?? undefined,
      supplier: partFromDb.supplier ?? undefined,
    } as PartBase;
  }

  async findAll(filters?: {
    supplier?: string;
    active?: boolean;
    lowStock?: boolean;
  }): Promise<PartBase[]> {
    const parts = await this.partRepository.findAll(filters);
    return parts.map(part => ({
      ...part,
      description: part.description ?? undefined,
      supplier: part.supplier ?? undefined,
    }));
  }

  async findAllPaginated(
    paginationDto: PaginationDto,
    filters?: {
      supplier?: string;
      active?: boolean;
      lowStock?: boolean;
    },
  ): Promise<PaginatedResponseDto<PartBase>> {
    const [parts, total] = await Promise.all([
      this.partRepository.findMany(
        paginationDto.skip,
        paginationDto.take,
        filters,
      ),
      this.partRepository.count(filters),
    ]);

    const mappedParts = parts.map(part => ({
      ...part,
      description: part.description ?? undefined,
      supplier: part.supplier ?? undefined,
    }));

    return new PaginatedResponseDto(
      mappedParts,
      paginationDto.page || 0,
      paginationDto.size || 10,
      total,
    );
  }

  async findById(id: string): Promise<PartBase> {
    const part = await this.partRepository.findById(id);
    if (!part) {
      this.errorHandler.handleNotFoundError(ERROR_MESSAGES.PART_NOT_FOUND);
    }
    return {
      ...part,
      description: part.description ?? undefined,
      supplier: part.supplier ?? undefined,
    };
  }

  async findByPartNumber(partNumber: string): Promise<PartBase> {
    const part = await this.partRepository.findByPartNumber(partNumber);
    if (!part) {
      this.errorHandler.handleNotFoundError(ERROR_MESSAGES.PART_NOT_FOUND);
    }
    return {
      ...part,
      description: part.description ?? undefined,
      supplier: part.supplier ?? undefined,
    };
  }

  async findBySupplier(supplier: string): Promise<PartBase[]> {
    const parts = await this.partRepository.findBySupplier(supplier);
    return parts.map(part => ({
      ...part,
      description: part.description ?? undefined,
      supplier: part.supplier ?? undefined,
    }));
  }

  async findLowStock(): Promise<PartBase[]> {
    const parts = await this.partRepository.findLowStock();
    return parts.map(part => ({
      ...part,
      description: part.description ?? undefined,
      supplier: part.supplier ?? undefined,
    }));
  }

  async update(id: string, data: UpdatePartDto): Promise<PartBase> {
    const part = await this.partRepository.findById(id);
    if (!part) {
      this.errorHandler.handleNotFoundError(ERROR_MESSAGES.PART_NOT_FOUND);
    }

    if (data.partNumber && data.partNumber !== part.partNumber) {
      const existingPart = await this.partRepository.findByPartNumber(
        data.partNumber,
      );
      if (existingPart && existingPart.id !== id) {
        this.errorHandler.handleConflictError(
          ERROR_MESSAGES.PART_NUMBER_ALREADY_EXISTS,
        );
      }
    }

    // Only include fields that are present in the PATCH request
    const updateData: any = {};
    if (Object.prototype.hasOwnProperty.call(data, 'name')) {
      updateData.name = data.name;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'description')) {
      updateData.description = data.description;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'partNumber')) {
      updateData.partNumber = data.partNumber;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'price') && data.price) {
      updateData.price = new Decimal(data.price);
    }
    if (Object.prototype.hasOwnProperty.call(data, 'stock')) {
      updateData.stock = data.stock;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'minStock')) {
      updateData.minStock = data.minStock;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'supplier')) {
      updateData.supplier = data.supplier;
    }

    const updatedPart = await this.partRepository.update(id, updateData);
    return {
      ...updatedPart,
      description: updatedPart.description ?? undefined,
      supplier: updatedPart.supplier ?? undefined,
    };
  }

  async updateStock(id: string, quantity: number): Promise<PartBase> {
    const part = await this.partRepository.findById(id);
    if (!part) {
      this.errorHandler.handleNotFoundError(ERROR_MESSAGES.PART_NOT_FOUND);
    }

    const newStock = part.stock + quantity;
    if (newStock < 0) {
      this.errorHandler.handleConflictError(ERROR_MESSAGES.INSUFFICIENT_STOCK);
    }

    const updatedPart = await this.partRepository.update(id, { stock: newStock });
    return {
      ...updatedPart,
      description: updatedPart.description ?? undefined,
      supplier: updatedPart.supplier ?? undefined,
    };
  }

  async remove(id: string): Promise<PartBase> {
    const part = await this.partRepository.findById(id);
    if (!part) {
      this.errorHandler.handleNotFoundError(ERROR_MESSAGES.PART_NOT_FOUND);
    }

    const updatedPart = await this.partRepository.update(id, { isActive: false });
    return {
      ...updatedPart,
      description: updatedPart.description ?? undefined,
      supplier: updatedPart.supplier ?? undefined,
    };
  }
}
