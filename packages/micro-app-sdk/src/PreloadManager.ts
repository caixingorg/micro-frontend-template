import { EventEmitter } from '@enterprise/shared-utils';
import type { PreloadConfig, PreloadTask, MicroAppConfig } from '@enterprise/shared-types';
import { NetworkMonitor, networkMonitor } from './NetworkMonitor';
import { BehaviorAnalyzer, behaviorAnalyzer } from './BehaviorAnalyzer';

export class PreloadManager extends EventEmitter {
  private config: PreloadConfig;
  private preloadQueue: Map<string, PreloadTask> = new Map();
  private loadedApps: Set<string> = new Set();
  private appConfigs: Map<string, MicroAppConfig> = new Map();
  private networkMonitor: NetworkMonitor;
  private behaviorAnalyzer: BehaviorAnalyzer;
  private preloadTimer?: number;
  private isEnabled: boolean = true;

  constructor(config: Partial<PreloadConfig> = {}) {
    super();
    
    this.config = {
      strategy: 'smart',
      maxConcurrent: 2,
      networkThreshold: 'auto',
      cacheSize: 5,
      enableBehaviorPrediction: true,
      prefetchDelay: 1000,
      ...config,
    };

    this.networkMonitor = networkMonitor;
    this.behaviorAnalyzer = behaviorAnalyzer;
    
    this.init();
  }

  private init() {
    // 监听网络状态变化
    this.networkMonitor.on('networkChange', this.handleNetworkChange.bind(this));
    
    // 监听路径变化
    this.behaviorAnalyzer.on('pathChange', this.handlePathChange.bind(this));
    
    // 监听行为记录
    this.behaviorAnalyzer.on('behaviorRecorded', this.handleBehaviorRecorded.bind(this));

    // 启动预加载定时器
    this.startPreloadTimer();
  }

  public registerApps(configs: MicroAppConfig[]) {
    configs.forEach(config => {
      this.appConfigs.set(config.name, config);
    });
  }

