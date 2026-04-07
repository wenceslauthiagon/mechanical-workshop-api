// Mock local RabbitMQ implementation
// This allows local development without RabbitMQ broker
// In production, replace with real amqplib: https://github.com/amqplib/amqplib

const subscribers = new Map<string, Set<Function>>();

export async function connectRabbitMQ(): Promise<void> {
  console.log('[EXECUTION] Connected to event bus (local mock)');
}

export async function publishEvent(topic: string, payload: any): Promise<void> {
  console.log(`[EXECUTION] 📤 Publishing event: ${topic}`, payload);
  
  // Simular delay
  await new Promise(resolve => setTimeout(resolve, 10));
  
  // Emitir para subscribers
  const handlers = subscribers.get(topic);
  if (handlers) {
    for (const handler of handlers) {
      try {
        await handler(payload);
      } catch (error) {
        console.error(`[EXECUTION] ❌ Handler error for ${topic}:`, error);
      }
    }
  }
}

export async function subscribeEvent(topic: string, handler: (payload: any) => Promise<void>): Promise<void> {
  if (!subscribers.has(topic)) {
    subscribers.set(topic, new Set());
  }
  subscribers.get(topic)!.add(handler);
  console.log(`[EXECUTION] 📬 Subscribed to: ${topic}`);
}

// For testing: reset state
export function resetSubscribers(): void {
  subscribers.clear();
}
