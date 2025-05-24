import { EventEmitter } from '@enterprise/shared-utils';
import type { UserBehavior } from '@enterprise/shared-types';

export class BehaviorAnalyzer extends EventEmitter {
  private behaviors: UserBehavior[] = [];
  private currentPath: string = '';
  private pathStartTime: number = 0;
  private maxHistorySize: number = 100;
  private predictionCache: Map<string, string[]> = new Map();
  private storageKey = 'micro-app-user-behaviors';

  constructor() {
    super();
    this.init();
  }

  private init() {
    // 加载历史行为数据
    this.loadBehaviorHistory();
    
    // 监听路由变化
    this.setupRouteTracking();
    
    // 初始化当前路径
    this.currentPath = window.location.pathname;
    this.pathStartTime = Date.now();
    
    // 页面卸载时保存数据
    window.addEventListener('beforeunload', () => {
      this.recordCurrentBehavior();
      this.saveBehaviorHistory();
    });

    // 页面可见性变化时记录行为
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.recordCurrentBehavior();
      } else {
        this.pathStartTime = Date.now();
      }
    });
  }

  private setupRouteTracking() {
    // 监听popstate事件（浏览器前进后退）
    window.addEventListener('popstate', () => {
      this.handleRouteChange();
    });

    // 重写pushState和replaceState方法
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.handleRouteChange();
    };

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      this.handleRouteChange();
    };
  }

  private handleRouteChange() {
    // 记录上一个路径的行为
    this.recordCurrentBehavior();
    
    // 更新当前路径
    const newPath = window.location.pathname;
    this.currentPath = newPath;
    this.pathStartTime = Date.now();
    
    // 触发路径变化事件
    this.emit('pathChange', newPath);
  }

  private recordCurrentBehavior() {
    if (!this.currentPath || this.pathStartTime === 0) return;

    const duration = Date.now() - this.pathStartTime;
    
    // 只记录停留时间超过1秒的行为
    if (duration > 1000) {
      const behavior: UserBehavior = {
        path: this.currentPath,
        timestamp: this.pathStartTime,
        duration,
      };

      this.addBehavior(behavior);
    }
  }

  private addBehavior(behavior: UserBehavior) {
    // 查找上一个行为，设置nextPath
    if (this.behaviors.length > 0) {
      const lastBehavior = this.behaviors[this.behaviors.length - 1];
      if (!lastBehavior.nextPath) {
        lastBehavior.nextPath = behavior.path;
      }
    }

    this.behaviors.push(behavior);
    
    // 限制历史记录大小
    if (this.behaviors.length > this.maxHistorySize) {
      this.behaviors = this.behaviors.slice(-this.maxHistorySize);
    }

    // 更新预测缓存
    this.updatePredictionCache();
    
    // 触发行为记录事件
    this.emit('behaviorRecorded', behavior);
  }

  private updatePredictionCache() {
    this.predictionCache.clear();
    
    // 分析路径转换模式
    const pathTransitions: Map<string, Map<string, number>> = new Map();
    
    this.behaviors.forEach(behavior => {
      if (behavior.nextPath) {
        if (!pathTransitions.has(behavior.path)) {
          pathTransitions.set(behavior.path, new Map());
        }
        
        const transitions = pathTransitions.get(behavior.path)!;
        const count = transitions.get(behavior.nextPath) || 0;
        transitions.set(behavior.nextPath, count + 1);
      }
    });

    // 生成预测结果
    pathTransitions.forEach((transitions, fromPath) => {
      const sortedTransitions = Array.from(transitions.entries())
        .sort((a, b) => b[1] - a[1]) // 按频次降序排列
        .slice(0, 3) // 取前3个最可能的路径
        .map(([path]) => path);
      
      this.predictionCache.set(fromPath, sortedTransitions);
    });
  }

  public predictNextPaths(currentPath: string): string[] {
    return this.predictionCache.get(currentPath) || [];
  }

  public getPredictionConfidence(fromPath: string, toPath: string): number {
    const behaviors = this.behaviors.filter(b => b.path === fromPath && b.nextPath === toPath);
    const totalFromPath = this.behaviors.filter(b => b.path === fromPath).length;
    
    if (totalFromPath === 0) return 0;
    
    return behaviors.length / totalFromPath;
  }

  public getPathFrequency(path: string): number {
    const pathBehaviors = this.behaviors.filter(b => b.path === path);
    return pathBehaviors.length;
  }

  public getAverageStayTime(path: string): number {
    const pathBehaviors = this.behaviors.filter(b => b.path === path);
    
    if (pathBehaviors.length === 0) return 0;
    
    const totalDuration = pathBehaviors.reduce((sum, b) => sum + b.duration, 0);
    return totalDuration / pathBehaviors.length;
  }

  public getRecentBehaviors(limit: number = 10): UserBehavior[] {
    return this.behaviors.slice(-limit);
  }

  public getAllBehaviors(): UserBehavior[] {
    return [...this.behaviors];
  }

  public clearBehaviors() {
    this.behaviors = [];
    this.predictionCache.clear();
    this.saveBehaviorHistory();
  }

  private loadBehaviorHistory() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.behaviors = data.behaviors || [];
        
        // 只保留最近30天的数据
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        this.behaviors = this.behaviors.filter(b => b.timestamp > thirtyDaysAgo);
        
        this.updatePredictionCache();
      }
    } catch (error) {
      console.warn('[BehaviorAnalyzer] Failed to load behavior history:', error);
      this.behaviors = [];
    }
  }

  private saveBehaviorHistory() {
    try {
      const data = {
        behaviors: this.behaviors,
        lastUpdated: Date.now(),
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('[BehaviorAnalyzer] Failed to save behavior history:', error);
    }
  }

  public getStatistics() {
    const totalBehaviors = this.behaviors.length;
    const uniquePaths = new Set(this.behaviors.map(b => b.path)).size;
    const averageDuration = totalBehaviors > 0 
      ? this.behaviors.reduce((sum, b) => sum + b.duration, 0) / totalBehaviors 
      : 0;

    const pathFrequencies = new Map<string, number>();
    this.behaviors.forEach(b => {
      pathFrequencies.set(b.path, (pathFrequencies.get(b.path) || 0) + 1);
    });

    const mostVisitedPath = Array.from(pathFrequencies.entries())
      .sort((a, b) => b[1] - a[1])[0];

    return {
      totalBehaviors,
      uniquePaths,
      averageDuration: Math.round(averageDuration),
      mostVisitedPath: mostVisitedPath ? mostVisitedPath[0] : null,
      mostVisitedCount: mostVisitedPath ? mostVisitedPath[1] : 0,
    };
  }

  public destroy() {
    this.recordCurrentBehavior();
    this.saveBehaviorHistory();
    this.removeAllListeners();
    
    // 恢复原始的history方法
    // 注意：这里简化处理，实际项目中可能需要更复杂的恢复逻辑
  }
}

// 导出单例实例
export const behaviorAnalyzer = new BehaviorAnalyzer();