  public async preloadMicroApp(appName: string, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<boolean> {
    if (!this.isEnabled) {
      console.log('[PreloadManager] Preloading is disabled');
      return false;
    }

    if (this.loadedApps.has(appName)) {
      console.log(`[PreloadManager] App ${appName} already loaded`);
      return true;
    }

    if (this.preloadQueue.has(appName)) {
      console.log(`[PreloadManager] App ${appName} already in queue`);
      return false;
    }

    // 检查网络状态
    if (!this.shouldPreload()) {
      console.log('[PreloadManager] Network conditions not suitable for preloading');
      return false;
    }

    // 检查并发限制
    const activePreloads = Array.from(this.preloadQueue.values())
      .filter(task => task.status === 'loading').length;
    
    if (activePreloads >= this.config.maxConcurrent) {
      console.log('[PreloadManager] Max concurrent preloads reached');
      return false;
    }

    const task: PreloadTask = {
      appName,
      priority,
      status: 'pending',
    };

    this.preloadQueue.set(appName, task);
    this.emit('taskAdded', task);

    return this.executePreload(appName);
  }

  private async executePreload(appName: string): Promise<boolean> {
    const task = this.preloadQueue.get(appName);
    if (!task) return false;

    const appConfig = this.appConfigs.get(appName);
    if (!appConfig) {
      console.error(`[PreloadManager] App config not found: ${appName}`);
      task.status = 'failed';
      task.error = 'App config not found';
      return false;
    }

    try {
      task.status = 'loading';
      task.startTime = Date.now();
      this.emit('taskStarted', task);

      // 预加载应用资源
      await this.loadAppResources(appConfig);

      task.status = 'loaded';
      task.endTime = Date.now();
      this.loadedApps.add(appName);
      this.preloadQueue.delete(appName);
      
      this.emit('taskCompleted', task);
      console.log(`[PreloadManager] Successfully preloaded ${appName}`);
      
      return true;
    } catch (error) {
      task.status = 'failed';
      task.endTime = Date.now();
      task.error = error instanceof Error ? error.message : 'Unknown error';
      
      this.emit('taskFailed', task);
      console.error(`[PreloadManager] Failed to preload ${appName}:`, error);
      
      return false;
    }
  }

  private async loadAppResources(appConfig: MicroAppConfig): Promise<void> {
    const entry = appConfig.entry;
    
    // 如果是开发环境的localhost地址，直接预加载HTML
    if (entry.includes('localhost') || entry.startsWith('//localhost')) {
      await this.preloadHTML(entry);
    } else {
      // 生产环境预加载静态资源
      await this.preloadStaticResources(entry);
    }
  }

  private async preloadHTML(entry: string): Promise<void> {
    const url = entry.startsWith('//') ? `http:${entry}` : entry;
    
    const response = await fetch(url, {
      method: 'GET',
      cache: 'force-cache',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    
    const html = await response.text();
    
    // 解析HTML中的资源链接
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // 预加载CSS和JS资源
    const links = doc.querySelectorAll('link[rel="stylesheet"], script[src]');
    const preloadPromises: Promise<void>[] = [];
    
    links.forEach(element => {
      const href = element.getAttribute('href') || element.getAttribute('src');
      if (href && !href.startsWith('data:')) {
        const resourceUrl = new URL(href, url).href;
        preloadPromises.push(this.preloadResource(resourceUrl));
      }
    });
    
    await Promise.allSettled(preloadPromises);
  }

  private async preloadStaticResources(entry: string): Promise<void> {
    // 对于生产环境的静态资源，可以预加载manifest文件
    // 这里简化处理，实际项目中可能需要更复杂的逻辑
    await this.preloadResource(entry);
  }

  private async preloadResource(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to prefetch ${url}`));
      
      document.head.appendChild(link);
      
      // 5秒超时
      setTimeout(() => {
        reject(new Error(`Prefetch timeout for ${url}`));
      }, 5000);
    });
  }

  private shouldPreload(): boolean {
    // 检查网络状态
    if (this.config.networkThreshold !== 'auto') {
      const networkStatus = this.networkMonitor.getStatus();
      if (this.config.networkThreshold === 'fast' && networkStatus === 'slow') {
        return false;
      }
    }

    // 检查省流量模式
    if (this.networkMonitor.getSaveDataMode()) {
      return false;
    }

    // 检查缓存大小限制
    if (this.loadedApps.size >= this.config.cacheSize) {
      this.cleanupOldCache();
    }

    return true;
  }

  private cleanupOldCache() {
    // 简单的LRU清理策略
    // 实际项目中可能需要更复杂的清理逻辑
    if (this.loadedApps.size > this.config.cacheSize) {
      const appsToRemove = Array.from(this.loadedApps).slice(0, this.loadedApps.size - this.config.cacheSize);
      appsToRemove.forEach(app => {
        this.loadedApps.delete(app);
      });
    }
  }

  private handleNetworkChange(event: any) {
    console.log('[PreloadManager] Network status changed:', event.status);
    
    if (event.status === 'slow') {
      // 网络变慢时，暂停预加载
      this.pausePreloading();
    } else {
      // 网络恢复时，恢复预加载
      this.resumePreloading();
    }
  }

  private handlePathChange(newPath: string) {
    if (!this.config.enableBehaviorPrediction) return;

    // 延迟执行预测预加载，避免影响当前页面加载
    setTimeout(() => {
      this.predictivePreload(newPath);
    }, this.config.prefetchDelay);
  }

  private handleBehaviorRecorded(behavior: any) {
    // 可以在这里添加基于行为的预加载逻辑
    console.log('[PreloadManager] Behavior recorded:', behavior);
  }

  private predictivePreload(currentPath: string) {
    const predictedPaths = this.behaviorAnalyzer.predictNextPaths(currentPath);
    
    predictedPaths.forEach((path, index) => {
      const appName = this.getAppNameFromPath(path);
      if (appName) {
        const priority = index === 0 ? 'high' : index === 1 ? 'medium' : 'low';
        this.preloadMicroApp(appName, priority);
      }
    });
  }

  private getAppNameFromPath(path: string): string | null {
    // 根据路径匹配微应用名称
    if (path.startsWith('/react-app')) return 'react-micro-app';
    if (path.startsWith('/vue3-app')) return 'vue3-micro-app';
    return null;
  }

  private startPreloadTimer() {
    // 定期检查预加载队列
    this.preloadTimer = window.setInterval(() => {
      this.processPreloadQueue();
    }, 5000);
  }

  private processPreloadQueue() {
    const pendingTasks = Array.from(this.preloadQueue.values())
      .filter(task => task.status === 'pending')
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    const activeCount = Array.from(this.preloadQueue.values())
      .filter(task => task.status === 'loading').length;

    const availableSlots = this.config.maxConcurrent - activeCount;
    
    for (let i = 0; i < Math.min(availableSlots, pendingTasks.length); i++) {
      this.executePreload(pendingTasks[i].appName);
    }
  }

  public pausePreloading() {
    this.isEnabled = false;
    console.log('[PreloadManager] Preloading paused');
  }

  public resumePreloading() {
    this.isEnabled = true;
    console.log('[PreloadManager] Preloading resumed');
  }

  public getPreloadStatus() {
    return {
      enabled: this.isEnabled,
      loadedApps: Array.from(this.loadedApps),
      queueSize: this.preloadQueue.size,
      activePreloads: Array.from(this.preloadQueue.values())
        .filter(task => task.status === 'loading').length,
    };
  }

  public clearCache() {
    this.loadedApps.clear();
    this.preloadQueue.clear();
    console.log('[PreloadManager] Cache cleared');
  }

  public destroy() {
    if (this.preloadTimer) {
      clearInterval(this.preloadTimer);
    }
    
    this.removeAllListeners();
    this.clearCache();
  }
}

// 导出单例实例
export const preloadManager = new PreloadManager();
