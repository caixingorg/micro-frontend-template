import { EventEmitter } from '../utils/EventEmitter';

export interface ErrorInfo {
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  timestamp: number;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId: string;
  microApp?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  tags?: Record<string, string>;
  extra?: Record<string, any>;
}

export interface ErrorTrackerConfig {
  dsn?: string;
  environment: string;
  release?: string;
  userId?: string;
  enableConsoleCapture: boolean;
  enableUnhandledRejection: boolean;
  enableResourceError: boolean;
  maxBreadcrumbs: number;
  beforeSend?: (error: ErrorInfo) => ErrorInfo | null;
}

export class ErrorTracker extends EventEmitter {
  private config: ErrorTrackerConfig;
  private breadcrumbs: Array<{ message: string; timestamp: number; level: string }> = [];
  private sessionId: string;

  constructor(config: Partial<ErrorTrackerConfig> = {}) {
    super();
    
    this.config = {
      environment: 'production',
      enableConsoleCapture: true,
      enableUnhandledRejection: true,
      enableResourceError: true,
      maxBreadcrumbs: 50,
      ...config,
    };

    this.sessionId = this.generateSessionId();
    this.init();
  }

  private init() {
    // 捕获JavaScript错误
    window.addEventListener('error', this.handleError.bind(this));
    
    // 捕获Promise rejection
    if (this.config.enableUnhandledRejection) {
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
    }

    // 捕获资源加载错误
    if (this.config.enableResourceError) {
      window.addEventListener('error', this.handleResourceError.bind(this), true);
    }

    // 捕获控制台错误
    if (this.config.enableConsoleCapture) {
      this.captureConsoleErrors();
    }
  }

  private handleError(event: ErrorEvent) {
    const errorInfo: ErrorInfo = {
      message: event.message,
      stack: event.error?.stack,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.config.userId,
      sessionId: this.sessionId,
      severity: 'high',
    };

    this.captureError(errorInfo);
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent) {
    const errorInfo: ErrorInfo = {
      message: `Unhandled Promise Rejection: ${event.reason}`,
      stack: event.reason?.stack,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.config.userId,
      sessionId: this.sessionId,
      severity: 'high',
    };

    this.captureError(errorInfo);
  }

  private handleResourceError(event: Event) {
    const target = event.target as HTMLElement;
    if (target && target !== window) {
      const errorInfo: ErrorInfo = {
        message: `Resource loading error: ${target.tagName}`,
        filename: (target as any).src || (target as any).href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.config.userId,
        sessionId: this.sessionId,
        severity: 'medium',
        tags: {
          resourceType: target.tagName.toLowerCase(),
        },
      };

      this.captureError(errorInfo);
    }
  }

  private captureConsoleErrors() {
    const originalError = console.error;
    console.error = (...args: any[]) => {
      const errorInfo: ErrorInfo = {
        message: `Console Error: ${args.join(' ')}`,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.config.userId,
        sessionId: this.sessionId,
        severity: 'medium',
      };

      this.captureError(errorInfo);
      originalError.apply(console, args);
    };
  }

  public captureError(error: ErrorInfo | Error | string) {
    let errorInfo: ErrorInfo;

    if (typeof error === 'string') {
      errorInfo = {
        message: error,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.config.userId,
        sessionId: this.sessionId,
        severity: 'medium',
      };
    } else if (error instanceof Error) {
      errorInfo = {
        message: error.message,
        stack: error.stack,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.config.userId,
        sessionId: this.sessionId,
        severity: 'high',
      };
    } else {
      errorInfo = error;
    }

    // 添加面包屑
    errorInfo.extra = {
      ...errorInfo.extra,
      breadcrumbs: this.breadcrumbs.slice(-10), // 最近10条面包屑
    };

    // 调用beforeSend钩子
    if (this.config.beforeSend) {
      const processedError = this.config.beforeSend(errorInfo);
      if (!processedError) return; // 如果返回null，则不发送
      errorInfo = processedError;
    }

    // 发送错误
    this.sendError(errorInfo);
    
    // 触发事件
    this.emit('error', errorInfo);
  }

  public addBreadcrumb(message: string, level: string = 'info') {
    this.breadcrumbs.push({
      message,
      timestamp: Date.now(),
      level,
    });

    // 保持面包屑数量在限制内
    if (this.breadcrumbs.length > this.config.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.config.maxBreadcrumbs);
    }
  }

  public setUser(userId: string) {
    this.config.userId = userId;
  }

  public setMicroApp(microApp: string) {
    // 为后续错误添加微应用标识
    const originalCaptureError = this.captureError.bind(this);
    this.captureError = (error: ErrorInfo | Error | string) => {
      if (typeof error === 'object' && 'message' in error) {
        error.microApp = microApp;
      }
      originalCaptureError(error);
    };
  }

  private sendError(errorInfo: ErrorInfo) {
    if (!this.config.dsn) {
      console.warn('[ErrorTracker] No DSN configured, error not sent:', errorInfo);
      return;
    }

    // 发送到错误监控服务
    fetch(this.config.dsn, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...errorInfo,
        environment: this.config.environment,
        release: this.config.release,
      }),
    }).catch(err => {
      console.error('[ErrorTracker] Failed to send error:', err);
    });
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 单例实例
export const errorTracker = new ErrorTracker();
