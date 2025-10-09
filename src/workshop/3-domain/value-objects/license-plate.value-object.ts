export class LicensePlate {
  private readonly _value: string;

  constructor(value: string) {
    const cleanValue = this.clean(value);
    if (!this.isValid(cleanValue)) {
      throw new Error('Placa inválida');
    }
    this._value = cleanValue.toUpperCase();
  }

  get value(): string {
    return this._value;
  }

  get formatted(): string {
    if (this._value.length === 7) {
      return this._value.replace(/^([A-Z]{3})([0-9A-Z]{4})$/, '$1-$2');
    }
    return this._value;
  }

  private clean(value: string): string {
    return value.replace(/[^A-Za-z0-9]/g, '');
  }

  private isValid(plate: string): boolean {
    const oldFormat = /^[A-Z]{3}[0-9]{4}$/;
    const mercosulFormat = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

    return (
      plate.length === 7 &&
      (oldFormat.test(plate) || mercosulFormat.test(plate))
    );
  }

  equals(other: LicensePlate): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
