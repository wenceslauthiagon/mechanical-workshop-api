import { CustomerType } from '@prisma/client';
import { Email, Document } from '../value-objects';

export interface CustomerAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export class CustomerAggregate {
  private constructor(
    public readonly id: string,
    private _document: Document,
    private _type: CustomerType,
    private _name: string,
    private _email: Email,
    private _phone: string,
    private _address: string,
    private _additionalInfo?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  static create(
    id: string,
    document: string,
    type: CustomerType,
    name: string,
    email: string,
    phone: string,
    address: string,
    additionalInfo?: string,
  ): CustomerAggregate {
    return new CustomerAggregate(
      id,
      new Document(document),
      type,
      name.trim(),
      new Email(email),
      phone.trim(),
      address.trim(),
      additionalInfo?.trim(),
      new Date(),
    );
  }

  static fromDatabase(data: any): CustomerAggregate {
    return new CustomerAggregate(
      data.id,
      new Document(data.document),
      data.type,
      data.name,
      new Email(data.email),
      data.phone,
      data.address,
      data.additionalInfo,
      data.createdAt,
      data.updatedAt,
    );
  }

  get document(): Document {
    return this._document;
  }

  get type(): CustomerType {
    return this._type;
  }

  get name(): string {
    return this._name;
  }

  get email(): Email {
    return this._email;
  }

  get phone(): string {
    return this._phone;
  }

  get address(): string {
    return this._address;
  }

  get additionalInfo(): string | undefined {
    return this._additionalInfo;
  }

  updatePersonalInfo(
    name: string,
    phone: string,
    address: string,
    additionalInfo?: string,
  ): void {
    if (name.trim().length < 2) {
      throw new Error('Nome deve ter pelo menos 2 caracteres');
    }
    if (phone.trim().length < 10) {
      throw new Error('Telefone deve ter pelo menos 10 dígitos');
    }
    if (address.trim().length < 10) {
      throw new Error('Endereço deve ter pelo menos 10 caracteres');
    }

    this._name = name.trim();
    this._phone = phone.trim();
    this._address = address.trim();
    this._additionalInfo = additionalInfo?.trim();
  }

  changeEmail(newEmail: string): void {
    this._email = new Email(newEmail);
  }

  changeDocument(newDocument: string): void {
    const document = new Document(newDocument);

    // Validar se o tipo de cliente está compatível com o documento
    const isCompany = document.value.length === 14;
    const expectedType = isCompany
      ? CustomerType.PESSOA_JURIDICA
      : CustomerType.PESSOA_FISICA;

    if (this._type !== expectedType) {
      throw new Error(
        `Tipo de documento incompatível com o tipo de cliente. ` +
          `Esperado: ${expectedType}, Atual: ${this._type}`,
      );
    }

    this._document = document;
  }

  isCompany(): boolean {
    return this._type === CustomerType.PESSOA_JURIDICA;
  }

  isIndividual(): boolean {
    return this._type === CustomerType.PESSOA_FISICA;
  }

  getDocumentFormatted(): string {
    return this._document.formatted;
  }
}
