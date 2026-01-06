export class OrderNumberGeneratorDomainService {
  generate(year: number, count: number): string {
    const currentMonth = new Date().getMonth() + 1;
    const paddedMonth = currentMonth.toString().padStart(2, '0');
    const paddedCount = (count + 1).toString().padStart(4, '0');
    return `${year}-${paddedMonth}-${paddedCount}`;
  }

  validate(orderNumber: string): boolean {
    return /^\d{4}-\d{2}-\d{4}$/.test(orderNumber);
  }

  extractYear(orderNumber: string): number | null {
    const match = orderNumber.match(/^(\d{4})-\d{2}-\d{4}$/);
    return match ? parseInt(match[1], 10) : null;
  }

  extractMonth(orderNumber: string): number | null {
    const match = orderNumber.match(/^\d{4}-(\d{2})-\d{4}$/);
    return match ? parseInt(match[1], 10) : null;
  }

  extractSequenceNumber(orderNumber: string): number | null {
    const match = orderNumber.match(/^\d{4}-\d{2}-(\d{4})$/);
    return match ? parseInt(match[1], 10) : null;
  }

  // Legacy methods for compatibility
  generateOrderNumber(year?: number, sequence?: number): string {
    const currentYear = year || new Date().getFullYear();
    const orderSequence = sequence || 1;
    const paddedSequence = orderSequence.toString().padStart(6, '0');
    return `OS-${currentYear}-${paddedSequence}`;
  }

  extractYearFromOrderNumber(orderNumber: string): number | null {
    const match = orderNumber.match(/^OS-(\d{4})-\d+$/);
    return match ? parseInt(match[1], 10) : null;
  }

  extractSequenceFromOrderNumber(orderNumber: string): number | null {
    const match = orderNumber.match(/^OS-\d{4}-(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
  }

  isValidOrderNumber(orderNumber: string): boolean {
    return /^OS-\d{4}-\d{6}$/.test(orderNumber);
  }
}
