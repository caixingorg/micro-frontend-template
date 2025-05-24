// 导出主要类和实例
export { MicroAppManager, microAppManager } from './MicroAppManager';
export { EventBus, MicroAppCommunication, globalEventBus } from './EventBus';

// 导出预加载相关
export { PreloadManager, preloadManager } from './PreloadManager';
export { NetworkMonitor, networkMonitor } from './NetworkMonitor';
export { BehaviorAnalyzer, behaviorAnalyzer } from './BehaviorAnalyzer';

// 导出工具函数
export * from './utils';

// 导出样式工具函数（避免冲突）
export {
  ensureStyleContainer,
  getStyleContainer,
  getPopupContainer,
  initStyleEnvironment,
  cleanupStyleEnvironment,
  safeStyleInject
} from './styleUtils';

// 重新导出类型
export type * from '@enterprise/shared-types';
