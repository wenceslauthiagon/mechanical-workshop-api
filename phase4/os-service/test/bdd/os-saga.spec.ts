import { loadFeature, defineFeature } from 'jest-cucumber';
import { createApp } from '../../src/app';

const feature = loadFeature('./test/bdd/os-saga.feature');

defineFeature(feature, (test) => {
  test('abrir OS e concluir fluxo principal', ({ given, when, and, then }) => {
    const { service, bus } = createApp();
    let orderId = '';

    given('existe uma ordem de serviço aberta', () => {
      const order = service.open('c1', 'v1', 'revisão geral');
      orderId = order.id;
    });

    when('o pagamento é confirmado', () => {
      bus.emit('event.billing.payment_confirmed', { orderId });
    });

    and('a execução é concluída', () => {
      bus.emit('event.execution.completed', { orderId });
    });

    then('a ordem deve ficar com status COMPLETED', () => {
      const current = service.get(orderId);
      expect(current.status).toBe('COMPLETED');
    });
  });
});
