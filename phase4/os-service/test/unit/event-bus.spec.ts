import { EventBus } from '../../src/infra/event-bus';

describe('EventBus', () => {
  it('TC0001 - Should register and emit handler', () => {
    const bus = new EventBus();
    const handler = jest.fn();

    bus.on('topic.created', handler);
    bus.emit('topic.created', { id: 1 });

    expect(handler).toHaveBeenCalledWith({ id: 1 });
  });

  it('TC0002 - Should support multiple handlers for same topic', () => {
    const bus = new EventBus();
    const h1 = jest.fn();
    const h2 = jest.fn();

    bus.on('topic.updated', h1);
    bus.on('topic.updated', h2);

    bus.emit('topic.updated', { ok: true });

    expect(h1).toHaveBeenCalled();
    expect(h2).toHaveBeenCalled();
  });

  it('TC0003 - Should do nothing when topic has no handlers', () => {
    const bus = new EventBus();
    expect(() => bus.emit('topic.none', { x: 1 })).not.toThrow();
  });
});
