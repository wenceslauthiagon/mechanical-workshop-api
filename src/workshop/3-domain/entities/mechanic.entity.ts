export interface MechanicEntity {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialties: string[];
  isActive: boolean;
  isAvailable: boolean;
  experienceYears: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Mechanic implements MechanicEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly specialties: string[],
    public readonly isActive: boolean = true,
    public readonly isAvailable: boolean = true,
    public readonly experienceYears: number = 0,
    public readonly phone?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  static create(data: {
    name: string;
    email: string;
    phone?: string;
    specialties: string[];
    experienceYears?: number;
  }): Omit<MechanicEntity, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      name: data.name,
      email: data.email,
      phone: data.phone,
      specialties: data.specialties,
      isActive: true,
      isAvailable: true,
      experienceYears: data.experienceYears || 0,
    };
  }

  public toggleAvailability(): Mechanic {
    return new Mechanic(
      this.id,
      this.name,
      this.email,
      this.specialties,
      this.isActive,
      !this.isAvailable,
      this.experienceYears,
      this.phone,
      this.createdAt,
      new Date(),
    );
  }

  public updateSpecialties(newSpecialties: string[]): Mechanic {
    return new Mechanic(
      this.id,
      this.name,
      this.email,
      newSpecialties,
      this.isActive,
      this.isAvailable,
      this.experienceYears,
      this.phone,
      this.createdAt,
      new Date(),
    );
  }

  public hasSpecialty(specialty: string): boolean {
    return this.specialties.includes(specialty);
  }

  public isQualifiedFor(requiredSpecialties: string[]): boolean {
    return requiredSpecialties.some((required) => this.hasSpecialty(required));
  }
}
