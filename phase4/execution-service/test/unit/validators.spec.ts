import { randomUUID } from 'node:crypto';
import {
  isValidUUID,
  validateExecutionId,
  validateExecutionStart,
  validateExecutionStatusUpdate,
} from '../../src/infra/validators';

describe('validators', () => {
  it('TC0001 - Should validate UUID format', () => {
    expect(isValidUUID(randomUUID())).toBe(true);
    expect(isValidUUID('invalid')).toBe(false);
  });

  it('TC0002 - Should validate execution start payload', () => {
    expect(validateExecutionStart('')).toBe('orderId is required');
    expect(validateExecutionStart('invalid')).toBe('orderId must be a valid UUID');
    expect(validateExecutionStart(randomUUID())).toBeNull();
  });

  it('TC0003 - Should validate execution status update payload', () => {
    expect(validateExecutionStatusUpdate('', 'COMPLETED')).toBe('executionId is required');
    expect(validateExecutionStatusUpdate('invalid', 'COMPLETED')).toBe('executionId must be a valid UUID');
    expect(validateExecutionStatusUpdate(randomUUID(), 'INVALID')).toBe('status must be one of: QUEUED, IN_PROGRESS, COMPLETED, FAILED');
    expect(validateExecutionStatusUpdate(randomUUID(), 'COMPLETED')).toBeNull();
  });

  it('TC0004 - Should validate execution id payload', () => {
    expect(validateExecutionId('')).toBe('executionId is required');
    expect(validateExecutionId('invalid')).toBe('executionId must be a valid UUID');
    expect(validateExecutionId(randomUUID())).toBeNull();
  });
});