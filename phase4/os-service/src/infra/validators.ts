import { validate as validateUUID } from 'uuid';

export function isValidUUID(value: string): boolean {
  return validateUUID(value);
}

export function validateOrderCreation(customerId: string, vehicleId: string, description: string): string | null {
  if (!customerId || customerId.trim().length === 0) {
    return 'customerId is required';
  }
  if (!vehicleId || vehicleId.trim().length === 0) {
    return 'vehicleId is required';
  }
  if (!description || description.trim().length === 0) {
    return 'description is required';
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

export function validateStatusUpdate(status: string): string | null {
  const validStatuses = ['OPENED', 'BUDGET_PENDING', 'BUDGET_APPROVED', 'PAYMENT_CONFIRMED', 'IN_EXECUTION', 'COMPLETED', 'CANCELLED'];
  if (!status || !validStatuses.includes(status)) {
    return `status must be one of: ${validStatuses.join(', ')}`;
  }
  return null;
}
