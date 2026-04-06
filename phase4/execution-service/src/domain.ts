export interface ExecutionRecord {
  id: string;
  orderId: string;
  status: 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  notes: string[];
  startedAt?: string;
  completedAt?: string;
}
