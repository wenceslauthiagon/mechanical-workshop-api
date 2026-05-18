import { connectRabbitMQ, publishEvent, subscribeEvent, resetSubscribers } from '../../src/infra/rabbitmq';

describe('RabbitMQ Mock', () => {
  beforeEach(() => {
    resetSubscribers();
  });

  it('TC0001 - Should connect without throwing', async () => {
    await expect(connectRabbitMQ()).resolves.toBeUndefined();
  });

  it('TC0002 - Should publish event to subscribers', async () => {
    const handler = jest.fn();
    await subscribeEvent('topic.created', handler);

    const payload = { id: '1' };
    await publishEvent('topic.created', payload);

    expect(handler).toHaveBeenCalledWith(payload);
  });

  it('TC0003 - Should swallow subscriber errors and continue', async () => {
    const failing = jest.fn().mockRejectedValue(new Error('boom'));
    const ok = jest.fn();

    await subscribeEvent('topic.error', failing);
    await subscribeEvent('topic.error', ok);

    await expect(publishEvent('topic.error', { ok: true })).resolves.toBeUndefined();
    expect(failing).toHaveBeenCalled();
    expect(ok).toHaveBeenCalled();
  });

  it('TC0004 - Should reset subscribers', async () => {
    const handler = jest.fn();
    await subscribeEvent('topic.reset', handler);

    resetSubscribers();
    await publishEvent('topic.reset', { id: 2 });

    expect(handler).not.toHaveBeenCalled();
  });
});
