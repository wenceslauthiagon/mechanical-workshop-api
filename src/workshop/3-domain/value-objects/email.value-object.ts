export class Email {
  public readonly value: string;
  private static readonly MAX_LENGTH = 255;

  constructor(email: string) {
    if (!this.isValid(email)) {
      throw new Error('Email inválido');
    }
    if (email.length > Email.MAX_LENGTH) {
      throw new Error('Email inválido');
    }
    this.value = email.toLowerCase().trim();
  }

  private isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getValue(): string {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
