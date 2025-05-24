export type EventListener = (...args: any[]) => void;

export class EventEmitter {
  private events: Map<string, EventListener[]> = new Map();
  private maxListeners: number = 10;

  constructor() {
    this.events = new Map();
  }

  /**
   * 添加事件监听器
   */
  on(event: string, listener: EventListener): this {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const listeners = this.events.get(event)!;
    
    // 检查最大监听器数量
    if (listeners.length >= this.maxListeners) {
      console.warn(`[EventEmitter] Maximum listeners (${this.maxListeners}) exceeded for event "${event}"`);
    }

    listeners.push(listener);
    return this;
  }

  /**
   * 添加一次性事件监听器
   */
  once(event: string, listener: EventListener): this {
    const onceWrapper = (...args: any[]) => {
      this.off(event, onceWrapper);
      listener(...args);
    };

    return this.on(event, onceWrapper);
  }

  /**
   * 移除事件监听器
   */
  off(event: string, listener: EventListener): this {
    const listeners = this.events.get(event);
    if (!listeners) return this;

    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }

    // 如果没有监听器了，删除事件
    if (listeners.length === 0) {
      this.events.delete(event);
    }

    return this;
  }

  /**
   * 移除所有事件监听器
   */
  removeAllListeners(event?: string): this {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    return this;
  }

  /**
   * 触发事件
   */
  emit(event: string, ...args: any[]): boolean {
    const listeners = this.events.get(event);
    if (!listeners || listeners.length === 0) {
      return false;
    }

    // 复制监听器数组，避免在执行过程中被修改
    const listenersToCall = [...listeners];

    for (const listener of listenersToCall) {
      try {
        listener(...args);
      } catch (error) {
        console.error(`[EventEmitter] Error in event listener for "${event}":`, error);
      }
    }

    return true;
  }

  /**
   * 获取事件的监听器数量
   */
  listenerCount(event: string): number {
    const listeners = this.events.get(event);
    return listeners ? listeners.length : 0;
  }

  /**
   * 获取事件的所有监听器
   */
  listeners(event: string): EventListener[] {
    const listeners = this.events.get(event);
    return listeners ? [...listeners] : [];
  }

  /**
   * 获取所有事件名称
   */
  eventNames(): string[] {
    return Array.from(this.events.keys());
  }

  /**
   * 设置最大监听器数量
   */
  setMaxListeners(n: number): this {
    this.maxListeners = n;
    return this;
  }

  /**
   * 获取最大监听器数量
   */
  getMaxListeners(): number {
    return this.maxListeners;
  }

  /**
   * 在开头添加监听器
   */
  prependListener(event: string, listener: EventListener): this {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const listeners = this.events.get(event)!;
    listeners.unshift(listener);
    return this;
  }

  /**
   * 在开头添加一次性监听器
   */
  prependOnceListener(event: string, listener: EventListener): this {
    const onceWrapper = (...args: any[]) => {
      this.off(event, onceWrapper);
      listener(...args);
    };

    return this.prependListener(event, onceWrapper);
  }
}
