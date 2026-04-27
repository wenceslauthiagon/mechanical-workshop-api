import { validate as validateUUID } from 'uuid';

export function isValidUUID(value: string): boolean {
  return validateUUID(value);
}

export function validateExecutionStart(orderId: string): string | null {
  if (!orderId || orderId.trim().length === 0) {
    return 'orderId is required';
  }
  if (!isValidUUID(orderId)) {
    return 'orderId must be a valid UUID';
  }
  return null;
}

export function validateExecutionStatusUpdate(executionId: string, status: string): string | null {
  if (!executionId || executionId.trim().length === 0) {
    return 'executionId is required';
  }
  if (!isValidUUID(executionId)) {
    return 'executionId must be a valid UUID';
  }

  const validStatuses = ['QUEUED', 'IN_PROGRESS', 'COMPLETED', 'FAILED'];
  if (!status || !validStatuses.includes(status)) {
    return `status must be one of: ${validStatuses.join(', ')}`;
  }
  return null;
}

export function validateExecutionId(executionId: string): string | null {
  if (!executionId || executionId.trim().length === 0) {
    return 'executionId is required';
  }
  if (!isValidUUID(executionId)) {
    return 'executionId must be a valid UUID';
  }
  return null;
}
