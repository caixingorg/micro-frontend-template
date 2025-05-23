interface HotReloadConfig {
  enabled: boolean;
  port: number;
  protocol: 'ws' | 'wss';
  reconnectInterval: number;
  maxReconnectAttempts: number;
  onReload?: () => void;
  onError?: (error: Error) => void;
}

interface HotReloadMessage {
  type: 'reload' | 'update' | 'error' | 'connected';
  data?: any;
  timestamp: number;
}

export class HotReloadManager {
  private static instance: HotReloadManager;
  private config: HotReloadConfig;
  private ws?: WebSocket;
  private reconnectAttempts: number = 0;
  private reconnectTimer?: number;
  private isConnected: boolean = false;

  private constructor() {
    this.config = {
      enabled: process.env.NODE_ENV === 'development',
      port: 8080,
      protocol: 'ws',
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
    };

    if (this.config.enabled) {
      this.init();
    }
  }

  public static getInstance(): HotReloadManager {
    if (!HotReloadManager.instance) {
      HotReloadManager.instance = new HotReloadManager();
    }
    return HotReloadManager.instance;
  }

  public configure(config: Partial<HotReloadConfig>) {
    this.config = { ...this.config, ...config };
    
    if (this.config.enabled && !this.isConnected) {
      this.connect();
    } else if (!this.config.enabled && this.isConnected) {
      this.disconnect();
    }
  }

  private init() {
    this.connect();
    this.setupPageVisibilityHandler();
    this.setupBeforeUnloadHandler();
  }

  private connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    const url = `${this.config.protocol}://localhost:${this.config.port}/hot-reload`;
    
    try {
      this.ws = new WebSocket(url);
      this.setupWebSocketHandlers();
    } catch (error) {
      console.warn('[HotReload] Failed to connect:', error);
      this.scheduleReconnect();
    }
  }

  private setupWebSocketHandlers() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('[HotReload] Connected to hot reload server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // 发送连接确认
      this.send({
        type: 'connected',
        timestamp: Date.now(),
      });
    };

    this.ws.onmessage = (event) => {
      try {
        const message: HotReloadMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('[HotReload] Failed to parse message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('[HotReload] Connection closed:', event.code, event.reason);
      this.isConnected = false;
      
      if (event.code !== 1000) { // 非正常关闭
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('[HotReload] WebSocket error:', error);
      this.config.onError?.(new Error('WebSocket connection error'));
    };
  }

  private handleMessage(message: HotReloadMessage) {
    switch (message.type) {
      case 'reload':
        this.handleReload(message.data);
        break;
      case 'update':
        this.handleUpdate(message.data);
        break;
      case 'error':
        this.handleError(message.data);
        break;
      default:
        console.log('[HotReload] Unknown message type:', message.type);
    }
  }

  private handleReload(data: any) {
    console.log('[HotReload] Reloading application...');
    
    // 触发自定义重载逻辑
    if (this.config.onReload) {
      this.config.onReload();
    } else {
      // 默认重载页面
      window.location.reload();
    }
  }

  private handleUpdate(data: any) {
    console.log('[HotReload] Hot update received:', data);
    
    // 处理模块热更新
    if (data.type === 'css') {
      this.updateCSS(data.url);
    } else if (data.type === 'js') {
      this.updateJS(data.url);
    } else if (data.type === 'micro-app') {
      this.updateMicroApp(data.name);
    }
  }

  private handleError(data: any) {
    console.error('[HotReload] Server error:', data);
    this.config.onError?.(new Error(data.message || 'Hot reload server error'));
  }

  private updateCSS(url: string) {
    // 更新CSS文件
    const links = document.querySelectorAll(`link[href*="${url}"]`);
    links.forEach(link => {
      const newLink = link.cloneNode() as HTMLLinkElement;
      newLink.href = `${url}?t=${Date.now()}`;
      newLink.onload = () => link.remove();
      link.parentNode?.insertBefore(newLink, link.nextSibling);
    });
  }

  private updateJS(url: string) {
    // 对于JS文件，通常需要重载整个页面或模块
    console.log('[HotReload] JS file changed, triggering reload:', url);
    
    // 检查是否是微应用的JS文件
    if (this.isMicroAppScript(url)) {
      this.reloadMicroApp(url);
    } else {
      // 主应用JS变化，重载页面
      window.location.reload();
    }
  }

  private updateMicroApp(name: string) {
    // 重载特定微应用
    console.log('[HotReload] Reloading micro app:', name);
    
    // 触发微应用重载事件
    window.dispatchEvent(new CustomEvent('micro-app-hot-reload', {
      detail: { name }
    }));
  }

  private isMicroAppScript(url: string): boolean {
    // 检查URL是否属于微应用
    const microAppPorts = [3001, 3002, 3003]; // 微应用端口
    return microAppPorts.some(port => url.includes(`:${port}`));
  }

  private reloadMicroApp(url: string) {
    // 根据URL确定微应用名称并重载
    const appName = this.extractAppNameFromUrl(url);
    if (appName) {
      this.updateMicroApp(appName);
    }
  }

  private extractAppNameFromUrl(url: string): string | null {
    // 从URL中提取微应用名称
    if (url.includes(':3001')) return 'react-micro-app';
    if (url.includes(':3002')) return 'vue3-micro-app';
    return null;
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.warn('[HotReload] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`[HotReload] Reconnecting in ${this.config.reconnectInterval}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimer = window.setTimeout(() => {
      this.connect();
    }, this.config.reconnectInterval);
  }

  private setupPageVisibilityHandler() {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && !this.isConnected && this.config.enabled) {
        // 页面重新可见时尝试重连
        this.connect();
      }
    });
  }

  private setupBeforeUnloadHandler() {
    window.addEventListener('beforeunload', () => {
      this.disconnect();
    });
  }

  private send(message: HotReloadMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  public disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = undefined;
    }

    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  public getStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      config: this.config,
    };
  }

  // 手动触发重载
  public triggerReload() {
    this.send({
      type: 'reload',
      timestamp: Date.now(),
    });
  }

  // 注册微应用热更新处理器
  public registerMicroAppHandler(name: string, handler: () => void) {
    window.addEventListener('micro-app-hot-reload', (event: any) => {
      if (event.detail.name === name) {
        handler();
      }
    });
  }

  public destroy() {
    this.disconnect();
  }
}

// 导出单例
export const hotReloadManager = HotReloadManager.getInstance();
