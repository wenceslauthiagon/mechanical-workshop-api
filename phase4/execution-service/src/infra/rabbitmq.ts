// Mock local RabbitMQ implementation
// This allows local development without RabbitMQ broker
// In production, replace with real amqplib: https://github.com/amqplib/amqplib

import { ExecutionEventPayload, ExecutionTopicPayloadMap } from './events';

const subscribers = new Map<string, Set<(payload: ExecutionEventPayload) => Promise<void>>>();

export async function connectRabbitMQ(): Promise<void> {
  // no-op for local mock
}

export async function publishEvent<TTopic extends Extract<keyof ExecutionTopicPayloadMap, string>>(topic: TTopic, payload: ExecutionTopicPayloadMap[TTopic]): Promise<void> {
  // Simular delay
  await new Promise(resolve => setTimeout(resolve, 10));
  
  // Emitir para subscribers
  const handlers = subscribers.get(topic);
  if (handlers) {
    for (const handler of handlers) {
      await Promise.resolve(handler(payload)).catch(() => undefined);
    }
  }
}

export async function subscribeEvent<TTopic extends Extract<keyof ExecutionTopicPayloadMap, string>>(
  topic: TTopic,
  handler: (payload: ExecutionTopicPayloadMap[TTopic]) => Promise<void>,
): Promise<void> {
  if (!subscribers.has(topic)) {
    subscribers.set(topic, new Set());
  }
  const topicSubscribers = subscribers.get(topic);
  if (topicSubscribers) {
    topicSubscribers.add(async (payload: ExecutionEventPayload) => handler(payload as ExecutionTopicPayloadMap[TTopic]));
  }
}

// For testing: reset state
export function resetSubscribers(): void {
  subscribers.clear();
}
