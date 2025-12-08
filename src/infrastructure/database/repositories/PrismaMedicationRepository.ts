import { PrismaClient } from '@prisma/client';
import { Medication } from '@domain/entities/Medication';
import { IMedicationRepository, CreateMedicationData, UpdateMedicationData } from '@domain/repositories/IMedicationRepository';

export class PrismaMedicationRepository implements IMedicationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateMedicationData): Promise<Medication> {
    const medication = await this.prisma.medication.create({
      data: {
        petId: data.petId,
        name: data.name,
        type: data.type as any,
        dosage: data.dosage,
        frequency: data.frequency,
        startDate: data.startDate,
        endDate: data.endDate,
        prescribedBy: data.prescribedBy,
        reason: data.reason,
        instructions: data.instructions,
        status: data.status,
        observations: data.observations,
      },
    });

    return this.toDomain(medication);
  }

  async findById(id: string): Promise<Medication | null> {
    const medication = await this.prisma.medication.findUnique({
      where: { id },
    });

    return medication ? this.toDomain(medication) : null;
  }

  async findByPetId(petId: string): Promise<Medication[]> {
    const medications = await this.prisma.medication.findMany({
      where: { petId },
      orderBy: { startDate: 'desc' },
    });

    return medications.map((medication) => this.toDomain(medication));
  }

  async findActiveMedications(petId: string): Promise<Medication[]> {
    const medications = await this.prisma.medication.findMany({
      where: {
        petId,
        status: 'ACTIVE',
      },
      orderBy: { startDate: 'desc' },
    });

    return medications.map((medication) => this.toDomain(medication));
  }

  async update(id: string, data: UpdateMedicationData): Promise<Medication> {
    const medication = await this.prisma.medication.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type as any,
        dosage: data.dosage,
        frequency: data.frequency,
        endDate: data.endDate,
        prescribedBy: data.prescribedBy,
        reason: data.reason,
        instructions: data.instructions,
        status: data.status,
        observations: data.observations,
      },
    });

    return this.toDomain(medication);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.medication.delete({
      where: { id },
    });
  }

  private toDomain(medication: {
    id: string;
    petId: string;
    name: string;
    type: string;
    dosage: string;
    frequency: string;
    startDate: Date;
    endDate: Date | null;
    prescribedBy: string | null;
    reason: string;
    instructions: string | null;
    status: string;
    observations: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Medication {
    return {
      id: medication.id,
      petId: medication.petId,
      name: medication.name,
      type: medication.type as Medication['type'],
      dosage: medication.dosage,
      frequency: medication.frequency as Medication['frequency'],
      startDate: medication.startDate,
      endDate: medication.endDate ?? undefined,
      prescribedBy: medication.prescribedBy ?? undefined,
      reason: medication.reason,
      instructions: medication.instructions ?? undefined,
      status: medication.status as Medication['status'],
      observations: medication.observations ?? undefined,
      createdAt: medication.createdAt,
      updatedAt: medication.updatedAt,
    };
  }
}
