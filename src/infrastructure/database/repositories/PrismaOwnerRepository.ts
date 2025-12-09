import { PrismaClient } from '@prisma/client';
import { Owner } from '@domain/entities/Owner';
import { IOwnerRepository, CreateOwnerData, UpdateOwnerData } from '@domain/repositories/IOwnerRepository';

export class PrismaOwnerRepository implements IOwnerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateOwnerData): Promise<Owner> {
    const owner = await this.prisma.owner.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      },
    });

    return this.toDomain(owner);
  }

  async findById(id: string): Promise<Owner | null> {
    const owner = await this.prisma.owner.findUnique({
      where: { id },
    });

    return owner ? this.toDomain(owner) : null;
  }

  async findByEmail(email: string): Promise<Owner | null> {
    const owner = await this.prisma.owner.findUnique({
      where: { email },
    });

    return owner ? this.toDomain(owner) : null;
  }

  async update(id: string, data: UpdateOwnerData): Promise<Owner> {
    const owner = await this.prisma.owner.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      },
    });

    return this.toDomain(owner);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.owner.delete({
      where: { id },
    });
  }

  async findAll(): Promise<Owner[]> {
    const owners = await this.prisma.owner.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return owners.map((owner) => this.toDomain(owner));
  }

  private toDomain(owner: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Owner {
    return {
      id: owner.id,
      name: owner.name,
      email: owner.email,
      phone: owner.phone,
      address: owner.address ?? undefined,
      createdAt: owner.createdAt,
      updatedAt: owner.updatedAt,
    };
  }
}
