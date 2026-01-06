import { Vehicle } from '@prisma/client';

export interface IVehicleRepository {
  create(
    data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Vehicle>;
  findAll(): Promise<Vehicle[]>;
  findMany(skip: number, take: number): Promise<Vehicle[]>;
  count(): Promise<number>;
  findById(id: string): Promise<Vehicle | null>;
  findByPlate(plate: string): Promise<Vehicle | null>;
  findByCustomerId(customerId: string): Promise<Vehicle[]>;
  hasServiceOrders(vehicleId: string): Promise<boolean>;
  update(
    id: string,
    data: Partial<Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Vehicle>;
  delete(id: string): Promise<void>;
}
