import { Decimal } from '@prisma/client/runtime/library';

export class Money {
  public readonly amount: Decimal;
  public readonly currency: string;

  private static readonly VALID_CURRENCIES = ['BRL', 'USD', 'EUR'];

  constructor(amount: number | string | Decimal, currency: string = 'BRL') {
    const decimalAmount = new Decimal(amount);
    
    if (decimalAmount.isNegative()) {
      throw new Error('Valor monetário não pode ser negativo');
    }

    if (!Money.VALID_CURRENCIES.includes(currency)) {
      throw new Error('Moeda inválida');
    }

    // Round to 2 decimal places
    this.amount = decimalAmount.toDecimalPlaces(0);
    this.currency = currency;
  }

  getAmount(): Decimal {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error(`Operação entre moedas diferentes: ${this.currency} e ${other.currency}`);
    }
    return new Money(this.amount.add(other.amount), this.currency);
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error(`Operação entre moedas diferentes: ${this.currency} e ${other.currency}`);
    }
    return new Money(this.amount.sub(other.amount), this.currency);
  }

  multiply(multiplier: number): Money {
    if (multiplier < 0) {
      throw new Error('Fator de multiplicação não pode ser negativo');
    }
    return new Money(this.amount.mul(multiplier), this.currency);
  }

  divide(divisor: number): Money {
    if (divisor <= 0) {
      throw new Error('Divisor deve ser maior que zero');
    }
    return new Money(this.amount.div(divisor), this.currency);
  }

  equals(other: Money): boolean {
    return this.amount.equals(other.amount) && this.currency === other.currency;
  }

  isGreaterThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new Error(`Operação entre moedas diferentes: ${this.currency} e ${other.currency}`);
    }
    return this.amount.greaterThan(other.amount);
  }

  isLessThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new Error(`Operação entre moedas diferentes: ${this.currency} e ${other.currency}`);
    }
    return this.amount.lessThan(other.amount);
  }

  toString(): string {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }

  toNumber(): number {
    return this.amount.toNumber();
  }
}
