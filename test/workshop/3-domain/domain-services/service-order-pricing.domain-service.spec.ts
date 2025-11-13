import { ServiceOrderPricingDomainService } from '../../../../src/workshop/3-domain/domain-services/service-order-pricing.domain-service';
import { Money } from '../../../../src/workshop/3-domain/value-objects';

describe('ServiceOrderPricingDomainService', () => {
  let service: ServiceOrderPricingDomainService;

  beforeEach(() => {
    service = new ServiceOrderPricingDomainService();
  });

  describe('calculate', () => {
    it('TC0001 - Should calculate subtotal for services only', () => {
      const input = {
        services: [
          { unitPrice: new Money(100), quantity: 2 },
          { unitPrice: new Money(50), quantity: 1 },
        ],
        parts: [],
      };

      const result = service.calculate(input);

      expect(result.subtotalServices.amount).toBe(250);
      expect(result.subtotalParts.amount).toBe(0);
      expect(result.subtotal.amount).toBe(250);
    });

    it('TC0002 - Should calculate subtotal for parts only', () => {
      const input = {
        services: [],
        parts: [
          { unitPrice: new Money(80), quantity: 3 },
          { unitPrice: new Money(20), quantity: 2 },
        ],
      };

      const result = service.calculate(input);

      expect(result.subtotalServices.amount).toBe(0);
      expect(result.subtotalParts.amount).toBe(280);
      expect(result.subtotal.amount).toBe(280);
    });

    it('TC0003 - Should calculate subtotal for services and parts', () => {
      const input = {
        services: [{ unitPrice: new Money(100), quantity: 1 }],
        parts: [{ unitPrice: new Money(50), quantity: 2 }],
      };

      const result = service.calculate(input);

      expect(result.subtotalServices.amount).toBe(100);
      expect(result.subtotalParts.amount).toBe(100);
      expect(result.subtotal.amount).toBe(200);
    });

    it('TC0004 - Should apply discount when percentage is provided', () => {
      const input = {
        services: [{ unitPrice: new Money(100), quantity: 1 }],
        parts: [],
        discountPercentage: 10,
      };

      const result = service.calculate(input);

      expect(result.discountAmount.amount).toBe(10);
      expect(result.totalAmount.amount).toBe(90);
    });

    it('TC0005 - Should not apply discount when percentage is not provided', () => {
      const input = {
        services: [{ unitPrice: new Money(100), quantity: 1 }],
        parts: [],
      };

      const result = service.calculate(input);

      expect(result.discountAmount.amount).toBe(0);
    });

    it('TC0006 - Should apply tax when percentage is provided', () => {
      const input = {
        services: [{ unitPrice: new Money(100), quantity: 1 }],
        parts: [],
        taxPercentage: 10,
      };

      const result = service.calculate(input);

      expect(result.taxAmount.amount).toBe(10);
      expect(result.totalAmount.amount).toBe(110);
    });

    it('TC0007 - Should not apply tax when percentage is not provided', () => {
      const input = {
        services: [{ unitPrice: new Money(100), quantity: 1 }],
        parts: [],
      };

      const result = service.calculate(input);

      expect(result.taxAmount.amount).toBe(0);
    });

    it('TC0008 - Should apply discount and tax correctly', () => {
      const input = {
        services: [{ unitPrice: new Money(100), quantity: 1 }],
        parts: [],
        discountPercentage: 10,
        taxPercentage: 10,
      };

      const result = service.calculate(input);

      expect(result.discountAmount.amount).toBe(10);
      expect(result.taxAmount.amount).toBe(9);
      expect(result.totalAmount.amount).toBe(99);
    });
  });

  describe('calculateEstimatedTime', () => {
    it('TC0001 - Should calculate total estimated minutes', () => {
      const services = [
        { estimatedMinutes: 60, quantity: 2 },
        { estimatedMinutes: 30, quantity: 1 },
      ];

      const result = service.calculateEstimatedTime(services);

      expect(result).toBe(150);
    });

    it('TC0002 - Should return zero for empty services', () => {
      const result = service.calculateEstimatedTime([]);

      expect(result).toBe(0);
    });
  });

  describe('calculateEstimatedCompletionDate', () => {
    it('TC0001 - Should calculate completion date with default working hours', () => {
      const startDate = new Date('2024-10-20T12:00:00Z');
      const estimatedMinutes = 480;

      const result = service.calculateEstimatedCompletionDate(
        startDate,
        estimatedMinutes,
      );

      expect(result.getTime()).toBeGreaterThan(startDate.getTime());
    });

    it('TC0002 - Should calculate completion date with custom working hours', () => {
      const startDate = new Date('2024-10-20T12:00:00Z');
      const estimatedMinutes = 480;
      const workingHoursPerDay = 4;

      const result = service.calculateEstimatedCompletionDate(
        startDate,
        estimatedMinutes,
        workingHoursPerDay,
      );

      expect(result.getTime()).toBeGreaterThan(startDate.getTime());
    });

    it('TC0003 - Should round up days when minutes exceed working hours', () => {
      const startDate = new Date('2024-10-20T12:00:00Z');
      const estimatedMinutes = 500;
      const workingHoursPerDay = 8;

      const result = service.calculateEstimatedCompletionDate(
        startDate,
        estimatedMinutes,
        workingHoursPerDay,
      );

      expect(result.getTime()).toBeGreaterThan(startDate.getTime());
    });
  });
});
