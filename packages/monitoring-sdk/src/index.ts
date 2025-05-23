// 错误监控
export { ErrorTracker, errorTracker } from './error/ErrorTracker';
export type { ErrorInfo, ErrorTrackerConfig } from './error/ErrorTracker';

// 性能监控
export { PerformanceMonitor, performanceMonitor } from './performance/PerformanceMonitor';
export type { PerformanceMetrics, PerformanceConfig } from './performance/PerformanceMonitor';

// 用户分析
export { UserAnalytics, userAnalytics } from './analytics/UserAnalytics';
export type { 
  UserEvent, 
  PageView, 
  UserSession, 
  AnalyticsConfig 
} from './analytics/UserAnalytics';

// 工具类
export { EventEmitter } from './utils/EventEmitter';

// 统一监控管理器
export class MonitoringManager {
  private static instance: MonitoringManager;
  
  public errorTracker: ErrorTracker;
  public performanceMonitor: PerformanceMonitor;
  public userAnalytics: UserAnalytics;

  private constructor() {
    this.errorTracker = errorTracker;
    this.performanceMonitor = performanceMonitor;
    this.userAnalytics = userAnalytics;
  }

  public static getInstance(): MonitoringManager {
    if (!MonitoringManager.instance) {
      MonitoringManager.instance = new MonitoringManager();
    }
    return MonitoringManager.instance;
  }

  public init(config: {
    error?: Partial<ErrorTrackerConfig>;
    performance?: Partial<PerformanceConfig>;
    analytics?: Partial<AnalyticsConfig>;
  } = {}) {
    // 重新初始化各个监控模块
    if (config.error) {
      this.errorTracker = new ErrorTracker(config.error);
    }
    
    if (config.performance) {
      this.performanceMonitor = new PerformanceMonitor(config.performance);
    }
    
    if (config.analytics) {
      this.userAnalytics = new UserAnalytics(config.analytics);
    }

    // 设置模块间的联动
    this.setupIntegrations();
  }

  private setupIntegrations() {
    // 错误发生时记录用户行为
    this.errorTracker.on('error', (error) => {
      this.userAnalytics.trackEvent({
        type: 'error',
        category: 'system',
        action: 'error_occurred',
        label: error.message,
        properties: {
          severity: error.severity,
          microApp: error.microApp,
        },
      });
    });

    // 性能问题时记录事件
    this.performanceMonitor.on('longTask', (task) => {
      this.userAnalytics.trackEvent({
        type: 'performance',
        category: 'system',
        action: 'long_task',
        value: task.duration,
        properties: {
          startTime: task.startTime,
        },
      });
    });

    // 微应用性能监控
    this.performanceMonitor.on('microAppPerformance', (data) => {
      this.userAnalytics.trackEvent({
        type: 'performance',
        category: 'micro_app',
        action: data.phase,
        label: data.name,
        value: data.duration,
        microApp: data.name,
      });
    });
  }

  public setUser(userId: string) {
    this.errorTracker.setUser(userId);
    this.userAnalytics.setUserId(userId);
  }

  public setMicroApp(microApp: string) {
    this.errorTracker.setMicroApp(microApp);
    this.userAnalytics.setMicroApp(microApp);
  }

  public destroy() {
    this.errorTracker.removeAllListeners();
    this.performanceMonitor.destroy();
    this.userAnalytics.destroy();
  }
}

// 导出单例
export const monitoringManager = MonitoringManager.getInstance();
