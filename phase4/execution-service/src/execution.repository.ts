import { ExecutionRecord } from './domain';

export interface ExecutionRepository {
  create(record: ExecutionRecord): Promise<ExecutionRecord>;
  findById(id: string): Promise<ExecutionRecord | undefined>;
  findByOrderId(orderId: string): Promise<ExecutionRecord | undefined>;
  save(record: ExecutionRecord): Promise<void>;
  addNote(id: string, note: string): Promise<void>;
}