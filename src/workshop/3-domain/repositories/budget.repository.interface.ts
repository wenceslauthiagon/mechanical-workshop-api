import { BudgetStatus } from '../entities/budget.entity';

export interface Budget {
  id: string;
  serviceOrderId: string;
  customerId: string;
  items: BudgetItem[];
  subtotal: number;
  taxes: number;
  discount: number;
  total: number;
  validUntil: Date;
  status: BudgetStatus;
  sentAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetItem {
  id: string;
  type: 'SERVICE' | 'PART';
  serviceId?: string;
  partId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CreateBudgetData {
  serviceOrderId: string;
  customerId: string;
  items: BudgetItem[];
  validDays?: number;
}

export interface UpdateBudgetData {
  items?: BudgetItem[];
  discount?: number;
  validUntil?: Date;
}

export interface IBudgetRepository {
  create(data: CreateBudgetData): Promise<Budget>;

  findAll(): Promise<Budget[]>;

  findMany(skip: number, take: number): Promise<Budget[]>;

  count(): Promise<number>;

  findById(id: string): Promise<Budget | null>;

  findByServiceOrderId(serviceOrderId: string): Promise<Budget[]>;

  findByCustomerId(customerId: string): Promise<Budget[]>;

  findByStatus(status: BudgetStatus): Promise<Budget[]>;

  update(id: string, data: UpdateBudgetData): Promise<Budget>;

  updateStatus(id: string, status: BudgetStatus): Promise<Budget>;

  delete(id: string): Promise<Budget>;

  findExpired(): Promise<Budget[]>;

  markAsExpired(id: string): Promise<Budget>;
}
