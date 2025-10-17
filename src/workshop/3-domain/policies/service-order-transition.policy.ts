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
    [ServiceOrderStatus.RECEBIDA]: [ServiceOrderStatus.EM_DIAGNOSTICO],
    [ServiceOrderStatus.EM_DIAGNOSTICO]: [
      ServiceOrderStatus.AGUARDANDO_APROVACAO,
    ],
    [ServiceOrderStatus.AGUARDANDO_APROVACAO]: [
      ServiceOrderStatus.EM_EXECUCAO,
      ServiceOrderStatus.EM_DIAGNOSTICO,
    ],
    [ServiceOrderStatus.EM_EXECUCAO]: [ServiceOrderStatus.FINALIZADA],
    [ServiceOrderStatus.FINALIZADA]: [ServiceOrderStatus.ENTREGUE],
    [ServiceOrderStatus.ENTREGUE]: [],
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
