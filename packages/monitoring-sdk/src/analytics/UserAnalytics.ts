import { EventEmitter } from '../utils/EventEmitter';

export interface UserEvent {
  type: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  userId?: string;
  sessionId: string;
  microApp?: string;
  properties?: Record<string, any>;
}

export interface PageView {
  path: string;
  title: string;
  referrer: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  microApp?: string;
  duration?: number;
}

export interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: number;
  endTime?: number;
  pageViews: PageView[];
  events: UserEvent[];
  microApps: string[];
  deviceInfo: {
    userAgent: string;
    screen: string;
    language: string;
    timezone: string;
  };
}

export interface AnalyticsConfig {
  trackingId?: string;
  endpoint?: string;
  enableAutoPageTracking: boolean;
  enableAutoEventTracking: boolean;
  enableHeatmap: boolean;
  sessionTimeout: number; // 会话超时时间（毫秒）
  batchSize: number;
  flushInterval: number; // 批量发送间隔（毫秒）
}

export class UserAnalytics extends EventEmitter {
  private config: AnalyticsConfig;
  private session: UserSession;
  private eventQueue: UserEvent[] = [];
  private pageViewQueue: PageView[] = [];
  private currentPageView?: PageView;
  private flushTimer?: number;
  private sessionTimer?: number;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    super();
    
    this.config = {
      enableAutoPageTracking: true,
      enableAutoEventTracking: true,
      enableHeatmap: false,
      sessionTimeout: 30 * 60 * 1000, // 30分钟
      batchSize: 20,
      flushInterval: 10000, // 10秒
      ...config,
    };

