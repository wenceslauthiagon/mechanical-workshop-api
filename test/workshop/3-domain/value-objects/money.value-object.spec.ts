import { Money } from '../../../../src/workshop/3-domain/value-objects/money.value-object';

describe('Money', () => {
  describe('constructor', () => {
    it('TC0001 - Should create money with default currency', () => {
      const money = new Money(100);

      expect(money.amount).toBe(100);
      expect(money.currency).toBe('BRL');
    });

    it('TC0002 - Should create money with specified currency', () => {
      const money = new Money(100, 'USD');

      expect(money.amount).toBe(100);
      expect(money.currency).toBe('USD');
    });

    it('TC0003 - Should round amount to 2 decimal places', () => {
      const money = new Money(100.999);

      expect(money.amount).toBe(101);
    });

    it('TC0004 - Should throw error for negative amount', () => {
      expect(() => new Money(-10)).toThrow(
        'Valor monetário não pode ser negativo',
      );
    });

    it('TC0005 - Should throw error for invalid currency', () => {
      expect(() => new Money(100, 'ABC')).toThrow('Moeda inválida');
    });
  });

  describe('formatted', () => {
    it('TC0001 - Should format BRL correctly', () => {
      const money = new Money(100, 'BRL');

      const result = money.formatted;

      expect(result).toContain('100');
      expect(result).toContain('R$');
    });

    it('TC0002 - Should format USD correctly', () => {
      const money = new Money(100, 'USD');

      const result = money.formatted;

      expect(result).toBe('$100.00');
    });

    it('TC0003 - Should format EUR correctly', () => {
      const money = new Money(100, 'EUR');

      const result = money.formatted;

      expect(result).toBe('€100.00');
    });
  });

  describe('add', () => {
    it('TC0001 - Should add two money values', () => {
      const money1 = new Money(100);
      const money2 = new Money(50);

      const result = money1.add(money2);

      expect(result.amount).toBe(150);
    });

    it('TC0002 - Should throw error when adding different currencies', () => {
      const money1 = new Money(100, 'BRL');
      const money2 = new Money(50, 'USD');

      expect(() => money1.add(money2)).toThrow(
        'Operação entre moedas diferentes: BRL e USD',
      );
    });
  });

  describe('subtract', () => {
    it('TC0001 - Should subtract two money values', () => {
      const money1 = new Money(100);
      const money2 = new Money(30);

      const result = money1.subtract(money2);

      expect(result.amount).toBe(70);
    });

    it('TC0002 - Should throw error when subtracting different currencies', () => {
      const money1 = new Money(100, 'BRL');
      const money2 = new Money(30, 'USD');

      expect(() => money1.subtract(money2)).toThrow(
        'Operação entre moedas diferentes: BRL e USD',
      );
    });
  });

  describe('multiply', () => {
    it('TC0001 - Should multiply money by factor', () => {
      const money = new Money(100);

      const result = money.multiply(2);

      expect(result.amount).toBe(200);
    });

    it('TC0002 - Should throw error for negative factor', () => {
      const money = new Money(100);

      expect(() => money.multiply(-2)).toThrow(
        'Fator de multiplicação não pode ser negativo',
      );
    });
  });

  describe('divide', () => {
    it('TC0001 - Should divide money by divisor', () => {
      const money = new Money(100);

      const result = money.divide(2);

      expect(result.amount).toBe(50);
    });

    it('TC0002 - Should throw error for zero divisor', () => {
      const money = new Money(100);

      expect(() => money.divide(0)).toThrow('Divisor deve ser maior que zero');
    });

    it('TC0003 - Should throw error for negative divisor', () => {
      const money = new Money(100);

      expect(() => money.divide(-2)).toThrow('Divisor deve ser maior que zero');
    });
  });

  describe('isGreaterThan', () => {
    it('TC0001 - Should return true when amount is greater', () => {
      const money1 = new Money(100);
      const money2 = new Money(50);

      const result = money1.isGreaterThan(money2);

      expect(result).toBe(true);
    });

    it('TC0002 - Should return false when amount is not greater', () => {
      const money1 = new Money(50);
      const money2 = new Money(100);

      const result = money1.isGreaterThan(money2);

      expect(result).toBe(false);
    });

    it('TC0003 - Should throw error when comparing different currencies', () => {
      const money1 = new Money(100, 'BRL');
      const money2 = new Money(50, 'USD');

      expect(() => money1.isGreaterThan(money2)).toThrow(
        'Operação entre moedas diferentes: BRL e USD',
      );
    });
  });

  describe('isLessThan', () => {
    it('TC0001 - Should return true when amount is less', () => {
      const money1 = new Money(50);
      const money2 = new Money(100);

      const result = money1.isLessThan(money2);

      expect(result).toBe(true);
    });

    it('TC0002 - Should return false when amount is not less', () => {
      const money1 = new Money(100);
      const money2 = new Money(50);

      const result = money1.isLessThan(money2);

      expect(result).toBe(false);
    });

    it('TC0003 - Should throw error when comparing different currencies', () => {
      const money1 = new Money(100, 'BRL');
      const money2 = new Money(50, 'USD');

      expect(() => money1.isLessThan(money2)).toThrow(
        'Operação entre moedas diferentes: BRL e USD',
      );
    });
  });

  describe('equals', () => {
    it('TC0001 - Should return true for equal money values', () => {
      const money1 = new Money(100, 'BRL');
      const money2 = new Money(100, 'BRL');

      const result = money1.equals(money2);

      expect(result).toBe(true);
    });

    it('TC0002 - Should return false for different amounts', () => {
      const money1 = new Money(100);
      const money2 = new Money(50);

      const result = money1.equals(money2);

      expect(result).toBe(false);
    });

    it('TC0003 - Should return false for different currencies', () => {
      const money1 = new Money(100, 'BRL');
      const money2 = new Money(100, 'USD');

      const result = money1.equals(money2);

      expect(result).toBe(false);
    });
  });

  describe('toString', () => {
    it('TC0001 - Should return string representation', () => {
      const money = new Money(100, 'BRL');

      const result = money.toString();

      expect(result).toBe('100 BRL');
    });
  });
});
