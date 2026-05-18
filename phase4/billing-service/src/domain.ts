export interface Budget {
  id: string;
  orderId: string;
  estimatedTotal: number;
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED';
}

export interface Payment {
  id: string;
  budgetId: string;
  amount: number;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  mercadopagoId?: string;
}
