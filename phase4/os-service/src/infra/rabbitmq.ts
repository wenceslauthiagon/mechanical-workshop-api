// RabbitMQ Event Bus - Mock local (substitua pela real em prod)
// Em produção, importar amqplib e conectar de verdade

import { OsEventPayload, OsTopicPayloadMap } from './events';

type EventHandler = (payload: OsEventPayload) => void | Promise<void>;

const handlers = new Map<string, EventHandler[]>();

export async function connectRabbitMQ() {
  // no-op for local mock
}

export async function publishEvent<TTopic extends Extract<keyof OsTopicPayloadMap, string>>(topic: TTopic, payload: OsTopicPayloadMap[TTopic]) {
  const topicHandlers = handlers.get(topic) || [];
  for (const handler of topicHandlers) {
    try {
      await Promise.resolve(handler(payload));
    } catch {
      // ignore handler errors in local mock to preserve publisher flow
    }
  }
}

export async function subscribeEvent<TTopic extends Extract<keyof OsTopicPayloadMap, string>>(
  topic: TTopic,
  handler: (payload: OsTopicPayloadMap[TTopic]) => void | Promise<void>,
) {
  if (!handlers.has(topic)) {
    handlers.set(topic, []);
  }
  const topicHandlers = handlers.get(topic);
  if (topicHandlers) {
    topicHandlers.push((payload: OsEventPayload) => handler(payload as OsTopicPayloadMap[TTopic]));
  }
}

export function resetSubscribers() {
  handlers.clear();
}
