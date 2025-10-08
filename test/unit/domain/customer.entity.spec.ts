import { Customer } from '../../../src/domain/entities/customer.entity';
import { CustomerType } from '../../../src/shared/enums';

describe('Customer Entity', () => {
  describe('Constructor', () => {
    it('should create a customer with valid data', () => {
      const customer = new Customer(
        '12345678901',
        CustomerType.INDIVIDUAL,
        'João Silva',
        'joao@email.com',
        '11999999999',
        'Rua das Flores, 123',
      );

      expect(customer.id).toBeDefined();
      expect(customer.document).toBe('12345678901');
      expect(customer.type).toBe(CustomerType.INDIVIDUAL);
      expect(customer.name).toBe('João Silva');
      expect(customer.email).toBe('joao@email.com');
      expect(customer.phone).toBe('11999999999');
      expect(customer.address).toBe('Rua das Flores, 123');
      expect(customer.createdAt).toBeInstanceOf(Date);
      expect(customer.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('updateInfo', () => {
    it('should update customer information', () => {
      const customer = new Customer(
        '12345678901',
        CustomerType.INDIVIDUAL,
        'João Silva',
        'joao@email.com',
        '11999999999',
        'Rua das Flores, 123',
      );

      const oldUpdatedAt = customer.updatedAt;

      // Wait a bit to ensure different timestamp
      setTimeout(() => {
        customer.updateInfo(
          'João Santos',
          'joao.santos@email.com',
          '11888888888',
          'Rua das Rosas, 456',
        );

        expect(customer.name).toBe('João Santos');
        expect(customer.email).toBe('joao.santos@email.com');
        expect(customer.phone).toBe('11888888888');
        expect(customer.address).toBe('Rua das Rosas, 456');
        expect(customer.updatedAt.getTime()).toBeGreaterThan(
          oldUpdatedAt.getTime(),
        );
      }, 1);
    });
  });

  describe('isValidDocument', () => {
    it('should validate CPF correctly', () => {
      expect(
        Customer.isValidDocument('11144477735', CustomerType.INDIVIDUAL),
      ).toBe(true);
      expect(
        Customer.isValidDocument('00000000000', CustomerType.INDIVIDUAL),
      ).toBe(false);
      expect(
        Customer.isValidDocument('12345678901', CustomerType.INDIVIDUAL),
      ).toBe(false);
    });

    it('should validate CNPJ correctly', () => {
      expect(
        Customer.isValidDocument('11222333000181', CustomerType.COMPANY),
      ).toBe(true);
      expect(
        Customer.isValidDocument('00000000000000', CustomerType.COMPANY),
      ).toBe(false);
      expect(
        Customer.isValidDocument('12345678000195', CustomerType.COMPANY),
      ).toBe(false);
    });

    it('should return false for invalid document length', () => {
      expect(
        Customer.isValidDocument('123456789', CustomerType.INDIVIDUAL),
      ).toBe(false);
      expect(
        Customer.isValidDocument('12345678901234', CustomerType.COMPANY),
      ).toBe(false);
    });
  });
});
