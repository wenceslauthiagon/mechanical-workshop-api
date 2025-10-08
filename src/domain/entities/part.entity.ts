import { v4 as uuidv4 } from 'uuid';

export class Part {
  public readonly id: string;
  public name: string;
  public partNumber: string;
  public description: string;
  public price: number;
  public stockQuantity: number;
  public minStockLevel: number;
  public isActive: boolean;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(
    name: string,
    partNumber: string,
    description: string,
    price: number,
    stockQuantity: number,
    minStockLevel: number,
    id?: string,
    isActive?: boolean,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    this.id = id || uuidv4();
    this.name = name;
    this.partNumber = partNumber;
    this.description = description;
    this.price = price;
    this.stockQuantity = stockQuantity;
    this.minStockLevel = minStockLevel;
    this.isActive = isActive !== undefined ? isActive : true;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  public updateInfo(
    name: string,
    partNumber: string,
    description: string,
    price: number,
    minStockLevel: number,
  ): void {
    this.name = name;
    this.partNumber = partNumber;
    this.description = description;
    this.price = price;
    this.minStockLevel = minStockLevel;
    this.updatedAt = new Date();
  }

  public addStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
    this.stockQuantity += quantity;
    this.updatedAt = new Date();
  }

  public removeStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
    if (this.stockQuantity < quantity) {
      throw new Error('Insufficient stock');
    }
    this.stockQuantity -= quantity;
    this.updatedAt = new Date();
  }

  public isLowStock(): boolean {
    return this.stockQuantity <= this.minStockLevel;
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
