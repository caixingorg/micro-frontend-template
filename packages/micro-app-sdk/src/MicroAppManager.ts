import { registerMicroApps, start } from 'qiankun';
import type {
  MicroAppConfig,
  MicroAppLifeCycles,
  MicroAppInstance,
  GlobalState
} from '@enterprise/shared-types';
import type { Entry } from 'qiankun';

export class MicroAppManager {
  private apps = new Map<string, MicroAppConfig>();
  private instances = new Map<string, MicroAppInstance>();
  private globalState: any;
  private isStarted = false;

  constructor() {
    this.initGlobalState();
  }

  /**
   * 初始化全局状态（使用自定义实现替代 qiankun globalState）
   */
  private initGlobalState() {
    const initialState: Partial<GlobalState> = {
      user: null,
      theme: 'light',
      language: 'zh-CN',
      loading: false,
    };

    this.globalState = this.createCustomGlobalState(initialState);
  }

  /**
   * 创建自定义全局状态管理（替代 qiankun globalState）
   */
  private createCustomGlobalState(initialState: Partial<GlobalState> = {}) {
    const state: Record<string, any> = { ...initialState };
    const listeners: Array<(state: Record<string, any>, prevState: Record<string, any>) => void> = [];

    return {
      setGlobalState: (newState: Record<string, any>) => {
        const prevState = { ...state };
        Object.assign(state, newState);
        listeners.forEach(listener => {
          try {
            listener(state, prevState);
          } catch (error) {
            console.error('[MicroApp] Error in global state listener:', error);
          }
        });
      },
      onGlobalStateChange: (callback: (state: Record<string, any>, prevState: Record<string, any>) => void) => {
        listeners.push(callback);
        return () => {
          const index = listeners.indexOf(callback);
          if (index > -1) {
            listeners.splice(index, 1);
          }
        };
      },
      getGlobalState: () => ({ ...state }),
    };
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
          const appConfig = this.apps.get(app.name);
          if (appConfig) {
            await lifeCycles?.beforeLoad?.(appConfig);
          }
        },
        beforeMount: async (app) => {
          console.log(`[MicroApp] Before mount: ${app.name}`);
          const appConfig = this.apps.get(app.name);
          if (appConfig) {
            await lifeCycles?.beforeMount?.(appConfig);
          }
        },
        afterMount: async (app) => {
          console.log(`[MicroApp] After mount: ${app.name}`);
          const appConfig = this.apps.get(app.name);
          if (appConfig) {
            // 创建实例记录（用于路由加载的应用）
            const instance: MicroAppInstance = {
              name: app.name,
              status: 'MOUNTED',
              loadPromise: Promise.resolve(),
              bootstrapPromise: Promise.resolve(),
              mountPromise: Promise.resolve(),
              unmountPromise: Promise.resolve(),
              getStatus: () => 'MOUNTED',
              mount: () => Promise.resolve(),
              unmount: () => Promise.resolve(),
              update: (props: Record<string, any>) => Promise.resolve(),
            };
            this.instances.set(app.name, instance);

            await lifeCycles?.afterMount?.(appConfig);
          }
        },
        beforeUnmount: async (app) => {
          console.log(`[MicroApp] Before unmount: ${app.name}`);
          const appConfig = this.apps.get(app.name);
          if (appConfig) {
            await lifeCycles?.beforeUnmount?.(appConfig);
          }
        },
        afterUnmount: async (app) => {
          console.log(`[MicroApp] After unmount: ${app.name}`);
          const appConfig = this.apps.get(app.name);
          if (appConfig) {
            // 移除实例记录
            this.instances.delete(app.name);
            await lifeCycles?.afterUnmount?.(appConfig);
          }
        },
      }
    );
  }

  /**
   * 启动qiankun - 参考蚂蚁金服官方最佳实践
   */
  start(options?: any) {
    if (this.isStarted) {
      console.warn('[MicroApp] Already started');
      return;
    }

    // 参考官方示例的自定义fetch函数
    const customFetch = async (url: string, options?: RequestInit): Promise<Response> => {
      console.log(`[MicroApp] Fetching: ${url}`);

      try {
        const response = await fetch(url, {
          ...options,
          mode: 'cors',
          credentials: 'omit',
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        console.log(`[MicroApp] Successfully fetched: ${url}`);
        return response;
      } catch (error) {
        console.error(`[MicroApp] Fetch failed for ${url}:`, error);
        throw error;
      }
    };

    // 针对样式冲突问题的强化配置
    start({
      prefetch: false, // 官方推荐：开发环境关闭预加载
      singular: false, // 允许多个微应用同时存在
      sandbox: {
        strictStyleIsolation: true, // 启用严格样式隔离，解决样式冲突
        experimentalStyleIsolation: false, // 关闭实验性样式隔离，避免与严格模式冲突
      },
      fetch: customFetch,
      getPublicPath: (entry: string) => {
        // 确保公共路径正确
        return entry.endsWith('/') ? entry : `${entry}/`;
      },
      ...options,
    });

    this.isStarted = true;
    console.log('[MicroApp] Started successfully with best practices');
  }

  /**
   * 获取应用配置
   */
  getAppConfig(name: string): MicroAppConfig | undefined {
    return this.apps.get(name);
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
   * 获取微应用实例
   */
  getInstance(name: string): MicroAppInstance | undefined {
    return this.instances.get(name);
  }

  /**
   * 手动加载微应用
   * @param name 微应用名称
   * @param container 容器选择器或DOM元素
   * @param props 传递给微应用的属性
   * @param configuration 微应用加载配置
   * @returns 微应用实例
   */
  async loadApp(
    name: string, 
    container: string | HTMLElement, 
    props?: Record<string, any>,
    configuration?: {
      sandbox?: boolean | {
        strictStyleIsolation?: boolean;
        experimentalStyleIsolation?: boolean;
      };
      singular?: boolean;
      fetch?: typeof window.fetch;
      getPublicPath?: (entry: Entry) => string;
      getTemplate?: (tpl: string) => string;
      excludeAssetFilter?: (assetUrl: string) => boolean;
    }
  ): Promise<MicroAppInstance | null> {
    const appConfig = this.apps.get(name);
    if (!appConfig) {
      console.error(`[MicroApp] App config not found: ${name}`);
      return null;
    }

    try {
      console.log(`[MicroApp] Loading app ${name} with qiankun.loadMicroApp...`);
      
      // 导入qiankun的loadMicroApp方法
      const { loadMicroApp } = await import('qiankun');
      
      // 使用qiankun的loadMicroApp方法加载微应用
      const microApp = loadMicroApp({
        name,
        entry: appConfig.entry,
        container,
        props: {
          ...appConfig.props,
          ...props,
          globalState: this.globalState,
        },
      }, {
        // 默认配置
        sandbox: {
          strictStyleIsolation: false,
          experimentalStyleIsolation: false,
        },
        singular: false,
        // 合并用户自定义配置
        ...configuration,
      });
      
      // 将qiankun返回的微应用实例转换为我们的MicroAppInstance类型
      const instance: MicroAppInstance = {
        name,
        status: 'LOADING_SOURCE_CODE',
        loadPromise: (microApp.loadPromise as unknown) as Promise<void>,
        bootstrapPromise: (microApp.bootstrapPromise as unknown) as Promise<void>,
        mountPromise: (microApp.mountPromise as unknown) as Promise<void>,
        unmountPromise: (microApp.unmountPromise as unknown) as Promise<void>,
        getStatus: microApp.getStatus,
        mount: (() => microApp.mount().then(() => {})) as () => Promise<void>,
        unmount: (() => microApp.unmount().then(() => {})) as () => Promise<void>,
        update: ((props: Record<string, any>) => microApp.update?.(props).then(() => {})) as (props: Record<string, any>) => Promise<void>,
      };

      // 保存实例
      this.instances.set(name, instance);
      console.log(`[MicroApp] Successfully loaded app ${name}`);
      return instance;
    } catch (error) {
      console.error(`[MicroApp] Failed to load app ${name}:`, error);
      return null;
    }
  }

  /**
   * 卸载微应用
   */
  async unloadApp(name: string): Promise<void> {
    const instance = this.instances.get(name);
    if (instance) {
      try {
        await instance.unmount();
        this.instances.delete(name);
        console.log(`[MicroApp] Unloaded app: ${name}`);
      } catch (error) {
        console.error(`[MicroApp] Failed to unload app ${name}:`, error);
        throw error;
      }
    }
  }

  /**
   * 销毁管理器
   */
  destroy() {
    this.apps.clear();
    this.instances.clear();
    this.isStarted = false;
  }
}

// 导出单例实例
export const microAppManager = new MicroAppManager();
