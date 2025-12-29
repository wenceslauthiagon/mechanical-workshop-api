import { ServiceOrderStatus } from '@prisma/client';
import { DefaultServiceOrderPolicy } from '../../../../src/workshop/3-domain/policies/service-order-transition.policy';

describe('DefaultServiceOrderPolicy', () => {
  let policy: DefaultServiceOrderPolicy;

  beforeEach(() => {
    policy = new DefaultServiceOrderPolicy();
  });

  describe('canTransition', () => {
    it('TC0001 - Should allow transition from RECEBIDA to EM_DIAGNOSTICO', () => {
      const result = policy.canTransition(
        ServiceOrderStatus.RECEBIDA,
        ServiceOrderStatus.EM_DIAGNOSTICO,
      );

      expect(result).toBe(true);
    });

    it('TC0002 - Should not allow transition from RECEBIDA to EM_EXECUCAO', () => {
      const result = policy.canTransition(
        ServiceOrderStatus.RECEBIDA,
        ServiceOrderStatus.EM_EXECUCAO,
      );

      expect(result).toBe(false);
    });

    it('TC0003 - Should allow transition from EM_DIAGNOSTICO to AGUARDANDO_APROVACAO', () => {
      const result = policy.canTransition(
        ServiceOrderStatus.EM_DIAGNOSTICO,
        ServiceOrderStatus.AGUARDANDO_APROVACAO,
      );

      expect(result).toBe(true);
    });

    it('TC0004 - Should allow transition from AGUARDANDO_APROVACAO to EM_EXECUCAO', () => {
      const result = policy.canTransition(
        ServiceOrderStatus.AGUARDANDO_APROVACAO,
        ServiceOrderStatus.EM_EXECUCAO,
      );

      expect(result).toBe(true);
    });

    it('TC0005 - Should allow transition from AGUARDANDO_APROVACAO to EM_DIAGNOSTICO', () => {
      const result = policy.canTransition(
        ServiceOrderStatus.AGUARDANDO_APROVACAO,
        ServiceOrderStatus.EM_DIAGNOSTICO,
      );

      expect(result).toBe(true);
    });

    it('TC0006 - Should allow transition from EM_EXECUCAO to FINALIZADA', () => {
      const result = policy.canTransition(
        ServiceOrderStatus.EM_EXECUCAO,
        ServiceOrderStatus.FINALIZADA,
      );

      expect(result).toBe(true);
    });

    it('TC0007 - Should allow transition from FINALIZADA to ENTREGUE', () => {
      const result = policy.canTransition(
        ServiceOrderStatus.FINALIZADA,
        ServiceOrderStatus.ENTREGUE,
      );

      expect(result).toBe(true);
    });

    it('TC0008 - Should not allow transition from ENTREGUE', () => {
      const result = policy.canTransition(
        ServiceOrderStatus.ENTREGUE,
        ServiceOrderStatus.RECEBIDA,
      );

      expect(result).toBe(false);
    });

    it('TC0009 - Should return false for invalid status', () => {
      const result = policy.canTransition(
        'INVALID_STATUS' as ServiceOrderStatus,
        ServiceOrderStatus.RECEBIDA,
      );

      expect(result).toBe(false);
    });
  });
});
