import { v4 as uuidv4 } from 'uuid';

export class Vehicle {
  public readonly id: string;
  public readonly licensePlate: string;
  public readonly customerId: string;
  public brand: string;
  public model: string;
  public year: number;
  public color: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(
    licensePlate: string,
    customerId: string,
    brand: string,
    model: string,
    year: number,
    color: string,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    this.id = id || uuidv4();
    this.licensePlate = licensePlate.toUpperCase();
    this.customerId = customerId;
    this.brand = brand;
    this.model = model;
    this.year = year;
    this.color = color;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  public updateInfo(
    brand: string,
    model: string,
    year: number,
    color: string,
  ): void {
    this.brand = brand;
    this.model = model;
    this.year = year;
    this.color = color;
    this.updatedAt = new Date();
  }

  public static isValidLicensePlate(licensePlate: string): boolean {
    // Padrão brasileiro: ABC1234 ou ABC1D23
    const cleanPlate = licensePlate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const oldPattern = /^[A-Z]{3}[0-9]{4}$/; // ABC1234
    const mercosulPattern = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/; // ABC1D23

    return oldPattern.test(cleanPlate) || mercosulPattern.test(cleanPlate);
  }
}
