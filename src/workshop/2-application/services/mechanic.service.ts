import { Injectable, Inject } from '@nestjs/common';
import type {
  IMechanicRepository,
  CreateMechanicData,
  UpdateMechanicData,
  MechanicWithStats,
} from '../../3-domain/repositories/mechanic.repository.interface';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';
import { MECHANIC_CONSTANTS } from '../../../shared/constants/mechanic.constants';
import { PaginationDto, PaginatedResponseDto } from '../../../shared';

@Injectable()
export class MechanicService {
  constructor(
    @Inject('IMechanicRepository')
    private readonly mechanicRepository: IMechanicRepository,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async create(data: CreateMechanicData): Promise<MechanicWithStats> {
    try {
      const existingMechanic = await this.mechanicRepository.findByEmail(
        data.email,
      );
      if (existingMechanic) {
        this.errorHandler.handleConflictError(
          MECHANIC_CONSTANTS.MESSAGES.EMAIL_ALREADY_EXISTS,
        );
      }

      const mechanic = await this.mechanicRepository.create(data);
      return (await this.mechanicRepository.findById(
        mechanic.id,
      )) as MechanicWithStats;
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async findAll(): Promise<MechanicWithStats[]> {
    try {
      return await this.mechanicRepository.findAll();
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async findAllPaginated(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<MechanicWithStats>> {
    try {
      const [mechanics, total] = await Promise.all([
        this.mechanicRepository.findMany(
          paginationDto.skip,
          paginationDto.take,
        ),
        this.mechanicRepository.count(),
      ]);

      return new PaginatedResponseDto(
        mechanics,
        paginationDto.page || 0,
        paginationDto.size || 10,
        total,
      );
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async findById(id: string): Promise<MechanicWithStats> {
    try {
      const mechanic = await this.mechanicRepository.findById(id);
      if (!mechanic) {
        this.errorHandler.handleNotFoundError(
          MECHANIC_CONSTANTS.MESSAGES.NOT_FOUND,
        );
      }
      return mechanic;
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async findAvailable(): Promise<MechanicWithStats[]> {
    try {
      return await this.mechanicRepository.findAvailable();
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async findBySpecialty(specialty: string): Promise<MechanicWithStats[]> {
    try {
      return await this.mechanicRepository.findBySpecialty(specialty);
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async update(
    id: string,
    data: UpdateMechanicData,
  ): Promise<MechanicWithStats> {
    try {
      await this.findById(id);

      if (data.email) {
        const existingMechanic = await this.mechanicRepository.findByEmail(
          data.email,
        );
        if (existingMechanic && existingMechanic.id !== id) {
          this.errorHandler.handleConflictError(
            MECHANIC_CONSTANTS.MESSAGES.EMAIL_ALREADY_EXISTS,
          );
        }
      }

      const updatedMechanic = await this.mechanicRepository.update(id, data);
      return (await this.mechanicRepository.findById(
        updatedMechanic.id,
      )) as MechanicWithStats;
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async toggleAvailability(id: string): Promise<MechanicWithStats> {
    try {
      await this.findById(id);

      const updatedMechanic =
        await this.mechanicRepository.toggleAvailability(id);
      return (await this.mechanicRepository.findById(
        updatedMechanic.id,
      )) as MechanicWithStats;
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.findById(id);
      await this.mechanicRepository.delete(id);
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async getWorkload(mechanicId: string): Promise<{
    activeOrders: number;
    completedThisMonth: number;
    averageCompletionTime: number;
  }> {
    try {
      await this.findById(mechanicId);
      return await this.mechanicRepository.getWorkload(mechanicId);
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async assignToServiceOrder(
    mechanicId: string,
    serviceOrderId: string,
  ): Promise<void> {
    try {
      const mechanic = await this.findById(mechanicId);
      if (!mechanic.isAvailable) {
        this.errorHandler.handleConflictError(
          MECHANIC_CONSTANTS.MESSAGES.NOT_AVAILABLE,
        );
      }

      await this.mechanicRepository.assignToServiceOrder(
        mechanicId,
        serviceOrderId,
      );
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async markAsUnavailable(mechanicId: string): Promise<void> {
    try {
      await this.findById(mechanicId);
      await this.mechanicRepository.markAsUnavailable(mechanicId);
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async releaseFromServiceOrder(mechanicId: string): Promise<void> {
    try {
      await this.findById(mechanicId);
      await this.mechanicRepository.releaseFromServiceOrder(mechanicId);
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async findBestMechanicForService(
    requiredSpecialties: string[],
  ): Promise<MechanicWithStats | null> {
    try {
      const allMechanics = await this.findAll();

      const availableMechanics = allMechanics.filter(
        (mechanic) =>
          mechanic.isAvailable &&
          requiredSpecialties.every((specialty) =>
            mechanic.specialties.includes(specialty),
          ),
      );

      if (availableMechanics.length === 0) {
        return null;
      }

      const mechanicsWithWorkload = await Promise.all(
        availableMechanics.map(async (mechanic) => ({
          ...mechanic,
          workload: (await this.mechanicRepository.getWorkload(mechanic.id))
            .activeOrders,
        })),
      );

      return mechanicsWithWorkload.sort((a, b) => a.workload - b.workload)[0];
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }
}
