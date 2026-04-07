import { connectRabbitMQ, publishEvent, subscribeEvent, resetSubscribers } from '../../src/infra/rabbitmq';

describe('RabbitMQ Mock', () => {
  beforeEach(() => {
    resetSubscribers();
  });

  it('TC0001 - Should connect without throwing', async () => {
    await expect(connectRabbitMQ()).resolves.toBeUndefined();
  });

  it('TC0002 - Should publish payload to subscribed handlers', async () => {
    const handler = jest.fn();
    await subscribeEvent('topic.ok', handler);

    await publishEvent('topic.ok', { id: 1 });

    expect(handler).toHaveBeenCalledWith({ id: 1 });
  });

  it('TC0003 - Should swallow handler errors and continue', async () => {
    const fail = jest.fn().mockImplementation(() => {
      throw new Error('boom');
    });
    const ok = jest.fn();

    await subscribeEvent('topic.err', fail);
    await subscribeEvent('topic.err', ok);

    await expect(publishEvent('topic.err', { x: true })).resolves.toBeUndefined();
    expect(fail).toHaveBeenCalled();
    expect(ok).toHaveBeenCalled();
  });

  it('TC0004 - Should clear handlers on reset', async () => {
    const handler = jest.fn();
    await subscribeEvent('topic.reset', handler);

    resetSubscribers();
    await publishEvent('topic.reset', { id: 2 });

    expect(handler).not.toHaveBeenCalled();
  });
});
