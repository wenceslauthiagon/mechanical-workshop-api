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
    it('TC0001 - Should create execution record with status QUEUED', async () => {
      const orderId = randomUUID();

      const record = await service.start(orderId);

      expect(record.id).toBeDefined();
      expect(record.orderId).toBe(orderId);
      expect(record.status).toBe('QUEUED');
      expect(record.notes).toEqual([]);
      expect(record.startedAt).toBeDefined();
    });

    it('TC0002 - Should generate unique ids for different executions', async () => {
      const r1 = await service.start(randomUUID());
      const r2 = await service.start(randomUUID());

      expect(r1.id).not.toBe(r2.id);
    });

    it('TC0003 - Should be idempotent for the same orderId', async () => {
      const orderId = randomUUID();

      const record1 = await service.start(orderId);
      const record2 = await service.start(orderId);

      expect(record2.id).toBe(record1.id);
    });
  });

  describe('queries', () => {
    it('TC0001 - Should get execution by id and order id', async () => {
      const orderId = randomUUID();
      const record = await service.start(orderId);

      await expect(service.getById(record.id)).resolves.toEqual(record);
      await expect(service.getByOrderId(orderId)).resolves.toEqual(record);
    });

    it('TC0002 - Should throw when querying unknown execution', async () => {
      await expect(service.getById(randomUUID())).rejects.toThrow('EXECUTION_NOT_FOUND');
      await expect(service.getByOrderId(randomUUID())).rejects.toThrow('EXECUTION_NOT_FOUND');
    });
  });

  describe('updateStatus', () => {
    it('TC0001 - Should update status to IN_PROGRESS', async () => {
      const record = await service.start(randomUUID());
      const note = randomText();

      const updated = await service.updateStatus(record.id, 'IN_PROGRESS', note);

      expect(updated.status).toBe('IN_PROGRESS');
      expect(updated.notes).toContain(note);
    });

    it('TC0002 - Should mark as COMPLETED, set completedAt and emit event', async () => {
      const orderId = randomUUID();
      const record = await service.start(orderId);

      await service.updateStatus(record.id, 'COMPLETED', 'Reparo concluído');

      expect(eventEmitter).toHaveBeenCalledWith(
        'event.execution.completed',
        expect.objectContaining({ orderId }),
      );
      expect((await service.updateStatus(record.id, 'COMPLETED')).completedAt).toBeDefined();
    });

    it('TC0003 - Should mark as FAILED and emit event with reason', async () => {
      const orderId = randomUUID();
      const record = await service.start(orderId);
      const reason = randomText();

      await service.updateStatus(record.id, 'FAILED', reason);

      expect(eventEmitter).toHaveBeenCalledWith(
        'event.execution.failed',
        expect.objectContaining({ orderId, reason }),
      );
    });

    it('TC0004 - Should throw error if execution not found', async () => {
      await expect(
        service.updateStatus(randomUUID(), 'COMPLETED'),
      ).rejects.toThrow('EXECUTION_NOT_FOUND');
    });

    it('TC0005 - Should not emit event for intermediate status changes', async () => {
      const record = await service.start(randomUUID());

      await service.updateStatus(record.id, 'IN_PROGRESS');

      expect(eventEmitter).not.toHaveBeenCalled();
    });

    it('TC0006 - Should be idempotent for the same status', async () => {
      const orderId = randomUUID();
      const record = await service.start(orderId);
      eventEmitter.mockClear();

      await service.updateStatus(record.id, 'IN_PROGRESS', 'first');
      eventEmitter.mockClear();

      await service.updateStatus(record.id, 'IN_PROGRESS', 'second');

      expect(eventEmitter).not.toHaveBeenCalled();
      expect(record.notes).toEqual(['first']);
    });
  });
});
