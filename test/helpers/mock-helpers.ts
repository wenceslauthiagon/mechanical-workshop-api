import { Prisma } from '@prisma/client';

/**
 * Helper to convert number to Prisma.Decimal for mocks
 * Use this in test mocks when the schema expects Decimal type
 */
export function mockDecimal(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value) as any;
}

/**
 * Helper to create Part mock with correct types
 */
export function mockPart(overrides: Partial<{
  id: string;
  partNumber: string;
  name: string;
  description: string;
  supplier: string;
  price: number;
  stock: number;
  minStock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}> = {}) {
  return {
    id: overrides.id || 'part-id',
    partNumber: overrides.partNumber || 'PART-001',
    name: overrides.name || 'Test Part',
    description: overrides.description || 'Test Description',
    supplier: overrides.supplier || 'Test Supplier',
    price: mockDecimal(overrides.price || 100),
    stock: overrides.stock || 10,
    minStock: overrides.minStock || 5,
    isActive: overrides.isActive !== undefined ? overrides.isActive : true,
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date(),
  };
}

/**
 * Helper to create Service mock with correct types
 */
export function mockService(overrides: Partial<{
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedMinutes: number;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}> = {}) {
  return {
    id: overrides.id || 'service-id',
    name: overrides.name || 'Test Service',
    description: overrides.description || 'Test Description',
    price: mockDecimal(overrides.price || 100),
    estimatedMinutes: overrides.estimatedMinutes || 60,
    category: overrides.category || 'Mecânica',
    isActive: overrides.isActive !== undefined ? overrides.isActive : true,
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date(),
  };
}

/**
 * Helper to create ServiceOrder mock with correct types
 */
export function mockServiceOrder(overrides: Partial<{
  id: string;
  orderNumber: string;
  customerId: string;
  vehicleId: string;
  mechanicId: string | null;
  status: any;
  description: string;
  totalServicePrice: number;
  totalPartsPrice: number;
  totalPrice: number;
  estimatedTimeHours: number;
  estimatedCompletionDate: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  deliveredAt: Date | null;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}> = {}) {
  return {
    id: overrides.id || 'order-id',
    orderNumber: overrides.orderNumber || 'SO-001',
    customerId: overrides.customerId || 'customer-id',
    vehicleId: overrides.vehicleId || 'vehicle-id',
    mechanicId: overrides.mechanicId !== undefined ? overrides.mechanicId : 'mechanic-id',
    status: overrides.status || 'RECEIVED',
    description: overrides.description || 'Test Order',
    totalServicePrice: mockDecimal(overrides.totalServicePrice || 0),
    totalPartsPrice: mockDecimal(overrides.totalPartsPrice || 0),
    totalPrice: mockDecimal(overrides.totalPrice || 0),
    estimatedTimeHours: mockDecimal(overrides.estimatedTimeHours || 0),
    estimatedCompletionDate: overrides.estimatedCompletionDate || new Date(),
    startedAt: overrides.startedAt || null,
    completedAt: overrides.completedAt || null,
    deliveredAt: overrides.deliveredAt || null,
    approvedAt: overrides.approvedAt || null,
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date(),
  };
}
