import { PrismaClient } from '@prisma/client';
import { VeterinaryVisit } from '@domain/entities/VeterinaryVisit';
import { IVeterinaryVisitRepository, CreateVeterinaryVisitData, UpdateVeterinaryVisitData } from '@domain/repositories/IVeterinaryVisitRepository';

export class PrismaVeterinaryVisitRepository implements IVeterinaryVisitRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateVeterinaryVisitData): Promise<VeterinaryVisit> {
    const visit = await this.prisma.veterinaryVisit.create({
      data: {
        petId: data.petId,
        date: data.date,
        type: data.type,
        veterinarianName: data.veterinarianName,
        clinicName: data.clinicName,
        reason: data.reason,
        diagnosis: data.diagnosis,
        treatment: data.treatment,
        prescriptions: data.prescriptions,
        examResults: data.examResults,
        cost: data.cost,
        nextVisitDate: data.nextVisitDate,
        observations: data.observations,
      },
    });

    return this.toDomain(visit);
  }

  async findById(id: string): Promise<VeterinaryVisit | null> {
    const visit = await this.prisma.veterinaryVisit.findUnique({
      where: { id },
    });

    return visit ? this.toDomain(visit) : null;
  }

  async findByPetId(petId: string): Promise<VeterinaryVisit[]> {
    const visits = await this.prisma.veterinaryVisit.findMany({
      where: { petId },
      orderBy: { date: 'desc' },
    });

    return visits.map((visit) => this.toDomain(visit));
  }

  async update(id: string, data: UpdateVeterinaryVisitData): Promise<VeterinaryVisit> {
    const visit = await this.prisma.veterinaryVisit.update({
      where: { id },
      data: {
        date: data.date,
        type: data.type,
        veterinarianName: data.veterinarianName,
        clinicName: data.clinicName,
        reason: data.reason,
        diagnosis: data.diagnosis,
        treatment: data.treatment,
        prescriptions: data.prescriptions,
        examResults: data.examResults,
        cost: data.cost,
        nextVisitDate: data.nextVisitDate,
        observations: data.observations,
      },
    });

    return this.toDomain(visit);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.veterinaryVisit.delete({
      where: { id },
    });
  }

  async findUpcomingVisits(petId: string): Promise<VeterinaryVisit[]> {
    const today = new Date();
    const visits = await this.prisma.veterinaryVisit.findMany({
      where: {
        petId,
        nextVisitDate: { gte: today },
      },
      orderBy: { nextVisitDate: 'asc' },
    });

    return visits.map((visit) => this.toDomain(visit));
  }

  private toDomain(visit: {
    id: string;
    petId: string;
    date: Date;
    type: string;
    veterinarianName: string;
    clinicName: string;
    reason: string;
    diagnosis: string | null;
    treatment: string | null;
    prescriptions: string | null;
    examResults: string | null;
    cost: number | null;
    nextVisitDate: Date | null;
    observations: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): VeterinaryVisit {
    return {
      id: visit.id,
      petId: visit.petId,
      date: visit.date,
      type: visit.type as VeterinaryVisit['type'],
      veterinarianName: visit.veterinarianName,
      clinicName: visit.clinicName,
      reason: visit.reason,
      diagnosis: visit.diagnosis ?? undefined,
      treatment: visit.treatment ?? undefined,
      prescriptions: visit.prescriptions ?? undefined,
      examResults: visit.examResults ?? undefined,
      cost: visit.cost ?? undefined,
      nextVisitDate: visit.nextVisitDate ?? undefined,
      observations: visit.observations ?? undefined,
      createdAt: visit.createdAt,
      updatedAt: visit.updatedAt,
    };
  }
}
