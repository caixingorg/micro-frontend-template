import { registerMicroApps, start, loadMicroApp, initGlobalState } from 'qiankun';
import type { 
  MicroAppConfig, 
  MicroAppLifeCycles, 
  MicroAppInstance,
  GlobalState 
} from '@enterprise/shared-types';

export class MicroAppManager {
  private apps = new Map<string, MicroAppConfig>();
  private instances = new Map<string, MicroAppInstance>();
  private globalState: any;
  private isStarted = false;

  constructor() {
    this.initGlobalState();
  }

  /**
   * 初始化全局状态
   */
  private initGlobalState() {
    const initialState: Partial<GlobalState> = {
      user: null,
      theme: 'light',
      language: 'zh-CN',
      loading: false,
    };

    this.globalState = initGlobalState(initialState);
  }

  /**
   * 注册微应用
   */
  registerApps(configs: MicroAppConfig[], lifeCycles?: MicroAppLifeCycles) {
    // 存储应用配置
    configs.forEach(config => {
      this.apps.set(config.name, config);
    });

    // 注册到qiankun
    registerMicroApps(
      configs.map(config => ({
        name: config.name,
        entry: config.entry,
        container: config.container,
        activeRule: config.activeRule,
        props: {
          ...config.props,
          globalState: this.globalState,
        },
      })),
      {
        beforeLoad: async (app) => {
          console.log(`[MicroApp] Before load: ${app.name}`);
          await lifeCycles?.beforeLoad?.(app);
        },
        beforeMount: async (app) => {
          console.log(`[MicroApp] Before mount: ${app.name}`);
          await lifeCycles?.beforeMount?.(app);
        },
        afterMount: async (app) => {
          console.log(`[MicroApp] After mount: ${app.name}`);
          await lifeCycles?.afterMount?.(app);
        },
        beforeUnmount: async (app) => {
          console.log(`[MicroApp] Before unmount: ${app.name}`);
          await lifeCycles?.beforeUnmount?.(app);
        },
        afterUnmount: async (app) => {
          console.log(`[MicroApp] After unmount: ${app.name}`);
          await lifeCycles?.afterUnmount?.(app);
        },
      }
    );
  }

  /**
   * 启动qiankun
   */
  start(options?: any) {
    if (this.isStarted) {
      console.warn('[MicroApp] Already started');
      return;
    }

    start({
      prefetch: true,
      singular: false,
      fetch: this.customFetch,
      ...options,
    });

    this.isStarted = true;
    console.log('[MicroApp] Started successfully');
  }

  /**
   * 手动加载微应用
   */
  async loadApp(name: string, container?: string): Promise<MicroAppInstance | null> {
    const config = this.apps.get(name);
    if (!config) {
      console.error(`[MicroApp] App ${name} not found`);
      return null;
    }

    try {
      const instance = loadMicroApp({
        name: config.name,
        entry: config.entry,
        container: container || config.container,
        props: {
          ...config.props,
          globalState: this.globalState,
        },
      });

      this.instances.set(name, instance);
      
      // 等待应用加载完成
      await instance.loadPromise;
      await instance.bootstrapPromise;
      await instance.mountPromise;

      console.log(`[MicroApp] App ${name} loaded successfully`);
      return instance;
    } catch (error) {
      console.error(`[MicroApp] Failed to load app ${name}:`, error);
      return null;
    }
  }

  /**
   * 卸载微应用
   */
  async unloadApp(name: string): Promise<boolean> {
    const instance = this.instances.get(name);
    if (!instance) {
      console.warn(`[MicroApp] App ${name} not found in instances`);
      return false;
    }

    try {
      await instance.unmount();
      this.instances.delete(name);
      console.log(`[MicroApp] App ${name} unloaded successfully`);
      return true;
    } catch (error) {
      console.error(`[MicroApp] Failed to unload app ${name}:`, error);
      return false;
    }
  }

  /**
   * 获取应用实例
   */
  getInstance(name: string): MicroAppInstance | undefined {
    return this.instances.get(name);
  }

  /**
   * 获取应用配置
   */
  getAppConfig(name: string): MicroAppConfig | undefined {
    return this.apps.get(name);
  }

  /**
   * 获取全局状态
   */
  getGlobalState() {
    return this.globalState;
  }

  /**
   * 设置全局状态
   */
  setGlobalState(state: Partial<GlobalState>) {
    this.globalState.setGlobalState(state);
  }

  /**
   * 监听全局状态变化
   */
  onGlobalStateChange(callback: (state: GlobalState, prev: GlobalState) => void) {
    this.globalState.onGlobalStateChange(callback);
  }

  /**
   * 自定义fetch函数
   */
  private customFetch = (url: string, options?: RequestInit) => {
    // 可以在这里添加认证头、错误处理等
    const defaultOptions: RequestInit = {
      credentials: 'include',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    };

    return fetch(url, defaultOptions);
  };

  /**
   * 销毁管理器
   */
  destroy() {
    // 卸载所有应用实例
    this.instances.forEach(async (instance, name) => {
      try {
        await instance.unmount();
      } catch (error) {
        console.error(`[MicroApp] Failed to unmount app ${name} during destroy:`, error);
      }
    });

    this.instances.clear();
    this.apps.clear();
    this.isStarted = false;
  }
}

// 导出单例实例
export const microAppManager = new MicroAppManager();