    this.session = this.createSession();
    this.init();
  }

  private init() {
    // 自动页面跟踪
    if (this.config.enableAutoPageTracking) {
      this.setupAutoPageTracking();
    }

    // 自动事件跟踪
    if (this.config.enableAutoEventTracking) {
      this.setupAutoEventTracking();
    }

    // 热力图
    if (this.config.enableHeatmap) {
      this.setupHeatmap();
    }

    // 页面可见性变化
    this.setupVisibilityTracking();

    // 定期发送数据
    this.startBatchFlush();

    // 会话管理
    this.startSessionManagement();

    // 页面卸载时发送数据
    this.setupBeforeUnload();
  }

  private createSession(): UserSession {
    const sessionId = this.generateSessionId();
    
    return {
      sessionId,
      startTime: Date.now(),
      pageViews: [],
      events: [],
      microApps: [],
      deviceInfo: {
        userAgent: navigator.userAgent,
        screen: `${screen.width}x${screen.height}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };
  }

  private setupAutoPageTracking() {
    // 初始页面视图
    this.trackPageView();

    // 监听路由变化（适用于SPA）
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      setTimeout(() => this.trackPageView(), 0);
    };

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      setTimeout(() => this.trackPageView(), 0);
    };

    window.addEventListener('popstate', () => {
      setTimeout(() => this.trackPageView(), 0);
    });
  }

  private setupAutoEventTracking() {
    // 点击事件
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      
      // 跟踪按钮和链接点击
      if (tagName === 'button' || tagName === 'a') {
        this.trackEvent({
          type: 'click',
          category: 'interaction',
          action: 'click',
          label: target.textContent?.trim() || target.getAttribute('aria-label') || tagName,
          properties: {
            tagName,
            className: target.className,
            id: target.id,
            href: (target as HTMLAnchorElement).href,
          },
        });
      }
    }, { passive: true });

    // 表单提交
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.trackEvent({
        type: 'form',
        category: 'interaction',
        action: 'submit',
        label: form.name || form.id || 'form',
        properties: {
          action: form.action,
          method: form.method,
        },
      });
    }, { passive: true });

    // 滚动事件（节流）
    let scrollTimer: number;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        const scrollPercent = Math.round(
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );
        
        if (scrollPercent > 0 && scrollPercent % 25 === 0) {
          this.trackEvent({
            type: 'scroll',
            category: 'engagement',
            action: 'scroll',
            label: `${scrollPercent}%`,
            value: scrollPercent,
          });
        }
      }, 250);
    }, { passive: true });
  }

  private setupHeatmap() {
    // 简单的点击热力图
    document.addEventListener('click', (event) => {
      const x = event.clientX;
      const y = event.clientY;
      const element = event.target as HTMLElement;
      
      this.trackEvent({
        type: 'heatmap',
        category: 'heatmap',
        action: 'click',
        properties: {
          x,
          y,
          elementPath: this.getElementPath(element),
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
        },
      });
    }, { passive: true });
  }

  private setupVisibilityTracking() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // 页面隐藏，结束当前页面视图
        if (this.currentPageView) {
          this.currentPageView.duration = Date.now() - this.currentPageView.timestamp;
        }
        
        this.trackEvent({
          type: 'visibility',
          category: 'engagement',
          action: 'hidden',
        });
      } else {
        // 页面显示
        this.trackEvent({
          type: 'visibility',
          category: 'engagement',
          action: 'visible',
        });
      }
    });
  }

  private startBatchFlush() {
    this.flushTimer = window.setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private startSessionManagement() {
    // 重置会话超时
    const resetSessionTimeout = () => {
      if (this.sessionTimer) {
        clearTimeout(this.sessionTimer);
      }
      
      this.sessionTimer = window.setTimeout(() => {
        this.endSession();
        this.session = this.createSession();
      }, this.config.sessionTimeout);
    };

    // 用户活动时重置超时
    ['click', 'keydown', 'scroll', 'mousemove'].forEach(eventType => {
      document.addEventListener(eventType, resetSessionTimeout, { passive: true });
    });

    resetSessionTimeout();
  }

  private setupBeforeUnload() {
    window.addEventListener('beforeunload', () => {
      this.endSession();
      this.flush(true); // 强制同步发送
    });
  }

  public trackPageView(path?: string, title?: string) {
    // 结束上一个页面视图
    if (this.currentPageView) {
      this.currentPageView.duration = Date.now() - this.currentPageView.timestamp;
      this.pageViewQueue.push(this.currentPageView);
      this.session.pageViews.push(this.currentPageView);
    }

    // 创建新的页面视图
    this.currentPageView = {
      path: path || window.location.pathname,
      title: title || document.title,
      referrer: document.referrer,
      timestamp: Date.now(),
      userId: this.session.userId,
      sessionId: this.session.sessionId,
    };

    this.emit('pageView', this.currentPageView);
  }

  public trackEvent(event: Partial<UserEvent>) {
    const fullEvent: UserEvent = {
      type: event.type || 'custom',
      category: event.category || 'general',
      action: event.action || 'action',
      label: event.label,
      value: event.value,
      timestamp: Date.now(),
      userId: this.session.userId,
      sessionId: this.session.sessionId,
      microApp: event.microApp,
      properties: event.properties,
    };

    this.eventQueue.push(fullEvent);
    this.session.events.push(fullEvent);

    this.emit('event', fullEvent);

    // 如果队列满了，立即发送
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  public setUserId(userId: string) {
    this.session.userId = userId;
  }

  public setMicroApp(microApp: string) {
    if (!this.session.microApps.includes(microApp)) {
      this.session.microApps.push(microApp);
    }
    
    // 为后续事件添加微应用标识
    const originalTrackEvent = this.trackEvent.bind(this);
    this.trackEvent = (event: Partial<UserEvent>) => {
      originalTrackEvent({ ...event, microApp });
    };
  }

  public flush(sync: boolean = false) {
    if (this.eventQueue.length === 0 && this.pageViewQueue.length === 0) {
      return;
    }

    const data = {
      events: [...this.eventQueue],
      pageViews: [...this.pageViewQueue],
      session: this.session,
      timestamp: Date.now(),
    };

    // 清空队列
    this.eventQueue = [];
    this.pageViewQueue = [];

    // 发送数据
    if (this.config.endpoint) {
      const sendData = () => {
        fetch(this.config.endpoint!, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          keepalive: sync, // 页面卸载时保持连接
        }).catch(error => {
          console.error('[UserAnalytics] Failed to send data:', error);
        });
      };

      if (sync) {
        // 同步发送（页面卸载时）
        navigator.sendBeacon?.(
          this.config.endpoint,
          JSON.stringify(data)
        ) || sendData();
      } else {
        sendData();
      }
    }

    this.emit('flush', data);
  }

  private endSession() {
    this.session.endTime = Date.now();
    
    if (this.currentPageView) {
      this.currentPageView.duration = Date.now() - this.currentPageView.timestamp;
    }
  }

  private getElementPath(element: HTMLElement): string {
    const path = [];
    let current = element;
    
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      
      if (current.id) {
        selector += `#${current.id}`;
      } else if (current.className) {
        selector += `.${current.className.split(' ').join('.')}`;
      }
      
      path.unshift(selector);
      current = current.parentElement!;
    }
    
    return path.join(' > ');
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public getSession(): UserSession {
    return { ...this.session };
  }

  public destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }
    this.flush(true);
    this.removeAllListeners();
  }
}

// 单例实例
export const userAnalytics = new UserAnalytics();
