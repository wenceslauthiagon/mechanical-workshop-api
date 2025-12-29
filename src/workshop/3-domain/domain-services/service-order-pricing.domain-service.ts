import { Money } from '../value-objects/money.value-object';

interface PriceItem {
  unitPrice: Money;
  quantity: number;
}

interface CalculateInput {
  services: PriceItem[];
  parts: PriceItem[];
  discountPercentage?: number;
  taxPercentage?: number;
}

interface CalculateResult {
  subtotalServices: Money;
  subtotalParts: Money;
  subtotal: Money;
  discountAmount: Money;
  taxAmount: Money;
  totalAmount: Money;
}

export class ServiceOrderPricingDomainService {
  calculate(input: CalculateInput): CalculateResult {
    // Calculate subtotals
    const subtotalServices = this.calculateSubtotal(input.services);
    const subtotalParts = this.calculateSubtotal(input.parts);
    const subtotal = subtotalServices.add(subtotalParts);

    // Apply discount
    const discountAmount = input.discountPercentage
      ? subtotal.multiply(input.discountPercentage / 100)
      : new Money(0);
    const afterDiscount = subtotal.subtract(discountAmount);

    // Apply tax
    const taxAmount = input.taxPercentage
      ? afterDiscount.multiply(input.taxPercentage / 100)
      : new Money(0);
    const totalAmount = afterDiscount.add(taxAmount);

    return {
      subtotalServices,
      subtotalParts,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
    };
  }

  private calculateSubtotal(items: PriceItem[]): Money {
    if (items.length === 0) return new Money(0);
    
    return items.reduce((total, item) => {
      const itemTotal = item.unitPrice.multiply(item.quantity);
      return total.add(itemTotal);
    }, new Money(0));
  }

  calculateEstimatedTime(services: Array<{ estimatedMinutes: number; quantity: number }>): number {
    return services.reduce((total, service) => {
      return total + service.estimatedMinutes * service.quantity;
    }, 0);
  }

  calculateEstimatedCompletionDate(startDate: Date, estimatedMinutes: number, workingHoursPerDay: number = 8): Date {
    const workingMinutesPerDay = workingHoursPerDay * 60;
    const daysNeeded = Math.ceil(estimatedMinutes / workingMinutesPerDay);
    const completionDate = new Date(startDate);
    completionDate.setDate(completionDate.getDate() + daysNeeded);
    return completionDate;
  }

  // Legacy methods for compatibility
  calculateTotalServicePrice(services: Array<{ price: number; quantity: number }>): Money {
    const total = services.reduce((sum, service) => {
      return sum + service.price * service.quantity;
    }, 0);
    return new Money(total);
  }

  calculateTotalPartsPrice(parts: Array<{ price: number; quantity: number }>): Money {
    const total = parts.reduce((sum, part) => {
      return sum + part.price * part.quantity;
    }, 0);
    return new Money(total);
  }

  calculateTotalPrice(servicePrice: Money, partsPrice: Money): Money {
    return servicePrice.add(partsPrice);
  }

  applyDiscount(totalPrice: Money, discountPercentage: number): Money {
    if (discountPercentage < 0 || discountPercentage > 100) {
      throw new Error('Discount percentage must be between 0 and 100');
    }
    const multiplier = 1 - discountPercentage / 100;
    return totalPrice.multiply(multiplier);
  }

  calculateTax(totalPrice: Money, taxPercentage: number): Money {
    if (taxPercentage < 0) {
      throw new Error('Tax percentage cannot be negative');
    }
    return totalPrice.multiply(taxPercentage / 100);
  }
}
