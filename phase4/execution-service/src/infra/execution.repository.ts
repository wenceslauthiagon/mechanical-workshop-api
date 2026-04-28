import { ExecutionRecord } from '../domain';
import { ExecutionRepository } from '../execution.repository';

export class InMemoryExecutionRepository implements ExecutionRepository {
  private readonly records = new Map<string, ExecutionRecord>();
  private readonly orderExecutions = new Map<string, string>();

  async create(record: ExecutionRecord): Promise<ExecutionRecord> {
    this.records.set(record.id, record);
    this.orderExecutions.set(record.orderId, record.id);
    return record;
  }

  async findById(id: string): Promise<ExecutionRecord | undefined> {
    return this.records.get(id);
  }

  async findByOrderId(orderId: string): Promise<ExecutionRecord | undefined> {
    const executionId = this.orderExecutions.get(orderId);
    if (executionId) {
      return this.records.get(executionId);
    }
    return [...this.records.values()].find(item => item.orderId === orderId);
  }

  async save(record: ExecutionRecord): Promise<void> {
    this.records.set(record.id, record);
    this.orderExecutions.set(record.orderId, record.id);
  }

  async addNote(id: string, note: string): Promise<void> {
    const record = this.records.get(id);
    if (!record) {
      return;
    }
    this.records.set(id, {
      ...record,
      notes: [...record.notes, note],
    });
  }
}