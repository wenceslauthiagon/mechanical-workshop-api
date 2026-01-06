export class LicensePlate {
  private readonly _value: string;

  constructor(plate: string) {
    const normalized = this.normalize(plate);
    if (!this.isValid(normalized)) {
      throw new Error('Placa inválida');
    }
    this._value = normalized;
  }

  get value(): string {
    return this._value;
  }

  private normalize(plate: string): string {
    return plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  private isValid(plate: string): boolean {
    // Formato antigo: ABC1234 (3 letras + 4 números)
    const oldFormat = /^[A-Z]{3}[0-9]{4}$/;
    // Formato Mercosul: ABC1D23 (3 letras + 1 número + 1 letra + 2 números)
    const mercosulFormat = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
    
    return oldFormat.test(plate) || mercosulFormat.test(plate);
  }

  getValue(): string {
    return this._value;
  }

  getFormatted(): string {
    if (this._value.length >= 7) {
      // ABC1234 -> ABC-1234 or ABC1D23 -> ABC-1D23
      return `${this._value.slice(0, 3)}-${this._value.slice(3)}`;
    }
    return this._value;
  }

  toString(): string {
    return this._value;
  }

  equals(other: LicensePlate): boolean {
    return this._value === other._value;
  }
}
