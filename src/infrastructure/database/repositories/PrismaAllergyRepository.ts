import { PrismaClient } from '@prisma/client';
import { Allergy } from '@domain/entities/Allergy';
import { IAllergyRepository } from '@domain/repositories/IAllergyRepository';

export class PrismaAllergyRepository implements IAllergyRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(allergy: Omit<Allergy, 'id' | 'createdAt' | 'updatedAt'>): Promise<Allergy> {
    const created = await this.prisma.allergy.create({
      data: allergy,
    });
    return this.toDomain(created);
  }

  async findById(id: string): Promise<Allergy | null> {
    const allergy = await this.prisma.allergy.findUnique({
      where: { id },
    });
    return allergy ? this.toDomain(allergy) : null;
  }

  async findByPetId(petId: string): Promise<Allergy[]> {
    const allergies = await this.prisma.allergy.findMany({
      where: { petId },
      orderBy: { severity: 'desc' },
    });
    return allergies.map(this.toDomain);
  }

  async findSevereAllergiesByPetId(petId: string): Promise<Allergy[]> {
    const allergies = await this.prisma.allergy.findMany({
      where: {
        petId,
        severity: {
          in: ['SEVERE', 'LIFE_THREATENING'],
        },
      },
      orderBy: { severity: 'desc' },
    });
    return allergies.map(this.toDomain);
  }

  async update(id: string, data: Partial<Allergy>): Promise<Allergy> {
    const updated = await this.prisma.allergy.update({
      where: { id },
      data,
    });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.allergy.delete({
      where: { id },
    });
  }

  private toDomain(prismaAllergy: any): Allergy {
    return {
      id: prismaAllergy.id,
      petId: prismaAllergy.petId,
      allergen: prismaAllergy.allergen,
      type: prismaAllergy.type,
      severity: prismaAllergy.severity,
      symptoms: prismaAllergy.symptoms,
      diagnosedDate: prismaAllergy.diagnosedDate,
      diagnosedBy: prismaAllergy.diagnosedBy,
      notes: prismaAllergy.notes,
      createdAt: prismaAllergy.createdAt,
      updatedAt: prismaAllergy.updatedAt,
    };
  }
}
