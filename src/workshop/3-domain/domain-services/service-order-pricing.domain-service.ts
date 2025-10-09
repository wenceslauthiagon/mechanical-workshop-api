import { Injectable } from '@nestjs/common';
import { Money } from '../value-objects';

export interface PricingItem {
  unitPrice: Money;
  quantity: number;
}

export interface ServiceOrderPricingInput {
  services: PricingItem[];
  parts: PricingItem[];
  discountPercentage?: number;
  taxPercentage?: number;
}

export interface ServiceOrderPricingOutput {
  subtotalServices: Money;
  subtotalParts: Money;
  subtotal: Money;
  discountAmount: Money;
  taxAmount: Money;
  totalAmount: Money;
}

@Injectable()
export class ServiceOrderPricingDomainService {
  calculate(input: ServiceOrderPricingInput): ServiceOrderPricingOutput {
    // Calcular subtotal dos serviços
    const subtotalServices = input.services.reduce(
      (total, service) =>
        total.add(service.unitPrice.multiply(service.quantity)),
      new Money(0),
    );

    // Calcular subtotal das peças
    const subtotalParts = input.parts.reduce(
      (total, part) => total.add(part.unitPrice.multiply(part.quantity)),
      new Money(0),
    );

    // Subtotal geral
    const subtotal = subtotalServices.add(subtotalParts);

    // Calcular desconto
    const discountAmount = input.discountPercentage
      ? subtotal.multiply(input.discountPercentage / 100)
      : new Money(0);

    // Subtotal com desconto
    const subtotalWithDiscount = subtotal.subtract(discountAmount);

    // Calcular imposto sobre o valor com desconto
    const taxAmount = input.taxPercentage
      ? subtotalWithDiscount.multiply(input.taxPercentage / 100)
      : new Money(0);

    // Total final
    const totalAmount = subtotalWithDiscount.add(taxAmount);

    return {
      subtotalServices,
      subtotalParts,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
    };
  }

  calculateEstimatedTime(
    services: Array<{ estimatedMinutes: number; quantity: number }>,
  ): number {
    return services.reduce(
      (total, service) => total + service.estimatedMinutes * service.quantity,
      0,
    );
  }

  calculateEstimatedCompletionDate(
    startDate: Date,
    estimatedMinutes: number,
    workingHoursPerDay: number = 8,
  ): Date {
    const workingMinutesPerDay = workingHoursPerDay * 60;
    const daysNeeded = Math.ceil(estimatedMinutes / workingMinutesPerDay);

    const completionDate = new Date(startDate);
    completionDate.setDate(completionDate.getDate() + daysNeeded);

    return completionDate;
  }
}
