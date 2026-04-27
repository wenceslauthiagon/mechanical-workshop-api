import { randomUUID } from 'node:crypto';
import {
  isValidUUID,
  validateBudgetCreation,
  validatePaymentApproval,
  validateOrderId,
} from '../../src/infra/validators';

describe('validators', () => {
  it('TC0001 - isValidUUID', () => {
    expect(isValidUUID(randomUUID())).toBe(true);
    expect(isValidUUID('invalid')).toBe(false);
  });

  it('TC0002 - validateBudgetCreation', () => {
    expect(validateBudgetCreation('', 100)).toBe('orderId is required');
    expect(validateBudgetCreation('invalid', 100)).toBe('orderId must be a valid UUID');
    expect(validateBudgetCreation(randomUUID(), 0)).toBe('estimatedTotal must be a positive number');
    expect(validateBudgetCreation(randomUUID(), 100)).toBeNull();
  });

  it('TC0003 - validatePaymentApproval', () => {
    expect(validatePaymentApproval('', 100)).toBe('budgetId is required');
    expect(validatePaymentApproval('invalid', 100)).toBe('budgetId must be a valid UUID');
    expect(validatePaymentApproval(randomUUID(), 0)).toBe('amount must be a positive number');
    expect(validatePaymentApproval(randomUUID(), 100)).toBeNull();
  });

  it('TC0004 - validateOrderId', () => {
    expect(validateOrderId('')).toBe('orderId is required');
    expect(validateOrderId('invalid')).toBe('orderId must be a valid UUID');
    expect(validateOrderId(randomUUID())).toBeNull();
  });
});
