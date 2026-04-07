// RabbitMQ Event Bus - Mock local (substitua pela real em prod)
// Em produção, importar amqplib e conectar de verdade

type EventHandler = (payload: any) => void | Promise<void>;

const handlers = new Map<string, EventHandler[]>();

export async function connectRabbitMQ() {
  console.log('✓ Event Bus (RabbitMQ mock) initialized');
}

export async function publishEvent(topic: string, payload: any) {
  console.log(`[PUBLISH] ${topic}:`, JSON.stringify(payload, null, 2));
  
  const topicHandlers = handlers.get(topic) || [];
  for (const handler of topicHandlers) {
    try {
      await handler(payload);
    } catch (error) {
      console.error(`Error in handler for ${topic}:`, error);
    }
  }
}

export async function subscribeEvent(topic: string, handler: EventHandler) {
  if (!handlers.has(topic)) {
    handlers.set(topic, []);
  }
  handlers.get(topic)!.push(handler);
  console.log(`[SUBSCRIBE] ${topic}`);
}

export function resetSubscribers() {
  handlers.clear();
}
