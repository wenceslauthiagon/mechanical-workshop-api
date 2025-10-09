import { ServiceOrderStatus } from '@prisma/client';

export interface ServiceOrderPolicy {
  canTransition(
    fromStatus: ServiceOrderStatus,
    toStatus: ServiceOrderStatus,
  ): boolean;
  getValidTransitions(fromStatus: ServiceOrderStatus): ServiceOrderStatus[];
}

export class DefaultServiceOrderPolicy implements ServiceOrderPolicy {
  private readonly validTransitions: Record<
    ServiceOrderStatus,
    ServiceOrderStatus[]
  > = {
    [ServiceOrderStatus.RECEIVED]: [ServiceOrderStatus.IN_DIAGNOSIS],
    [ServiceOrderStatus.IN_DIAGNOSIS]: [ServiceOrderStatus.AWAITING_APPROVAL],
    [ServiceOrderStatus.AWAITING_APPROVAL]: [
      ServiceOrderStatus.IN_EXECUTION,
      ServiceOrderStatus.IN_DIAGNOSIS,
    ],
    [ServiceOrderStatus.IN_EXECUTION]: [ServiceOrderStatus.FINISHED],
    [ServiceOrderStatus.FINISHED]: [ServiceOrderStatus.DELIVERED],
    [ServiceOrderStatus.DELIVERED]: [],
  };

  canTransition(
    fromStatus: ServiceOrderStatus,
    toStatus: ServiceOrderStatus,
  ): boolean {
    const allowedTransitions = this.validTransitions[fromStatus] || [];
    return allowedTransitions.includes(toStatus);
  }

  getValidTransitions(fromStatus: ServiceOrderStatus): ServiceOrderStatus[] {
    return this.validTransitions[fromStatus] || [];
  }
}
