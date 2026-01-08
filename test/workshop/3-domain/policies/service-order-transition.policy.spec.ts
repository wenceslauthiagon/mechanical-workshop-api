import { DefaultServiceOrderPolicy } from '../../../../src/workshop/3-domain/policies/service-order-transition.policy';
import { ServiceOrderStatus } from '../../../../src/shared/enums/service-order-status.enum';

describe('DefaultServiceOrderPolicy', () => {
  let policy: DefaultServiceOrderPolicy;

  beforeEach(() => {
    policy = new DefaultServiceOrderPolicy();
  });

  describe('canTransition', () => {
    it('TC0001 - Should allow transition from RECEBIDA to EM_DIAGNOSTICO', () => {
      const result = policy.canTransition(
        ServiceOrderStatus.RECEIVED,
        ServiceOrderStatus.IN_DIAGNOSIS,
      );

      expect(result).toBe(true);
    });

    it('TC0002 - Should not allow transition from RECEBIDA to EM_EXECUCAO', () => {
      const result = policy.canTransition(
        ServiceOrderStatus.RECEIVED,
        ServiceOrderStatus.IN_EXECUTION,
      );

      expect(result).toBe(false);
    });

    it('TC0003 - Should allow transition from EM_DIAGNOSTICO to AGUARDANDO_APROVACAO', () => {
      const result = policy.canTransition(
        ServiceOrderStatus.IN_DIAGNOSIS,
        ServiceOrderStatus.AWAITING_APPROVAL,
      );

      expect(result).toBe(true);
    });

    it('TC0004 - Should allow transition from AGUARDANDO_APROVACAO to EM_EXECUCAO', () => {
      const result = policy.canTransition(
        ServiceOrderStatus.AWAITING_APPROVAL,
        ServiceOrderStatus.IN_EXECUTION,
      );

      expect(result).toBe(true);
    });

    it('TC0005 - Should allow transition from AGUARDANDO_APROVACAO to EM_DIAGNOSTICO', () => {
      const result = policy.canTransition(
        ServiceOrderStatus.AWAITING_APPROVAL,
        ServiceOrderStatus.IN_DIAGNOSIS,
      );

      expect(result).toBe(true);
    });

    it('TC0006 - Should allow transition from EM_EXECUCAO to FINALIZADA', () => {
      const result = policy.canTransition(
        ServiceOrderStatus.IN_EXECUTION,
        ServiceOrderStatus.FINISHED,
      );

      expect(result).toBe(true);
    });

    it('TC0007 - Should allow transition from FINALIZADA to ENTREGUE', () => {
      const result = policy.canTransition(
        ServiceOrderStatus.FINISHED,
        ServiceOrderStatus.DELIVERED,
      );

      expect(result).toBe(true);
    });

    it('TC0008 - Should not allow transition from ENTREGUE', () => {
      const result = policy.canTransition(
        ServiceOrderStatus.DELIVERED,
        ServiceOrderStatus.RECEIVED,
      );

      expect(result).toBe(false);
    });

    it('TC0009 - Should return false for invalid status', () => {
      const result = policy.canTransition(
        'INVALID_STATUS' as ServiceOrderStatus,
        ServiceOrderStatus.RECEIVED,
      );

      expect(result).toBe(false);
    });
  });

  describe('getValidTransitions', () => {
    it('TC0001 - Should return valid transitions for RECEBIDA status', () => {
      const result = policy.getValidTransitions(ServiceOrderStatus.RECEIVED);

      expect(result).toEqual([ServiceOrderStatus.IN_DIAGNOSIS]);
    });

    it('TC0002 - Should return valid transitions for EM_DIAGNOSTICO status', () => {
      const result = policy.getValidTransitions(
        ServiceOrderStatus.IN_DIAGNOSIS,
      );

      expect(result).toEqual([ServiceOrderStatus.AWAITING_APPROVAL]);
    });

    it('TC0003 - Should return valid transitions for AGUARDANDO_APROVACAO status', () => {
      const result = policy.getValidTransitions(
        ServiceOrderStatus.AWAITING_APPROVAL,
      );

      expect(result).toEqual([
        ServiceOrderStatus.IN_EXECUTION,
        ServiceOrderStatus.IN_DIAGNOSIS,
      ]);
    });

    it('TC0004 - Should return valid transitions for EM_EXECUCAO status', () => {
      const result = policy.getValidTransitions(
        ServiceOrderStatus.IN_EXECUTION,
      );

      expect(result).toEqual([ServiceOrderStatus.FINISHED]);
    });

    it('TC0005 - Should return valid transitions for FINALIZADA status', () => {
      const result = policy.getValidTransitions(
        ServiceOrderStatus.FINISHED,
      );

      expect(result).toEqual([ServiceOrderStatus.DELIVERED]);
    });

    it('TC0006 - Should return empty array for ENTREGUE status', () => {
      const result = policy.getValidTransitions(ServiceOrderStatus.DELIVERED);

      expect(result).toEqual([]);
    });
  });
});
