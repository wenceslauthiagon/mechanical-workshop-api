import { ExecutionRecord } from './domain';
import { randomUUID } from 'node:crypto';

export class ExecutionService {
  private readonly records = new Map<string, ExecutionRecord>();
  private readonly eventEmitter: (topic: string, payload: any) => void;

  constructor(eventEmitter: (topic: string, payload: any) => void) {
    this.eventEmitter = eventEmitter;
  }

  start(orderId: string): ExecutionRecord {
    const id = randomUUID();
    const record: ExecutionRecord = {
      id,
      orderId,
      status: 'QUEUED',
      notes: [],
      startedAt: new Date().toISOString(),
    };
    this.records.set(id, record);
    return record;
  }

  getById(executionId: string): ExecutionRecord {
    const record = this.records.get(executionId);
    if (!record) {
      throw new Error('EXECUTION_NOT_FOUND');
    }
    return record;
  }

  getByOrderId(orderId: string): ExecutionRecord {
    const record = [...this.records.values()].find(item => item.orderId === orderId);
    if (!record) {
      throw new Error('EXECUTION_NOT_FOUND');
    }
    return record;
  }

  updateStatus(executionId: string, status: ExecutionRecord['status'], note?: string): ExecutionRecord {
    const record = this.records.get(executionId);
    if (!record) throw new Error('EXECUTION_NOT_FOUND');

    record.status = status;
    if (note) record.notes.push(note);

    if (status === 'COMPLETED') {
      record.completedAt = new Date().toISOString();
      this.eventEmitter('event.execution.completed', { orderId: record.orderId });
    } else if (status === 'FAILED') {
      this.eventEmitter('event.execution.failed', { orderId: record.orderId, reason: note });
    }

    return record;
  }
}
