export class Money {
  private readonly _amount: number;
  private readonly _currency: string;

  constructor(amount: number, currency = 'BRL') {
    if (amount < 0) {
      throw new Error('Valor monetário não pode ser negativo');
    }
    if (!this.isValidCurrency(currency)) {
      throw new Error('Moeda inválida');
    }
    this._amount = Math.round(amount * 100) / 100;
    this._currency = currency;
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): string {
    return this._currency;
  }

  get formatted(): string {
    if (this._currency === 'BRL') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(this._amount);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this._currency,
    }).format(this._amount);
  }

  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this._amount + other._amount, this._currency);
  }

  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    const result = this._amount - other._amount;
    return new Money(result, this._currency);
  }

  multiply(factor: number): Money {
    if (factor < 0) {
      throw new Error('Fator de multiplicação não pode ser negativo');
    }
    return new Money(this._amount * factor, this._currency);
  }

  divide(divisor: number): Money {
    if (divisor <= 0) {
      throw new Error('Divisor deve ser maior que zero');
    }
    return new Money(this._amount / divisor, this._currency);
  }

  isGreaterThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this._amount > other._amount;
  }

  isLessThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this._amount < other._amount;
  }

  equals(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }

  private isValidCurrency(currency: string): boolean {
    const validCurrencies = ['BRL', 'USD', 'EUR'];
    return validCurrencies.includes(currency);
  }

  private ensureSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new Error(
        `Operação entre moedas diferentes: ${this._currency} e ${other._currency}`,
      );
    }
  }

  toString(): string {
    return `${this._amount} ${this._currency}`;
  }
}
