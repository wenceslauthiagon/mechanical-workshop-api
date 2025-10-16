import { Injectable } from '@nestjs/common';
import { MECHANIC_CONSTANTS } from '../../../shared/constants/mechanic.constants';
import {
  IMechanicRepository,
  CreateMechanicData,
  UpdateMechanicData,
  MechanicWithStats,
  Mechanic,
} from '../../3-domain/repositories/mechanic.repository.interface';

interface DateProvider {
  now(): Date;
}

class DefaultDateProvider implements DateProvider {
  now(): Date {
    return new Date();
  }
}

@Injectable()
export class MechanicRepository implements IMechanicRepository {
  private mechanics: Mechanic[] = [];
  private dateProvider: DateProvider = new DefaultDateProvider();
  private readonly ID_PREFIX = 'mech';
  private readonly RANDOM_ID_LENGTH = 9;

  private generateId(): string {
    const timestamp = Date.now();
    const randomString = Math.random()
      .toString(36)
      .substring(2, 2 + this.RANDOM_ID_LENGTH);
    return `${this.ID_PREFIX}_${timestamp}_${randomString}`;
  }

  private getCurrentTimestamp(): Date {
    return this.dateProvider.now();
  }

  async create(data: CreateMechanicData): Promise<Mechanic> {
    const currentTime = this.getCurrentTimestamp();
    const mechanic: Mechanic = {
      id: this.generateId(),
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      specialties: data.specialties,
      experienceYears:
        data.experienceYears ||
        MECHANIC_CONSTANTS.DEFAULT_VALUES.EXPERIENCE_YEARS,
      isActive: MECHANIC_CONSTANTS.DEFAULT_VALUES.IS_ACTIVE,
      isAvailable: MECHANIC_CONSTANTS.DEFAULT_VALUES.IS_AVAILABLE,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
    this.mechanics.push(mechanic);
    return mechanic;
  }

  async findAll(): Promise<MechanicWithStats[]> {
    return this.mechanics.map((mechanic) => ({
      ...mechanic,
      activeServiceOrders: MECHANIC_CONSTANTS.DEFAULT_VALUES.ACTIVE_ORDERS,
      completedServiceOrders:
        MECHANIC_CONSTANTS.DEFAULT_VALUES.COMPLETED_ORDERS,
    }));
  }

  async findById(id: string): Promise<MechanicWithStats | null> {
    const mechanic = this.mechanics.find((m) => m.id === id);
    if (!mechanic) return null;

    return {
      ...mechanic,
      activeServiceOrders: MECHANIC_CONSTANTS.DEFAULT_VALUES.ACTIVE_ORDERS,
      completedServiceOrders:
        MECHANIC_CONSTANTS.DEFAULT_VALUES.COMPLETED_ORDERS,
    };
  }

  async findByEmail(email: string): Promise<Mechanic | null> {
    return this.mechanics.find((m) => m.email === email) || null;
  }

  async findAvailable(): Promise<MechanicWithStats[]> {
    return this.mechanics
      .filter((m) => m.isActive && m.isAvailable)
      .map((mechanic) => ({
        ...mechanic,
        activeServiceOrders: MECHANIC_CONSTANTS.DEFAULT_VALUES.ACTIVE_ORDERS,
        completedServiceOrders:
          MECHANIC_CONSTANTS.DEFAULT_VALUES.COMPLETED_ORDERS,
      }));
  }

  async findBySpecialty(specialty: string): Promise<MechanicWithStats[]> {
    return this.mechanics
      .filter((m) => m.isActive && m.specialties.includes(specialty))
      .map((mechanic) => ({
        ...mechanic,
        activeServiceOrders: MECHANIC_CONSTANTS.DEFAULT_VALUES.ACTIVE_ORDERS,
        completedServiceOrders:
          MECHANIC_CONSTANTS.DEFAULT_VALUES.COMPLETED_ORDERS,
      }));
  }

  async update(id: string, data: UpdateMechanicData): Promise<Mechanic> {
    const mechanicIndex = this.mechanics.findIndex((m) => m.id === id);
    if (mechanicIndex === -1) {
      throw new Error(MECHANIC_CONSTANTS.MESSAGES.NOT_FOUND);
    }

    const mechanic = this.mechanics[mechanicIndex];
    this.mechanics[mechanicIndex] = {
      ...mechanic,
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.specialties && { specialties: data.specialties }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
      ...(data.experienceYears !== undefined && {
        experienceYears: data.experienceYears,
      }),
      updatedAt: this.getCurrentTimestamp(),
    };

    return this.mechanics[mechanicIndex];
  }

  async toggleAvailability(id: string): Promise<Mechanic> {
    const mechanicIndex = this.mechanics.findIndex((m) => m.id === id);
    if (mechanicIndex === -1) {
      throw new Error(MECHANIC_CONSTANTS.MESSAGES.NOT_FOUND);
    }

    this.mechanics[mechanicIndex] = {
      ...this.mechanics[mechanicIndex],
      isAvailable: !this.mechanics[mechanicIndex].isAvailable,
      updatedAt: this.getCurrentTimestamp(),
    };

    return this.mechanics[mechanicIndex];
  }

  async delete(id: string): Promise<Mechanic> {
    const mechanicIndex = this.mechanics.findIndex((m) => m.id === id);
    if (mechanicIndex === -1) {
      throw new Error(MECHANIC_CONSTANTS.MESSAGES.NOT_FOUND);
    }

    this.mechanics[mechanicIndex] = {
      ...this.mechanics[mechanicIndex],
      isActive: false,
      updatedAt: this.getCurrentTimestamp(),
    };

    return this.mechanics[mechanicIndex];
  }

  async getWorkload(mechanicId: string): Promise<{
    activeOrders: number;
    completedThisMonth: number;
    averageCompletionTime: number;
  }> {
    const mechanic = this.mechanics.find((m) => m.id === mechanicId);
    if (!mechanic) {
      throw new Error(MECHANIC_CONSTANTS.MESSAGES.NOT_FOUND);
    }

    return {
      activeOrders: MECHANIC_CONSTANTS.DEFAULT_VALUES.ACTIVE_ORDERS,
      completedThisMonth: MECHANIC_CONSTANTS.DEFAULT_VALUES.COMPLETED_ORDERS,
      averageCompletionTime:
        MECHANIC_CONSTANTS.DEFAULT_VALUES.AVERAGE_COMPLETION_TIME,
    };
  }

  async assignToServiceOrder(mechanicId: string): Promise<void> {
    const mechanicIndex = this.mechanics.findIndex((m) => m.id === mechanicId);
    if (mechanicIndex === -1) {
      throw new Error(MECHANIC_CONSTANTS.MESSAGES.NOT_FOUND);
    }

    const mechanic = this.mechanics[mechanicIndex];
    if (!mechanic.isAvailable) {
      throw new Error(MECHANIC_CONSTANTS.MESSAGES.NOT_AVAILABLE);
    }

    // Marcar mecânico como ocupado e associado à OS
    this.mechanics[mechanicIndex] = {
      ...mechanic,
      isAvailable: false,
      updatedAt: this.getCurrentTimestamp(),
    };
  }
}
