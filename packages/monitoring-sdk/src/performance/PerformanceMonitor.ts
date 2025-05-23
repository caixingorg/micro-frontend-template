import { EventEmitter } from '../utils/EventEmitter';

export interface PerformanceMetrics {
  // 页面加载性能
  pageLoad?: {
    domContentLoaded: number;
    loadComplete: number;
    firstPaint: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
  };
  
  // 资源加载性能
  resources?: Array<{
    name: string;
    type: string;
    duration: number;
    size: number;
    startTime: number;
  }>;
  
  // 微应用性能
  microApp?: {
    name: string;
    loadTime: number;
    mountTime: number;
    unmountTime: number;
  };
  
  // 用户交互性能
  interactions?: Array<{
    type: string;
    target: string;
    duration: number;
    timestamp: number;
  }>;
  
  // 内存使用
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

export interface PerformanceConfig {
  enableResourceTiming: boolean;
  enableUserTiming: boolean;
  enableLongTaskDetection: boolean;
  enableMemoryMonitoring: boolean;
  reportInterval: number; // 上报间隔（毫秒）
  endpoint?: string;
}

export class PerformanceMonitor extends EventEmitter {
  private config: PerformanceConfig;
  private metrics: PerformanceMetrics = {};
  private observer?: PerformanceObserver;
  private reportTimer?: number;

  constructor(config: Partial<PerformanceConfig> = {}) {
    super();
    
    this.config = {
      enableResourceTiming: true,
      enableUserTiming: true,
      enableLongTaskDetection: true,
      enableMemoryMonitoring: true,
      reportInterval: 30000, // 30秒
      ...config,
    };

    this.init();
  }

  private init() {
    // 监听页面加载完成
    if (document.readyState === 'complete') {
      this.collectPageLoadMetrics();
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => this.collectPageLoadMetrics(), 0);
      });
    }

    // 设置性能观察器
    this.setupPerformanceObserver();
    
    // 监听长任务
    if (this.config.enableLongTaskDetection) {
      this.setupLongTaskDetection();
    }

    // 监听用户交互
    this.setupInteractionMonitoring();

    // 定期上报
    this.startReporting();
  }

  private collectPageLoadMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    this.metrics.pageLoad = {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      largestContentfulPaint: 0, // 将通过observer获取
      firstInputDelay: 0, // 将通过observer获取
      cumulativeLayoutShift: 0, // 将通过observer获取
    };

    // 收集资源性能
    if (this.config.enableResourceTiming) {
      this.collectResourceMetrics();
    }

    // 收集内存信息
    if (this.config.enableMemoryMonitoring) {
      this.collectMemoryMetrics();
    }
  }

  private collectResourceMetrics() {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    this.metrics.resources = resources.map(resource => ({
      name: resource.name,
      type: this.getResourceType(resource),
      duration: resource.responseEnd - resource.startTime,
      size: resource.transferSize || 0,
      startTime: resource.startTime,
    }));
  }

  private collectMemoryMetrics() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memory = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
  }

  private setupPerformanceObserver() {
    if (!('PerformanceObserver' in window)) return;

    try {
      // 观察LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (this.metrics.pageLoad) {
          this.metrics.pageLoad.largestContentfulPaint = lastEntry.startTime;
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // 观察FID
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (this.metrics.pageLoad) {
            this.metrics.pageLoad.firstInputDelay = entry.processingStart - entry.startTime;
          }
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // 观察CLS
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        if (this.metrics.pageLoad) {
          this.metrics.pageLoad.cumulativeLayoutShift = clsValue;
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

    } catch (error) {
      console.warn('[PerformanceMonitor] PerformanceObserver not supported:', error);
    }
  }

  private setupLongTaskDetection() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.emit('longTask', {
            duration: entry.duration,
            startTime: entry.startTime,
          });
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.warn('[PerformanceMonitor] Long task detection not supported:', error);
    }
  }

  private setupInteractionMonitoring() {
    const interactionTypes = ['click', 'keydown', 'scroll'];
    
    interactionTypes.forEach(type => {
      document.addEventListener(type, (event) => {
        const startTime = performance.now();
        
        requestAnimationFrame(() => {
          const duration = performance.now() - startTime;
          
          if (!this.metrics.interactions) {
            this.metrics.interactions = [];
          }
          
          this.metrics.interactions.push({
            type,
            target: (event.target as Element)?.tagName || 'unknown',
            duration,
            timestamp: Date.now(),
          });

          // 保持最近100个交互记录
          if (this.metrics.interactions.length > 100) {
            this.metrics.interactions = this.metrics.interactions.slice(-100);
          }
        });
      }, { passive: true });
    });
  }

  public trackMicroAppPerformance(name: string, phase: 'load' | 'mount' | 'unmount', startTime: number) {
    const duration = performance.now() - startTime;
    
    if (!this.metrics.microApp) {
      this.metrics.microApp = { name, loadTime: 0, mountTime: 0, unmountTime: 0 };
    }

    switch (phase) {
      case 'load':
        this.metrics.microApp.loadTime = duration;
        break;
      case 'mount':
        this.metrics.microApp.mountTime = duration;
        break;
      case 'unmount':
        this.metrics.microApp.unmountTime = duration;
        break;
    }

    this.emit('microAppPerformance', { name, phase, duration });
  }

  public markUserTiming(name: string, detail?: any) {
    if (this.config.enableUserTiming) {
      performance.mark(name, { detail });
    }
  }

  public measureUserTiming(name: string, startMark: string, endMark?: string) {
    if (this.config.enableUserTiming) {
      try {
        const measure = performance.measure(name, startMark, endMark);
        this.emit('userTiming', {
          name,
          duration: measure.duration,
          startTime: measure.startTime,
        });
        return measure.duration;
      } catch (error) {
        console.warn('[PerformanceMonitor] Failed to measure user timing:', error);
      }
    }
    return 0;
  }

  private startReporting() {
    this.reportTimer = window.setInterval(() => {
      this.reportMetrics();
    }, this.config.reportInterval);
  }

  private reportMetrics() {
    const report = {
      ...this.metrics,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // 发送到性能监控服务
    if (this.config.endpoint) {
      fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      }).catch(error => {
        console.error('[PerformanceMonitor] Failed to report metrics:', error);
      });
    }

    this.emit('report', report);
  }

  private getResourceType(resource: PerformanceResourceTiming): string {
    const url = new URL(resource.name);
    const extension = url.pathname.split('.').pop()?.toLowerCase();
    
    if (['js', 'mjs'].includes(extension || '')) return 'script';
    if (['css'].includes(extension || '')) return 'stylesheet';
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extension || '')) return 'image';
    if (['woff', 'woff2', 'ttf', 'otf'].includes(extension || '')) return 'font';
    if (resource.name.includes('api') || resource.name.includes('xhr')) return 'xhr';
    
    return 'other';
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
    }
    this.removeAllListeners();
  }
}

// 单例实例
export const performanceMonitor = new PerformanceMonitor();
