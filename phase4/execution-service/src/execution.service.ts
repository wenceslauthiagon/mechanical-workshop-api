import { ExecutionRecord } from './domain';
import { randomUUID } from 'node:crypto';
import { ExecutionRepository } from './execution.repository';
import { InMemoryExecutionRepository } from './infra/execution.repository';

export class ExecutionService {
  private readonly eventEmitter: (topic: string, payload: any) => void;
  private readonly repository: ExecutionRepository;

  constructor(eventEmitter: (topic: string, payload: any) => void, repository: ExecutionRepository = new InMemoryExecutionRepository()) {
    this.eventEmitter = eventEmitter;
    this.repository = repository;
  }

  async start(orderId: string): Promise<ExecutionRecord> {
    // Idempotent: return existing if already started
    const existing = await this.repository.findByOrderId(orderId);
    if (existing) {
      return existing;
    }

    const id = randomUUID();
    const record: ExecutionRecord = {
      id,
      orderId,
      status: 'QUEUED',
      notes: [],
      startedAt: new Date().toISOString(),
    };
    return this.repository.create(record);
  }

  async getById(executionId: string): Promise<ExecutionRecord> {
    const record = await this.repository.findById(executionId);
    if (!record) {
      throw new Error('EXECUTION_NOT_FOUND');
    }
    return record;
  }

  async getByOrderId(orderId: string): Promise<ExecutionRecord> {
    const record = await this.repository.findByOrderId(orderId);
    if (!record) {
      throw new Error('EXECUTION_NOT_FOUND');
    }
    return record;
  }

  async updateStatus(executionId: string, status: ExecutionRecord['status'], note?: string): Promise<ExecutionRecord> {
    const record = await this.repository.findById(executionId);
    if (!record) throw new Error('EXECUTION_NOT_FOUND');

    // Idempotent: skip if same status
    if (record.status === status) {
      return record;
    }

    record.status = status;
    if (note) {
      await this.repository.addNote(record.id, note);
      record.notes.push(note);
    }

    if (status === 'COMPLETED') {
      record.completedAt = new Date().toISOString();
      this.eventEmitter('event.execution.completed', { orderId: record.orderId });
    } else if (status === 'FAILED') {
      this.eventEmitter('event.execution.failed', { orderId: record.orderId, reason: note });
    }

    await this.repository.save(record);
    return record;
  }
}
