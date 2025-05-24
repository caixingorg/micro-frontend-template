import { EventEmitter } from '@enterprise/shared-utils';
import type { NetworkInfo } from '@enterprise/shared-types';

export class NetworkMonitor extends EventEmitter {
  private connection: any;
  private currentStatus: 'slow' | 'fast' = 'fast';
  private networkInfo: NetworkInfo | null = null;
  private fallbackTimer?: number;
  private requestTimes: number[] = [];

  constructor() {
    super();
    this.connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    this.init();
  }

  private init() {
    // 使用Network Information API（如果可用）
    if (this.connection) {
      this.connection.addEventListener('change', this.handleConnectionChange.bind(this));
      this.updateNetworkInfo();
    }

    // 设置降级检测方案
    this.setupFallbackDetection();

    // 初始状态检测
    this.detectInitialStatus();
  }

  private handleConnectionChange() {
    this.updateNetworkInfo();
    this.determineNetworkStatus();
    this.emit('networkChange', {
      status: this.currentStatus,
      info: this.networkInfo,
    });
  }

  private updateNetworkInfo() {
    if (this.connection) {
      this.networkInfo = {
        effectiveType: this.connection.effectiveType || '4g',
        downlink: this.connection.downlink || 10,
        rtt: this.connection.rtt || 100,
        saveData: this.connection.saveData || false,
      };
    }
  }

  private determineNetworkStatus() {
    if (this.networkInfo) {
      // 基于Network Information API判断
      const { effectiveType, downlink, rtt, saveData } = this.networkInfo;
      
      if (saveData || effectiveType === '2g' || effectiveType === 'slow-2g') {
        this.currentStatus = 'slow';
      } else if (effectiveType === '3g' || downlink < 1.5 || rtt > 300) {
        this.currentStatus = 'slow';
      } else {
        this.currentStatus = 'fast';
      }
    } else {
      // 基于请求时间的降级判断
      this.determineStatusByRequestTime();
    }
  }

  private setupFallbackDetection() {
    // 每30秒检测一次网络状态
    this.fallbackTimer = window.setInterval(() => {
      this.performNetworkTest();
    }, 30000);

    // 监听页面可见性变化，重新检测网络
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.performNetworkTest();
      }
    });
  }

  private async performNetworkTest() {
    const startTime = performance.now();
    
    try {
      // 发送一个小的测试请求
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
      });
      
      const endTime = performance.now();
      const requestTime = endTime - startTime;
      
      this.recordRequestTime(requestTime);
      
      if (response.ok) {
        this.determineStatusByRequestTime();
      }
    } catch (error) {
      // 网络错误，认为是慢网络
      this.currentStatus = 'slow';
      this.emit('networkChange', {
        status: this.currentStatus,
        info: this.networkInfo,
      });
    }
  }

  private recordRequestTime(time: number) {
    this.requestTimes.push(time);
    
    // 只保留最近10次的请求时间
    if (this.requestTimes.length > 10) {
      this.requestTimes = this.requestTimes.slice(-10);
    }
  }

  private determineStatusByRequestTime() {
    if (this.requestTimes.length === 0) return;

    const avgTime = this.requestTimes.reduce((sum, time) => sum + time, 0) / this.requestTimes.length;
    const previousStatus = this.currentStatus;
    
    // 平均请求时间超过500ms认为是慢网络
    this.currentStatus = avgTime > 500 ? 'slow' : 'fast';
    
    if (previousStatus !== this.currentStatus) {
      this.emit('networkChange', {
        status: this.currentStatus,
        info: this.networkInfo,
      });
    }
  }

  private detectInitialStatus() {
    // 初始检测
    this.performNetworkTest();
  }

  public getStatus(): 'slow' | 'fast' {
    return this.currentStatus;
  }

  public getNetworkInfo(): NetworkInfo | null {
    return this.networkInfo;
  }

  public isSlowNetwork(): boolean {
    return this.currentStatus === 'slow';
  }

  public isFastNetwork(): boolean {
    return this.currentStatus === 'fast';
  }

  public getSaveDataMode(): boolean {
    return this.networkInfo?.saveData || false;
  }

  public getEffectiveType(): string {
    return this.networkInfo?.effectiveType || 'unknown';
  }

  public getDownlinkSpeed(): number {
    return this.networkInfo?.downlink || 0;
  }

  public getRTT(): number {
    return this.networkInfo?.rtt || 0;
  }

  public destroy() {
    if (this.connection) {
      this.connection.removeEventListener('change', this.handleConnectionChange.bind(this));
    }
    
    if (this.fallbackTimer) {
      clearInterval(this.fallbackTimer);
    }
    
    document.removeEventListener('visibilitychange', this.performNetworkTest.bind(this));
    this.removeAllListeners();
  }
}

// 导出单例实例
export const networkMonitor = new NetworkMonitor();
