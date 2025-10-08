export interface VehicleBase {
  id: string;
  licensePlate: string;
  customerId: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleWithCustomer extends VehicleBase {
  customer?: {
    id: string;
    name: string;
    document: string;
    email: string;
    phone: string;
  };
}
