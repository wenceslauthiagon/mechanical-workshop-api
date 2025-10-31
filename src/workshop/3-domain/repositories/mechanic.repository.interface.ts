// Definição local do tipo Mechanic (será substituído quando Prisma gerar)
export interface Mechanic {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  specialties: string[];
  experienceYears: number;
  isActive: boolean;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MechanicWithStats extends Mechanic {
  activeServiceOrders?: number;
  completedServiceOrders?: number;
}

export interface CreateMechanicData {
  name: string;
  email: string;
  phone?: string;
  specialties: string[];
  experienceYears?: number;
}

export interface UpdateMechanicData {
  name?: string;
  email?: string;
  phone?: string;
  specialties?: string[];
  isActive?: boolean;
  isAvailable?: boolean;
  experienceYears?: number;
}

export interface IMechanicRepository {
  create(data: CreateMechanicData): Promise<Mechanic>;

  findAll(): Promise<MechanicWithStats[]>;

  findMany(skip: number, take: number): Promise<MechanicWithStats[]>;

  count(): Promise<number>;

  findById(id: string): Promise<MechanicWithStats | null>;

  findByEmail(email: string): Promise<Mechanic | null>;

  findAvailable(): Promise<MechanicWithStats[]>;

  findBySpecialty(specialty: string): Promise<MechanicWithStats[]>;

  update(id: string, data: UpdateMechanicData): Promise<Mechanic>;

  toggleAvailability(id: string): Promise<Mechanic>;

  delete(id: string): Promise<Mechanic>;

  getWorkload(mechanicId: string): Promise<{
    activeOrders: number;
    completedThisMonth: number;
    averageCompletionTime: number;
  }>;

  assignToServiceOrder(
    mechanicId: string,
    serviceOrderId?: string,
  ): Promise<void>;

  markAsUnavailable(mechanicId: string): Promise<void>;

  releaseFromServiceOrder(mechanicId: string): Promise<void>;
}
