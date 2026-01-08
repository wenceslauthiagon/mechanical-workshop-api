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

      expect(result.subtotalServices.amount.toNumber()).toBe(250);
      expect(result.subtotalParts.amount.toNumber()).toBe(0);
      expect(result.subtotal.amount.toNumber()).toBe(250);
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

      expect(result.subtotalServices.amount.toNumber()).toBe(0);
      expect(result.subtotalParts.amount.toNumber()).toBe(280);
      expect(result.subtotal.amount.toNumber()).toBe(280);
    });

    it('TC0003 - Should calculate subtotal for services and parts', () => {
      const input = {
        services: [{ unitPrice: new Money(100), quantity: 1 }],
        parts: [{ unitPrice: new Money(50), quantity: 2 }],
      };

      const result = service.calculate(input);

      expect(result.subtotalServices.amount.toNumber()).toBe(100);
      expect(result.subtotalParts.amount.toNumber()).toBe(100);
      expect(result.subtotal.amount.toNumber()).toBe(200);
    });

    it('TC0004 - Should apply discount when percentage is provided', () => {
      const input = {
        services: [{ unitPrice: new Money(100), quantity: 1 }],
        parts: [],
        discountPercentage: 10,
      };

      const result = service.calculate(input);

      expect(result.discountAmount.amount.toNumber()).toBe(10);
      expect(result.totalAmount.amount.toNumber()).toBe(90);
    });

    it('TC0005 - Should not apply discount when percentage is not provided', () => {
      const input = {
        services: [{ unitPrice: new Money(100), quantity: 1 }],
        parts: [],
      };

      const result = service.calculate(input);

      expect(result.discountAmount.amount.toNumber()).toBe(0);
    });

    it('TC0006 - Should apply tax when percentage is provided', () => {
      const input = {
        services: [{ unitPrice: new Money(100), quantity: 1 }],
        parts: [],
        taxPercentage: 10,
      };

      const result = service.calculate(input);

      expect(result.taxAmount.amount.toNumber()).toBe(10);
      expect(result.totalAmount.amount.toNumber()).toBe(110);
    });

    it('TC0007 - Should not apply tax when percentage is not provided', () => {
      const input = {
        services: [{ unitPrice: new Money(100), quantity: 1 }],
        parts: [],
      };

      const result = service.calculate(input);

      expect(result.taxAmount.amount.toNumber()).toBe(0);
    });

    it('TC0008 - Should apply discount and tax correctly', () => {
      const input = {
        services: [{ unitPrice: new Money(100), quantity: 1 }],
        parts: [],
        discountPercentage: 10,
        taxPercentage: 10,
      };

      const result = service.calculate(input);

      expect(result.discountAmount.amount.toNumber()).toBe(10);
      expect(result.taxAmount.amount.toNumber()).toBe(9);
      expect(result.totalAmount.amount.toNumber()).toBe(99);
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

  describe('Legacy methods', () => {
    describe('calculateTotalServicePrice', () => {
      it('TC0001 - Should calculate total service price', () => {
        const services = [
          { price: 100, quantity: 2 },
          { price: 50, quantity: 3 },
        ];

        const result = service.calculateTotalServicePrice(services);

        expect(result.amount.toNumber()).toBe(350);
      });

      it('TC0002 - Should return zero for empty services', () => {
        const result = service.calculateTotalServicePrice([]);

        expect(result.amount.toNumber()).toBe(0);
      });
    });

    describe('calculateTotalPartsPrice', () => {
      it('TC0001 - Should calculate total parts price', () => {
        const parts = [
          { price: 80, quantity: 2 },
          { price: 40, quantity: 1 },
        ];

        const result = service.calculateTotalPartsPrice(parts);

        expect(result.amount.toNumber()).toBe(200);
      });

      it('TC0002 - Should return zero for empty parts', () => {
        const result = service.calculateTotalPartsPrice([]);

        expect(result.amount.toNumber()).toBe(0);
      });
    });

    describe('calculateTotalPrice', () => {
      it('TC0001 - Should calculate total price from service and parts', () => {
        const servicePrice = new Money(100);
        const partsPrice = new Money(50);

        const result = service.calculateTotalPrice(servicePrice, partsPrice);

        expect(result.amount.toNumber()).toBe(150);
      });
    });

    describe('applyDiscount', () => {
      it('TC0001 - Should apply discount correctly', () => {
        const totalPrice = new Money(100);

        const result = service.applyDiscount(totalPrice, 10);

        expect(result.amount.toNumber()).toBe(90);
      });

      it('TC0002 - Should throw error for negative discount', () => {
        const totalPrice = new Money(100);

        expect(() => service.applyDiscount(totalPrice, -10)).toThrow(
          'Discount percentage must be between 0 and 100',
        );
      });

      it('TC0003 - Should throw error for discount greater than 100', () => {
        const totalPrice = new Money(100);

        expect(() => service.applyDiscount(totalPrice, 110)).toThrow(
          'Discount percentage must be between 0 and 100',
        );
      });

      it('TC0004 - Should handle 0% discount', () => {
        const totalPrice = new Money(100);

        const result = service.applyDiscount(totalPrice, 0);

        expect(result.amount.toNumber()).toBe(100);
      });

      it('TC0005 - Should handle 100% discount', () => {
        const totalPrice = new Money(100);

        const result = service.applyDiscount(totalPrice, 100);

        expect(result.amount.toNumber()).toBe(0);
      });
    });

    describe('calculateTax', () => {
      it('TC0001 - Should calculate tax correctly', () => {
        const totalPrice = new Money(100);

        const result = service.calculateTax(totalPrice, 10);

        expect(result.amount.toNumber()).toBe(10);
      });

      it('TC0002 - Should throw error for negative tax', () => {
        const totalPrice = new Money(100);

        expect(() => service.calculateTax(totalPrice, -10)).toThrow(
          'Tax percentage cannot be negative',
        );
      });

      it('TC0003 - Should handle 0% tax', () => {
        const totalPrice = new Money(100);

        const result = service.calculateTax(totalPrice, 0);

        expect(result.amount.toNumber()).toBe(0);
      });
    });
  });
});
