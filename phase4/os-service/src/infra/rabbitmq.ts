// RabbitMQ Event Bus - Mock local (substitua pela real em prod)
// Em produção, importar amqplib e conectar de verdade

type EventHandler = (payload: any) => void | Promise<void>;

const handlers = new Map<string, EventHandler[]>();

export async function connectRabbitMQ() {
  // no-op for local mock
}

export async function publishEvent(topic: string, payload: any) {
  void topic;
  void payload;
  const topicHandlers = handlers.get(topic) || [];
  for (const handler of topicHandlers) {
    try {
      await handler(payload);
    } catch (error) {
      void error;
    }
  }
}

export async function subscribeEvent(topic: string, handler: EventHandler) {
  if (!handlers.has(topic)) {
    handlers.set(topic, []);
  }
  handlers.get(topic)!.push(handler);
}

export function resetSubscribers() {
  handlers.clear();
}
