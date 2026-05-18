import { connectRabbitMQ, publishEvent, subscribeEvent, resetSubscribers } from '../../src/infra/rabbitmq';

describe('RabbitMQ Mock', () => {
  beforeEach(() => {
    resetSubscribers();
  });

  it('TC0001 - Should connect without throwing', async () => {
    await expect(connectRabbitMQ()).resolves.toBeUndefined();
  });

  it('TC0002 - Should publish payload to all subscribers', async () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    await subscribeEvent('topic.1', handler1);
    await subscribeEvent('topic.1', handler2);

    const payload = { id: 1 };
    await publishEvent('topic.1', payload);

    expect(handler1).toHaveBeenCalledWith(payload);
    expect(handler2).toHaveBeenCalledWith(payload);
  });

  it('TC0003 - Should ignore subscriber errors and continue', async () => {
    const failing = jest.fn().mockRejectedValue(new Error('boom'));
    const ok = jest.fn();

    await subscribeEvent('topic.err', failing);
    await subscribeEvent('topic.err', ok);

    await expect(publishEvent('topic.err', { ok: true })).resolves.toBeUndefined();
    expect(failing).toHaveBeenCalled();
    expect(ok).toHaveBeenCalled();
  });

  it('TC0004 - Should clear subscribers on reset', async () => {
    const handler = jest.fn();
    await subscribeEvent('topic.reset', handler);

    resetSubscribers();
    await publishEvent('topic.reset', { x: 1 });

    expect(handler).not.toHaveBeenCalled();
  });
});
