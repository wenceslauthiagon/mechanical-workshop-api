import { CustomerType } from '@prisma/client';

export interface CustomerBase {
  id: string;
  document: string;
  type: CustomerType;
  name: string;
  email: string;
  phone: string;
  address: string;
  additionalInfo: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerWithVehicles extends CustomerBase {
  vehicles?: {
    id: string;
    licensePlate: string;
    brand: string;
    model: string;
    year: number;
    color: string;
  }[];
}
