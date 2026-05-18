export interface BillingEventPayload {
  [key: string]: string | number | boolean | null | undefined;
  orderId?: string;
  customerId?: string;
  vehicleId?: string;
  estimatedTotal?: number;
  budgetId?: string;
  paymentId?: string;
  mercadopagoId?: string;
  amount?: number;
  reason?: string;
}

export interface BillingTopicPayloadMap {
  'command.billing.generate': { orderId: string; estimatedTotal?: number };
  'command.billing.approve': { orderId: string };
  'command.billing.refund': { orderId: string; reason: string };
  'event.billing.budget_generated': { orderId: string; budgetId: string; estimatedTotal: number; status?: string };
  'event.billing.budget_generation_failed': { orderId: string; reason: string };
  'event.billing.payment_confirmed': { orderId: string; budgetId: string; paymentId: string; mercadopagoId?: string; amount: number };
  'event.billing.payment_failed': { orderId: string; reason: string };
  'event.billing.refunded': { orderId: string };
  'event.billing.refund_failed': { orderId: string; reason: string };
  [topic: string]: BillingEventPayload;
}
