type Handler = (payload: any) => void;

export class EventBus {
  private readonly handlers = new Map<string, Handler[]>();

  on(topic: string, handler: Handler): void {
    const current = this.handlers.get(topic) ?? [];
    current.push(handler);
    this.handlers.set(topic, current);
  }

  emit(topic: string, payload: any): void {
    const current = this.handlers.get(topic) ?? [];
    current.forEach((h) => h(payload));
  }
}
