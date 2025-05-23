import { monitoringManager } from '@enterprise/monitoring-sdk';
import { devToolsManager } from '@enterprise/dev-tools';

// 监控配置
const monitoringConfig = {
  error: {
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.REACT_APP_VERSION || '1.0.0',
    enableConsoleCapture: true,
    enableUnhandledRejection: true,
    enableResourceError: true,
    beforeSend: (error: any) => {
      // 过滤掉一些不重要的错误
      if (error.message?.includes('Script error')) {
        return null;
      }
      return error;
    },
  },
  performance: {
    enableResourceTiming: true,
    enableUserTiming: true,
    enableLongTaskDetection: true,
    enableMemoryMonitoring: true,
    reportInterval: 30000,
    endpoint: process.env.REACT_APP_PERFORMANCE_ENDPOINT,
  },
  analytics: {
    trackingId: process.env.REACT_APP_ANALYTICS_ID,
    endpoint: process.env.REACT_APP_ANALYTICS_ENDPOINT,
    enableAutoPageTracking: true,
    enableAutoEventTracking: true,
    enableHeatmap: false,
    sessionTimeout: 30 * 60 * 1000,
  },
};

// 开发工具配置
const devToolsConfig = {
  devTools: process.env.NODE_ENV === 'development',
  hotReload: {
    enabled: process.env.NODE_ENV === 'development',
    port: 8080,
    reconnectInterval: 3000,
    onReload: () => {
      console.log('[DevTools] Application reloading...');
      // 可以在这里添加自定义重载逻辑
    },
  },
  mock: {
    enabled: process.env.REACT_APP_ENABLE_MOCK === 'true',
    logRequests: true,
    persistRules: true,
    addCommonRules: true,
  },
};

// 初始化监控
export function initMonitoring() {
  // 初始化监控管理器
  monitoringManager.init(monitoringConfig);
  
  // 设置用户信息（如果有的话）
  const userId = localStorage.getItem('userId');
  if (userId) {
    monitoringManager.setUser(userId);
  }
  
  // 监听用户登录事件
  window.addEventListener('user-login', (event: any) => {
    monitoringManager.setUser(event.detail.userId);
  });
  
  console.log('[Monitoring] Monitoring system initialized');
}

// 初始化开发工具
export function initDevTools() {
  if (process.env.NODE_ENV === 'development') {
    devToolsManager.init(devToolsConfig);
    console.log('[DevTools] Development tools initialized');
  }
}

// 跟踪微应用性能
export function trackMicroAppPerformance(name: string, phase: 'load' | 'mount' | 'unmount', startTime: number) {
  monitoringManager.performanceMonitor.trackMicroAppPerformance(name, phase, startTime);
  
  // 同时更新开发工具
  if (process.env.NODE_ENV === 'development') {
    devToolsManager.devTools.updateAppStatus(name, 
      phase === 'mount' ? 'mounted' : phase === 'load' ? 'loading' : 'unmounted',
      { [`${phase}Time`]: performance.now() - startTime }
    );
  }
}

// 跟踪用户行为
export function trackUserEvent(category: string, action: string, label?: string, value?: number) {
  monitoringManager.userAnalytics.trackEvent({
    type: 'custom',
    category,
    action,
    label,
    value,
  });
}

// 跟踪页面访问
export function trackPageView(path?: string, title?: string) {
  monitoringManager.userAnalytics.trackPageView(path, title);
}

// 错误上报
export function reportError(error: Error | string, extra?: any) {
  monitoringManager.errorTracker.captureError(error);
  
  if (extra) {
    console.error('[Error]', error, extra);
  }
}

// 性能标记
export function markPerformance(name: string, detail?: any) {
  monitoringManager.performanceMonitor.markUserTiming(name, detail);
}

// 性能测量
export function measurePerformance(name: string, startMark: string, endMark?: string) {
  return monitoringManager.performanceMonitor.measureUserTiming(name, startMark, endMark);
}

// 添加面包屑
export function addBreadcrumb(message: string, level: 'info' | 'warn' | 'error' = 'info') {
  monitoringManager.errorTracker.addBreadcrumb(message, level);
}

// 设置当前微应用
export function setCurrentMicroApp(name: string) {
  monitoringManager.setMicroApp(name);
  
  // 更新开发工具
  if (process.env.NODE_ENV === 'development') {
    devToolsManager.devTools.registerApp({
      name,
      status: 'loading',
      entry: getMicroAppEntry(name),
      container: `#${name}-container`,
      activeRule: `/${name}`,
    });
  }
}

// 获取微应用入口地址
function getMicroAppEntry(name: string): string {
  const entryMap: Record<string, string> = {
    'react-micro-app': process.env.REACT_APP_REACT_MICRO_APP_ENTRY || '//localhost:3001',
    'vue3-micro-app': process.env.REACT_APP_VUE3_MICRO_APP_ENTRY || '//localhost:3002',
  };
  
  return entryMap[name] || `//localhost:3001`;
}

// 清理监控资源
export function destroyMonitoring() {
  monitoringManager.destroy();
  
  if (process.env.NODE_ENV === 'development') {
    devToolsManager.destroy();
  }
}
