import { PrismaClient } from '@prisma/client';
import { Vaccine } from '@domain/entities/Vaccine';
import { IVaccineRepository, CreateVaccineData, UpdateVaccineData } from '@domain/repositories/IVaccineRepository';

export class PrismaVaccineRepository implements IVaccineRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateVaccineData): Promise<Vaccine> {
    const vaccine = await this.prisma.vaccine.create({
      data: {
        petId: data.petId,
        name: data.name,
        description: data.description,
        scheduledDate: data.scheduledDate,
        applicationDate: data.applicationDate,
        nextDoseDate: data.nextDoseDate,
        veterinarianName: data.veterinarianName,
        clinicName: data.clinicName,
        batchNumber: data.batchNumber,
        status: data.status,
        observations: data.observations,
      },
    });

    return this.toDomain(vaccine);
  }

  async findById(id: string): Promise<Vaccine | null> {
    const vaccine = await this.prisma.vaccine.findUnique({
      where: { id },
    });

    return vaccine ? this.toDomain(vaccine) : null;
  }

  async findByPetId(petId: string): Promise<Vaccine[]> {
    const vaccines = await this.prisma.vaccine.findMany({
      where: { petId },
      orderBy: { scheduledDate: 'desc' },
    });

    return vaccines.map((vaccine) => this.toDomain(vaccine));
  }

  async update(id: string, data: UpdateVaccineData): Promise<Vaccine> {
    const vaccine = await this.prisma.vaccine.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        applicationDate: data.applicationDate,
        scheduledDate: data.scheduledDate,
        nextDoseDate: data.nextDoseDate,
        veterinarianName: data.veterinarianName,
        clinicName: data.clinicName,
        batchNumber: data.batchNumber,
        status: data.status,
        observations: data.observations,
      },
    });

    return this.toDomain(vaccine);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.vaccine.delete({
      where: { id },
    });
  }

  async findUpcoming(petId: string): Promise<Vaccine[]> {
    const today = new Date();
    const vaccines = await this.prisma.vaccine.findMany({
      where: {
        petId,
        scheduledDate: { gte: today },
        status: 'SCHEDULED',
      },
      orderBy: { scheduledDate: 'asc' },
    });

    return vaccines.map((vaccine) => this.toDomain(vaccine));
  }

  async findOverdue(petId: string): Promise<Vaccine[]> {
    const today = new Date();
    const vaccines = await this.prisma.vaccine.findMany({
      where: {
        petId,
        scheduledDate: { lt: today },
        status: 'SCHEDULED',
      },
      orderBy: { scheduledDate: 'asc' },
    });

    return vaccines.map((vaccine) => this.toDomain(vaccine));
  }

  private toDomain(vaccine: {
    id: string;
    petId: string;
    name: string;
    description: string | null;
    applicationDate: Date | null;
    scheduledDate: Date;
    nextDoseDate: Date | null;
    veterinarianName: string | null;
    clinicName: string | null;
    batchNumber: string | null;
    status: string;
    observations: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Vaccine {
    return {
      id: vaccine.id,
      petId: vaccine.petId,
      name: vaccine.name,
      description: vaccine.description ?? undefined,
      applicationDate: vaccine.applicationDate ?? undefined,
      scheduledDate: vaccine.scheduledDate,
      nextDoseDate: vaccine.nextDoseDate ?? undefined,
      veterinarianName: vaccine.veterinarianName ?? undefined,
      clinicName: vaccine.clinicName ?? undefined,
      batchNumber: vaccine.batchNumber ?? undefined,
      status: vaccine.status as Vaccine['status'],
      observations: vaccine.observations ?? undefined,
      createdAt: vaccine.createdAt,
      updatedAt: vaccine.updatedAt,
    };
  }
}
