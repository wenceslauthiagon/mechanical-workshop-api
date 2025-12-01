import { PrismaClient } from '@prisma/client';
import { Pet } from '@domain/entities/Pet';
import { IPetRepository, CreatePetData, UpdatePetData } from '@domain/repositories/IPetRepository';

export class PrismaPetRepository implements IPetRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreatePetData): Promise<Pet> {
    const pet = await this.prisma.pet.create({
      data: {
        name: data.name,
        type: data.type,
        breed: data.breed,
        gender: data.gender,
        birthDate: data.birthDate,
        weight: data.weight,
        color: data.color,
        microchipNumber: data.microchipNumber,
        ownerId: data.ownerId,
      },
    });

    return this.toDomain(pet);
  }

  async findById(id: string): Promise<Pet | null> {
    const pet = await this.prisma.pet.findUnique({
      where: { id },
    });

    return pet ? this.toDomain(pet) : null;
  }

  async findByOwnerId(ownerId: string): Promise<Pet[]> {
    const pets = await this.prisma.pet.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });

    return pets.map((pet) => this.toDomain(pet));
  }

  async update(id: string, data: UpdatePetData): Promise<Pet> {
    const pet = await this.prisma.pet.update({
      where: { id },
      data: {
        name: data.name,
        breed: data.breed,
        weight: data.weight,
        color: data.color,
        microchipNumber: data.microchipNumber,
      },
    });

    return this.toDomain(pet);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.pet.delete({
      where: { id },
    });
  }

  async findAll(): Promise<Pet[]> {
    const pets = await this.prisma.pet.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return pets.map((pet) => this.toDomain(pet));
  }

  private toDomain(pet: {
    id: string;
    name: string;
    type: string;
    breed: string;
    gender: string;
    birthDate: Date;
    weight: number;
    color: string;
    microchipNumber: string | null;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
  }): Pet {
    return {
      id: pet.id,
      name: pet.name,
      type: pet.type as Pet['type'],
      breed: pet.breed,
      gender: pet.gender as Pet['gender'],
      birthDate: pet.birthDate,
      weight: pet.weight,
      color: pet.color,
      microchipNumber: pet.microchipNumber ?? undefined,
      ownerId: pet.ownerId,
      createdAt: pet.createdAt,
      updatedAt: pet.updatedAt,
    };
  }
}
