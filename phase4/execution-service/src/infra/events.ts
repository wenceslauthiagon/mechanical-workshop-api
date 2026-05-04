export interface ExecutionEventPayload {
  [key: string]: string | number | boolean | null | undefined;
  orderId?: string;
  executionId?: string;
  reason?: string;
  completedAt?: string;
  status?: string;
  note?: string;
}

export interface ExecutionTopicPayloadMap {
  'command.execution.start': { orderId: string };
  'event.execution.started': { orderId: string; executionId?: string; startedAt?: string };
  'event.execution.completed': { orderId: string; executionId?: string; completedAt?: string };
  'event.execution.failed': { orderId: string; reason?: string };
  [topic: string]: ExecutionEventPayload;
}
