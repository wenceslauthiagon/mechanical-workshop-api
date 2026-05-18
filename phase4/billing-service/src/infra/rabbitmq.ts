// Mock local RabbitMQ implementation
// This allows local development without RabbitMQ broker
// In production, replace with real amqplib: https://github.com/amqplib/amqplib

import { BillingEventPayload, BillingTopicPayloadMap } from './events';

const subscribers = new Map<string, Set<(payload: BillingEventPayload) => Promise<void>>>();

export async function connectRabbitMQ(): Promise<void> {
  // no-op for local mock
}

export async function publishEvent<TTopic extends Extract<keyof BillingTopicPayloadMap, string>>(topic: TTopic, payload: BillingTopicPayloadMap[TTopic]): Promise<void> {
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

export async function subscribeEvent<TTopic extends Extract<keyof BillingTopicPayloadMap, string>>(
  topic: TTopic,
  handler: (payload: BillingTopicPayloadMap[TTopic]) => Promise<void>,
): Promise<void> {
  if (!subscribers.has(topic)) {
    subscribers.set(topic, new Set());
  }
  const topicSubscribers = subscribers.get(topic);
  if (topicSubscribers) {
    topicSubscribers.add(async (payload: BillingEventPayload) => handler(payload as BillingTopicPayloadMap[TTopic]));
  }
}

// For testing: reset state
export function resetSubscribers(): void {
  subscribers.clear();
}
