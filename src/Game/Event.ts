export interface EventPower<EventName> {
  on(name: EventName, handler: Function): void;
  off(name: EventName, handler: Function): void;
  emit(name: EventName, payload: any): void;
}

export default class Event<EventName = string> implements EventPower<EventName> {
  #event_handlers = new Map<EventName, Set<Function>>();

  on(name: EventName, handler: Function) {
    if (!this.#event_handlers.has(name)) {
      this.#event_handlers.set(name, new Set());
    }
    const handlers = this.#event_handlers.get(name)!;
    handlers.add(handler);
  }

  off(name: EventName, handler?: Function) {
    const handlerSet = this.#event_handlers.get(name);
    if (handlerSet) {
      if (handler) {
        handlerSet.delete(handler);
      } else {
        handlerSet.clear();
      }
    }
  }

  emit(name: EventName, payload: any) {
    const handlerSet = this.#event_handlers.get(name);
    if (handlerSet) {
      handlerSet.forEach(handler => handler(payload));
    }
  }
}
