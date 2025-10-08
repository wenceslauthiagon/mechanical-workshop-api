import { v4 as uuidv4 } from 'uuid';

export class ServiceType {
  public readonly id: string;
  public name: string;
  public description: string;
  public estimatedTimeHours: number;
  public price: number;
  public isActive: boolean;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(
    name: string,
    description: string,
    estimatedTimeHours: number,
    price: number,
    id?: string,
    isActive?: boolean,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    this.id = id || uuidv4();
    this.name = name;
    this.description = description;
    this.estimatedTimeHours = estimatedTimeHours;
    this.price = price;
    this.isActive = isActive !== undefined ? isActive : true;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  public updateInfo(
    name: string,
    description: string,
    estimatedTimeHours: number,
    price: number,
  ): void {
    this.name = name;
    this.description = description;
    this.estimatedTimeHours = estimatedTimeHours;
    this.price = price;
    this.updatedAt = new Date();
  }

  public activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  public deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }
}
