import type { EventBusEvents, MicroAppMessage } from '@enterprise/shared-types';

type EventCallback<T = any> = (data: T) => void;

export class EventBus {
  private events = new Map<string, Set<EventCallback>>();

  /**
   * 订阅事件
   */
  on<K extends keyof EventBusEvents>(
    event: K,
    callback: EventCallback<EventBusEvents[K]>
  ): () => void;
  on(event: string, callback: EventCallback): () => void;
  on(event: string, callback: EventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    
    this.events.get(event)!.add(callback);
    
    // 返回取消订阅函数
    return () => {
      this.off(event, callback);
    };
  }

  /**
   * 取消订阅事件
   */
  off<K extends keyof EventBusEvents>(
    event: K,
    callback?: EventCallback<EventBusEvents[K]>
  ): void;
  off(event: string, callback?: EventCallback): void;
  off(event: string, callback?: EventCallback): void {
    const callbacks = this.events.get(event);
    if (!callbacks) return;

    if (callback) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.events.delete(event);
      }
    } else {
      this.events.delete(event);
    }
  }

  /**
   * 发布事件
   */
  emit<K extends keyof EventBusEvents>(
    event: K,
    data: EventBusEvents[K]
  ): void;
  emit(event: string, data?: any): void;
  emit(event: string, data?: any): void {
    const callbacks = this.events.get(event);
    if (!callbacks) return;

    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[EventBus] Error in event callback for ${event}:`, error);
      }
    });
  }

  /**
   * 一次性订阅事件
   */
  once<K extends keyof EventBusEvents>(
    event: K,
    callback: EventCallback<EventBusEvents[K]>
  ): () => void;
  once(event: string, callback: EventCallback): () => void;
  once(event: string, callback: EventCallback): () => void {
    const onceCallback = (data: any) => {
      callback(data);
      this.off(event, onceCallback);
    };
    
    return this.on(event, onceCallback);
  }

  /**
   * 清除所有事件监听器
   */
  clear(): void {
    this.events.clear();
  }

  /**
   * 获取事件监听器数量
   */
  listenerCount(event: string): number {
    return this.events.get(event)?.size || 0;
  }

  /**
   * 获取所有事件名称
   */
  eventNames(): string[] {
    return Array.from(this.events.keys());
  }
}

/**
 * 微应用间通信类
 */
export class MicroAppCommunication {
  private eventBus: EventBus;
  private appName: string;

  constructor(appName: string) {
    this.appName = appName;
    this.eventBus = new EventBus();
    this.initWindowEventListener();
  }

  /**
   * 初始化window事件监听
   */
  private initWindowEventListener() {
    window.addEventListener('message', this.handleWindowMessage);
  }

  /**
   * 处理window消息
   */
  private handleWindowMessage = (event: MessageEvent<MicroAppMessage>) => {
    const { data } = event;
    
    // 验证消息格式
    if (!data || typeof data !== 'object' || !data.type) {
      return;
    }

    // 检查目标应用
    if (data.target && data.target !== this.appName) {
      return;
    }

    // 触发本地事件
    this.eventBus.emit(data.type, data.payload);
  };

  /**
   * 发送消息到其他微应用
   */
  sendMessage(type: string, payload: any, target?: string) {
    const message: MicroAppMessage = {
      type,
      payload,
      source: this.appName,
      target,
    };

    // 发送到window
    window.postMessage(message, '*');
    
    // 也发送到父窗口（如果存在）
    if (window.parent !== window) {
      window.parent.postMessage(message, '*');
    }
  }

  /**
   * 订阅消息
   */
  subscribe<T = any>(type: string, callback: EventCallback<T>): () => void {
    return this.eventBus.on(type, callback);
  }

  /**
   * 取消订阅消息
   */
  unsubscribe(type: string, callback?: EventCallback): void {
    this.eventBus.off(type, callback);
  }

  /**
   * 一次性订阅消息
   */
  subscribeOnce<T = any>(type: string, callback: EventCallback<T>): () => void {
    return this.eventBus.once(type, callback);
  }

  /**
   * 销毁通信实例
   */
  destroy() {
    window.removeEventListener('message', this.handleWindowMessage);
    this.eventBus.clear();
  }
}

// 导出全局事件总线实例
export const globalEventBus = new EventBus();
