import { OrderNumberGeneratorDomainService } from '../../../../src/workshop/3-domain/domain-services/order-number-generator.domain-service';

describe('OrderNumberGeneratorDomainService', () => {
  let service: OrderNumberGeneratorDomainService;

  beforeEach(() => {
    service = new OrderNumberGeneratorDomainService();
  });

  describe('generate', () => {
    it('TC0001 - Should generate order number with correct format', () => {
      const currentYear = 2024;
      const orderCount = 0;

      const result = service.generate(currentYear, orderCount);

      expect(result).toMatch(/^\d{4}-\d{2}-\d{4}$/);
    });

    it('TC0002 - Should generate order number with year', () => {
      const currentYear = 2024;
      const orderCount = 0;

      const result = service.generate(currentYear, orderCount);

      expect(result).toContain('2024');
    });

    it('TC0003 - Should generate order number with incremented count', () => {
      const currentYear = 2024;
      const orderCount = 5;

      const result = service.generate(currentYear, orderCount);

      expect(result).toContain('0006');
    });

    it('TC0004 - Should generate order number with padded month', () => {
      const currentYear = 2024;
      const orderCount = 0;

      const result = service.generate(currentYear, orderCount);

      const month = result.split('-')[1];
      expect(month).toHaveLength(2);
    });

    it('TC0005 - Should generate order number with padded count', () => {
      const currentYear = 2024;
      const orderCount = 99;

      const result = service.generate(currentYear, orderCount);

      const count = result.split('-')[2];
      expect(count).toBe('0100');
    });
  });

  describe('validate', () => {
    it('TC0001 - Should return true for valid order number', () => {
      const result = service.validate('2024-10-0001');

      expect(result).toBe(true);
    });

    it('TC0002 - Should return false for invalid format', () => {
      const result = service.validate('invalid');

      expect(result).toBe(false);
    });

    it('TC0003 - Should return false for missing parts', () => {
      const result = service.validate('2024-10');

      expect(result).toBe(false);
    });
  });

  describe('extractYear', () => {
    it('TC0001 - Should extract year from valid order number', () => {
      const result = service.extractYear('2024-10-0001');

      expect(result).toBe(2024);
    });

    it('TC0002 - Should return null for invalid order number', () => {
      const result = service.extractYear('invalid');

      expect(result).toBeNull();
    });
  });

  describe('extractMonth', () => {
    it('TC0001 - Should extract month from valid order number', () => {
      const result = service.extractMonth('2024-10-0001');

      expect(result).toBe(10);
    });

    it('TC0002 - Should return null for invalid order number', () => {
      const result = service.extractMonth('invalid');

      expect(result).toBeNull();
    });
  });

  describe('extractSequenceNumber', () => {
    it('TC0001 - Should extract sequence number from valid order number', () => {
      const result = service.extractSequenceNumber('2024-10-0001');

      expect(result).toBe(1);
    });

    it('TC0002 - Should return null for invalid order number', () => {
      const result = service.extractSequenceNumber('invalid');

      expect(result).toBeNull();
    });
  });
});

describe('Legacy methods', () => {
  let service: OrderNumberGeneratorDomainService;

  beforeEach(() => {
    service = new OrderNumberGeneratorDomainService();
  });

  describe('generateOrderNumber', () => {
    it('TC0001 - Should generate legacy order number with default year', () => {
      const result = service.generateOrderNumber();

      expect(result).toMatch(/^OS-\d{4}-\d{6}$/);
      expect(result).toContain(new Date().getFullYear().toString());
    });

    it('TC0002 - Should generate legacy order number with custom year', () => {
      const result = service.generateOrderNumber(2023);

      expect(result).toContain('OS-2023-');
      expect(result).toMatch(/^OS-2023-\d{6}$/);
    });

    it('TC0003 - Should generate legacy order number with custom sequence', () => {
      const result = service.generateOrderNumber(2024, 42);

      expect(result).toBe('OS-2024-000042');
    });

    it('TC0004 - Should pad sequence number to 6 digits', () => {
      const result = service.generateOrderNumber(2024, 1);

      expect(result).toBe('OS-2024-000001');
    });
  });

  describe('extractYearFromOrderNumber', () => {
    it('TC0001 - Should extract year from legacy order number', () => {
      const result = service.extractYearFromOrderNumber('OS-2024-000001');

      expect(result).toBe(2024);
    });

    it('TC0002 - Should return null for invalid legacy order number', () => {
      const result = service.extractYearFromOrderNumber('invalid');

      expect(result).toBeNull();
    });
  });

  describe('extractSequenceFromOrderNumber', () => {
    it('TC0001 - Should extract sequence from legacy order number', () => {
      const result = service.extractSequenceFromOrderNumber('OS-2024-000042');

      expect(result).toBe(42);
    });

    it('TC0002 - Should return null for invalid legacy order number', () => {
      const result = service.extractSequenceFromOrderNumber('invalid');

      expect(result).toBeNull();
    });
  });

  describe('isValidOrderNumber', () => {
    it('TC0001 - Should return true for valid legacy order number', () => {
      const result = service.isValidOrderNumber('OS-2024-000001');

      expect(result).toBe(true);
    });

    it('TC0002 - Should return false for invalid legacy order number', () => {
      const result = service.isValidOrderNumber('invalid');

      expect(result).toBe(false);
    });

    it('TC0003 - Should return false for order number without padding', () => {
      const result = service.isValidOrderNumber('OS-2024-1');

      expect(result).toBe(false);
    });
  });
});

