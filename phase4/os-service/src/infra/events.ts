export interface OsEventPayload {
  [key: string]: string | number | boolean | null | undefined;
  orderId?: string;
  customerId?: string;
  vehicleId?: string;
  reason?: string;
  status?: string;
}

export interface OsTopicPayloadMap {
  'event.billing.budget_generated': { orderId: string; budgetId: string; estimatedTotal: number; status?: string };
  'event.billing.budget_generation_failed': { orderId: string; reason?: string };
  'event.billing.payment_confirmed': { orderId: string };
  'event.billing.payment_failed': { orderId: string; reason?: string };
  'event.execution.completed': { orderId: string };
  'event.execution.failed': { orderId: string; reason?: string };
  'command.execution.start': { orderId: string };
  'command.billing.generate': { orderId: string; customerId: string; vehicleId: string };
  'command.billing.approve': { orderId: string };
  'command.billing.refund': { orderId: string; reason: string };
  [topic: string]: OsEventPayload;
}
