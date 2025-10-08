import { v4 as uuidv4 } from 'uuid';
import { CustomerType } from '../../shared/enums';

export class Customer {
  public readonly id: string;
  public readonly document: string; // CPF ou CNPJ
  public readonly type: CustomerType;
  public name: string;
  public email: string;
  public phone: string;
  public address: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(
    document: string,
    type: CustomerType,
    name: string,
    email: string,
    phone: string,
    address: string,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    this.id = id || uuidv4();
    this.document = document;
    this.type = type;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.address = address;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  public updateInfo(
    name: string,
    email: string,
    phone: string,
    address: string,
  ): void {
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.address = address;
    this.updatedAt = new Date();
  }

  public static isValidDocument(document: string, type: CustomerType): boolean {
    if (type === CustomerType.INDIVIDUAL) {
      return Customer.isValidCPF(document);
    } else {
      return Customer.isValidCNPJ(document);
    }
  }

  private static isValidCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/\D/g, '');

    if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) {
      return false;
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF[i]) * (10 - i);
    }
    let digit1 = 11 - (sum % 11);
    if (digit1 >= 10) digit1 = 0;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF[i]) * (11 - i);
    }
    let digit2 = 11 - (sum % 11);
    if (digit2 >= 10) digit2 = 0;

    return (
      digit1 === parseInt(cleanCPF[9]) && digit2 === parseInt(cleanCPF[10])
    );
  }

  private static isValidCNPJ(cnpj: string): boolean {
    const cleanCNPJ = cnpj.replace(/\D/g, '');

    if (cleanCNPJ.length !== 14 || /^(\d)\1{13}$/.test(cleanCNPJ)) {
      return false;
    }

    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleanCNPJ[i]) * weights1[i];
    }
    let digit1 = sum % 11;
    digit1 = digit1 < 2 ? 0 : 11 - digit1;

    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleanCNPJ[i]) * weights2[i];
    }
    let digit2 = sum % 11;
    digit2 = digit2 < 2 ? 0 : 11 - digit2;

    return (
      digit1 === parseInt(cleanCNPJ[12]) && digit2 === parseInt(cleanCNPJ[13])
    );
  }
}
