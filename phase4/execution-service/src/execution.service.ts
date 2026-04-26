import { ExecutionRecord } from './domain';
import { randomUUID } from 'node:crypto';

export class ExecutionService {
  private readonly records = new Map<string, ExecutionRecord>();
  private readonly orderExecutions = new Map<string, string>();
  private readonly eventEmitter: (topic: string, payload: any) => void;

  constructor(eventEmitter: (topic: string, payload: any) => void) {
    this.eventEmitter = eventEmitter;
  }

  start(orderId: string): ExecutionRecord {
    // Idempotent: return existing if already started
    const existingId = this.orderExecutions.get(orderId);
    if (existingId) {
      const existing = this.records.get(existingId);
      if (existing) {
        return existing;
      }
    }

    const id = randomUUID();
    const record: ExecutionRecord = {
      id,
      orderId,
      status: 'QUEUED',
      notes: [],
      startedAt: new Date().toISOString(),
    };
    this.records.set(id, record);
    this.orderExecutions.set(orderId, id);
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

    // Idempotent: skip if same status
    if (record.status === status) {
      return record;
    }

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
