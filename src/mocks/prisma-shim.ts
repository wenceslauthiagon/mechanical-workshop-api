export { ServiceOrderStatus } from '../shared/enums/service-order-status.enum';
export { CustomerType } from '../shared/enums/customer-type.enum';

// Re-export UserRole enum
export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
  MECHANIC = 'MECHANIC',
}

// Minimal PrismaClient stub for tests that import PrismaClient
export class PrismaClient {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}
}
