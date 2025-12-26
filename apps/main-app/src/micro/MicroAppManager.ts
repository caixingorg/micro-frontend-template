import { registerMicroApps, start } from 'qiankun';
import { MicroAppConfig } from '@/config/microApps';
import { globalStateManager } from './GlobalState';

class MicroAppManagerClass {
  private isStarted = false;

  // 初始化qiankun - 最简单的配置
  async initialize(microApps: MicroAppConfig[]) {
    try {
      console.log('[MicroAppManager] Initializing with apps:', microApps);

      // 1. 初始化全局状态
      globalStateManager.init({
        user: null, // 这里应该从Redux或LocalStorage获取初始User
        theme: 'light',
        settings: {}
      });

      // 2. 注册微应用
      registerMicroApps(
        microApps.map(app => ({
          name: app.name,
          entry: app.entry,
          container: app.container,
          activeRule: app.activeRule,
          props: {
            ...app.props,
            // 注入全局状态Actions
            globalState: globalStateManager.getActions(),
          },
        }))
      );

      // 3. 启动qiankun - 开启样式隔离
      if (!this.isStarted) {
        start({
          sandbox: {
            experimentalStyleIsolation: true, // 开启Scope CSS隔离
            strictStyleIsolation: false,      // 关闭ShadowDOM
          },
          prefetch: 'all', // 预加载策略 (可选)
        });
        this.isStarted = true;
        console.log('[MicroAppManager] Qiankun started successfully with Style Isolation');
      }

    } catch (error) {
      console.error('[MicroAppManager] Initialize failed:', error);
      throw error;
    }
  }
}

// 单例模式
export const microAppManager = new MicroAppManagerClass();
