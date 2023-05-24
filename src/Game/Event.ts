export interface EventPower<EventName> {
    on(name: EventName, handler: Function): void;
    off(name: EventName, handler: Function): void;
    emit(name: EventName, payload: any): void;
}

export default class Event<EventName = string> implements EventPower<EventName> {
    #event_handlers = new Map<EventName, Function[]>();

    on(name: EventName, handler: Function) {
        if (!this.#event_handlers.has(name)) {
            this.#event_handlers.set(name, []);
        }
        const handlers = this.#event_handlers.get(name)!;
        handlers.push(handler);
    }

    off(name: EventName, handler: Function) {
        const handlers = this.#event_handlers.get(name);
        if (handlers) {
            if (handler) {
                handlers.splice(handlers.indexOf(handler) >>> 0, 1);
            } else {
                this.#event_handlers.set(name, []);
            }
        }
    }

    emit(name: EventName, payload: any) {
        const handlers = this.#event_handlers.get(name);
        if (handlers) {
            handlers.map((handler) => handler(payload));
        }
    }
}
