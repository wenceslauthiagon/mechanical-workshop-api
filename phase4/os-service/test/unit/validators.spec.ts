import { randomUUID } from 'node:crypto';
import {
  isValidUUID,
  validateOrderCreation,
  validateOrderId,
  validateStatusUpdate,
} from '../../src/infra/validators';

describe('validators', () => {
  it('TC0001 - isValidUUID', () => {
    expect(isValidUUID(randomUUID())).toBe(true);
    expect(isValidUUID('invalid')).toBe(false);
  });

  it('TC0002 - validateOrderCreation', () => {
    expect(validateOrderCreation('', 'v', 'd')).toBe('customerId is required');
    expect(validateOrderCreation('c', '', 'd')).toBe('vehicleId is required');
    expect(validateOrderCreation('c', 'v', '')).toBe('description is required');
    expect(validateOrderCreation('c', 'v', 'd')).toBeNull();
  });

  it('TC0003 - validateOrderId', () => {
    expect(validateOrderId('')).toBe('orderId is required');
    expect(validateOrderId('invalid')).toBe('orderId must be a valid UUID');
    expect(validateOrderId(randomUUID())).toBeNull();
  });

  it('TC0004 - validateStatusUpdate', () => {
    expect(validateStatusUpdate('')).toBeTruthy();
    expect(validateStatusUpdate('INVALID')).toBeTruthy();
    expect(validateStatusUpdate('COMPLETED')).toBeNull();
  });
});
