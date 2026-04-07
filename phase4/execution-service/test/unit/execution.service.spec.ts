import { faker } from '@faker-js/faker/locale/pt_BR';
import { ExecutionService } from '../../src/execution.service';

describe('ExecutionService', () => {
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
      const orderId = faker.string.uuid();

      const record = service.start(orderId);

      expect(record.id).toBeDefined();
      expect(record.orderId).toBe(orderId);
      expect(record.status).toBe('QUEUED');
      expect(record.notes).toEqual([]);
      expect(record.startedAt).toBeDefined();
    });

    it('TC0002 - Should generate unique ids for different executions', () => {
      const r1 = service.start(faker.string.uuid());
      const r2 = service.start(faker.string.uuid());

      expect(r1.id).not.toBe(r2.id);
    });
  });

  describe('updateStatus', () => {
    it('TC0001 - Should update status to IN_PROGRESS', () => {
      const record = service.start(faker.string.uuid());
      const note = faker.lorem.sentence();

      const updated = service.updateStatus(record.id, 'IN_PROGRESS', note);

      expect(updated.status).toBe('IN_PROGRESS');
      expect(updated.notes).toContain(note);
    });

    it('TC0002 - Should mark as COMPLETED, set completedAt and emit event', () => {
      const orderId = faker.string.uuid();
      const record = service.start(orderId);

      service.updateStatus(record.id, 'COMPLETED', 'Reparo concluído');

      expect(eventEmitter).toHaveBeenCalledWith(
        'event.execution.completed',
        expect.objectContaining({ orderId }),
      );
      expect(service.updateStatus(record.id, 'COMPLETED').completedAt).toBeDefined();
    });

    it('TC0003 - Should mark as FAILED and emit event with reason', () => {
      const orderId = faker.string.uuid();
      const record = service.start(orderId);
      const reason = faker.lorem.sentence();

      service.updateStatus(record.id, 'FAILED', reason);

      expect(eventEmitter).toHaveBeenCalledWith(
        'event.execution.failed',
        expect.objectContaining({ orderId, reason }),
      );
    });

    it('TC0004 - Should throw error if execution not found', () => {
      expect(() =>
        service.updateStatus(faker.string.uuid(), 'COMPLETED'),
      ).toThrow('EXECUTION_NOT_FOUND');
    });

    it('TC0005 - Should not emit event for intermediate status changes', () => {
      const record = service.start(faker.string.uuid());

      service.updateStatus(record.id, 'IN_PROGRESS');

      expect(eventEmitter).not.toHaveBeenCalled();
    });
  });
});
