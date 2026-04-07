import { loadFeature, defineFeature } from 'jest-cucumber';
import { createApp } from '../../src/app';

const feature = loadFeature('./test/bdd/os-saga.feature');

defineFeature(feature, (test) => {
  test('abrir OS e concluir fluxo principal', ({ given, when, and, then }) => {
    let service: Awaited<ReturnType<typeof createApp>>['service'];
    let orderId = '';

    given('existe uma ordem de serviço aberta', async () => {
      const appCtx = await createApp();
      service = appCtx.service;
      const order = service.open('c1', 'v1', 'revisão geral');
      orderId = order.id;
    });

    when('o pagamento é confirmado', () => {
      service.mark(orderId, 'PAYMENT_CONFIRMED');
    });

    and('a execução é concluída', () => {
      service.mark(orderId, 'COMPLETED');
    });

    then('a ordem deve ficar com status COMPLETED', () => {
      const current = service.get(orderId);
      expect(current.status).toBe('COMPLETED');
    });
  });
});
