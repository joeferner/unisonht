import { newNestedError } from "./NestedError";

export type Listener = (event: unknown) => Promise<void> | void;

export abstract class EventEmitter<T extends string> {
  private listeners: { [name: string]: Listener[] } = {};

  protected async emit(name: T, args: unknown): Promise<void> {
    const listeners = this.listeners[name] ?? [];
    for (const listener of listeners) {
      try {
        await listener(args);
      } catch (err) {
        throw newNestedError(`failed in call to listener for event ${name}`, err);
      }
    }
  }

  public on(name: T, listener: Listener): void {
    this.listeners[name] = this.listeners[name] ?? [];
    this.listeners[name].push(listener);
  }
}
