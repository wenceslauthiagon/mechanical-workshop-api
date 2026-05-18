export type OrderStatus =
  | 'OPENED'
  | 'BUDGET_PENDING'
  | 'BUDGET_APPROVED'
  | 'PAYMENT_CONFIRMED'
  | 'IN_EXECUTION'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ServiceOrder {
  id: string;
  customerId: string;
  vehicleId: string;
  description: string;
  status: OrderStatus;
  history: { status: OrderStatus; at: string; reason?: string }[];
}
