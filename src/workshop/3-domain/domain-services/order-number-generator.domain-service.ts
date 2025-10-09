import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderNumberGeneratorDomainService {
  /**
   * Gera um número de ordem único baseado na data e contador
   * Formato: YYYY-MM-NNNN (ex: 2025-10-0001)
   */
  generate(currentYear: number, orderCount: number): string {
    const currentMonth = new Date().getMonth() + 1;
    const paddedMonth = currentMonth.toString().padStart(2, '0');
    const paddedCount = (orderCount + 1).toString().padStart(4, '0');

    return `${currentYear}-${paddedMonth}-${paddedCount}`;
  }

  /**
   * Valida se um número de ordem está no formato correto
   */
  validate(orderNumber: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{4}$/;
    return regex.test(orderNumber);
  }

  /**
   * Extrai o ano de um número de ordem
   */
  extractYear(orderNumber: string): number | null {
    if (!this.validate(orderNumber)) {
      return null;
    }

    const parts = orderNumber.split('-');
    return parseInt(parts[0], 10);
  }

  /**
   * Extrai o mês de um número de ordem
   */
  extractMonth(orderNumber: string): number | null {
    if (!this.validate(orderNumber)) {
      return null;
    }

    const parts = orderNumber.split('-');
    return parseInt(parts[1], 10);
  }

  /**
   * Extrai o número sequencial de um número de ordem
   */
  extractSequenceNumber(orderNumber: string): number | null {
    if (!this.validate(orderNumber)) {
      return null;
    }

    const parts = orderNumber.split('-');
    return parseInt(parts[2], 10);
  }
}
