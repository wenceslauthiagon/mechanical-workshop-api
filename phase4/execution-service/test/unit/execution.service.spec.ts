import { randomUUID } from 'node:crypto';
import { ExecutionService } from '../../src/execution.service';

describe('ExecutionService', () => {
  const randomText = () => `note-${Math.random().toString(36).slice(2, 10)}`;
  let eventEmitter: jest.Mock;
  let service: ExecutionService;

  beforeEach(() => {
    eventEmitter = jest.fn();
    service = new ExecutionService(eventEmitter);
  });

  it('TC0001 - Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('start', () => {
    it('TC0001 - Should create execution record with status QUEUED', () => {
      const orderId = randomUUID();

      const record = service.start(orderId);

      expect(record.id).toBeDefined();
      expect(record.orderId).toBe(orderId);
      expect(record.status).toBe('QUEUED');
      expect(record.notes).toEqual([]);
      expect(record.startedAt).toBeDefined();
    });

    it('TC0002 - Should generate unique ids for different executions', () => {
      const r1 = service.start(randomUUID());
      const r2 = service.start(randomUUID());

      expect(r1.id).not.toBe(r2.id);
    });

    it('TC0003 - Should be idempotent for the same orderId', () => {
      const orderId = randomUUID();

      const record1 = service.start(orderId);
      const record2 = service.start(orderId);

      expect(record2.id).toBe(record1.id);
    });
  });

  describe('updateStatus', () => {
    it('TC0001 - Should update status to IN_PROGRESS', () => {
      const record = service.start(randomUUID());
      const note = randomText();

      const updated = service.updateStatus(record.id, 'IN_PROGRESS', note);

      expect(updated.status).toBe('IN_PROGRESS');
      expect(updated.notes).toContain(note);
    });

    it('TC0002 - Should mark as COMPLETED, set completedAt and emit event', () => {
      const orderId = randomUUID();
      const record = service.start(orderId);

      service.updateStatus(record.id, 'COMPLETED', 'Reparo concluído');

      expect(eventEmitter).toHaveBeenCalledWith(
        'event.execution.completed',
        expect.objectContaining({ orderId }),
      );
      expect(service.updateStatus(record.id, 'COMPLETED').completedAt).toBeDefined();
    });

    it('TC0003 - Should mark as FAILED and emit event with reason', () => {
      const orderId = randomUUID();
      const record = service.start(orderId);
      const reason = randomText();

      service.updateStatus(record.id, 'FAILED', reason);

      expect(eventEmitter).toHaveBeenCalledWith(
        'event.execution.failed',
        expect.objectContaining({ orderId, reason }),
      );
    });

    it('TC0004 - Should throw error if execution not found', () => {
      expect(() =>
        service.updateStatus(randomUUID(), 'COMPLETED'),
      ).toThrow('EXECUTION_NOT_FOUND');
    });

    it('TC0005 - Should not emit event for intermediate status changes', () => {
      const record = service.start(randomUUID());

      service.updateStatus(record.id, 'IN_PROGRESS');

      expect(eventEmitter).not.toHaveBeenCalled();
    });

    it('TC0006 - Should be idempotent for the same status', () => {
      const orderId = randomUUID();
      const record = service.start(orderId);
      eventEmitter.mockClear();

      service.updateStatus(record.id, 'IN_PROGRESS', 'first');
      eventEmitter.mockClear();

      service.updateStatus(record.id, 'IN_PROGRESS', 'second');

      expect(eventEmitter).not.toHaveBeenCalled();
      expect(record.notes).toEqual(['first']);
    });
  });
});
