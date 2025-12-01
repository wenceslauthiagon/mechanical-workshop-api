import { IAuthRepository } from '@domain/repositories/IAuthRepository';
import { Owner } from '@domain/entities/Owner';
import { prisma } from '@infrastructure/database/prisma';

export class AuthRepository implements IAuthRepository {
  async findByEmail(email: string): Promise<Owner | null> {
    const owner = await prisma.owner.findUnique({
      where: { email },
    });

    if (!owner) return null;

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

  async register(owner: Owner, hashedPassword: string): Promise<Owner> {
    const created = await prisma.owner.create({
      data: {
        id: owner.id,
        name: owner.name,
        email: owner.email,
        password: hashedPassword,
        phone: owner.phone,
        address: owner.address,
      },
    });

    return {
      id: created.id,
      name: created.name,
      email: created.email,
      phone: created.phone,
      address: created.address ?? undefined,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }
}
