import { validate as validateUUID } from 'uuid';

export function isValidUUID(value: string): boolean {
  return validateUUID(value);
}

export function validateBudgetCreation(orderId: string, estimatedTotal: number): string | null {
  if (!orderId || orderId.trim().length === 0) {
    return 'orderId is required';
  }
  if (!isValidUUID(orderId)) {
    return 'orderId must be a valid UUID';
  }
  if (!estimatedTotal || estimatedTotal <= 0) {
    return 'estimatedTotal must be a positive number';
  }
  return null;
}

export function validatePaymentApproval(budgetId: string, amount: number): string | null {
  if (!budgetId || budgetId.trim().length === 0) {
    return 'budgetId is required';
  }
  if (!isValidUUID(budgetId)) {
    return 'budgetId must be a valid UUID';
  }
  if (!amount || amount <= 0) {
    return 'amount must be a positive number';
  }
  return null;
}

export function validateOrderId(orderId: string): string | null {
  if (!orderId || orderId.trim().length === 0) {
    return 'orderId is required';
  }
  if (!isValidUUID(orderId)) {
    return 'orderId must be a valid UUID';
  }
  return null;
}
