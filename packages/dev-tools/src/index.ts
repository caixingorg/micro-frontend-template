// 开发者工具
export { MicroAppDevTools, microAppDevTools } from './devtools/MicroAppDevTools';

// 热重载管理
export { HotReloadManager, hotReloadManager } from './hot-reload/HotReloadManager';

// Mock管理
export { MockManager, mockManager } from './mock/MockManager';

// 统一开发工具管理器
export class DevToolsManager {
  private static instance: DevToolsManager;
  
  public devTools: MicroAppDevTools;
  public hotReload: HotReloadManager;
  public mock: MockManager;

  private constructor() {
    this.devTools = microAppDevTools;
    this.hotReload = hotReloadManager;
    this.mock = mockManager;
  }

  public static getInstance(): DevToolsManager {
    if (!DevToolsManager.instance) {
      DevToolsManager.instance = new DevToolsManager();
    }
    return DevToolsManager.instance;
  }

  public init(config: {
    devTools?: boolean;
    hotReload?: any;
    mock?: any;
  } = {}) {
    // 初始化开发者工具
    if (config.devTools !== false) {
      this.devTools.show();
    }

    // 配置热重载
    if (config.hotReload) {
      this.hotReload.configure(config.hotReload);
    }

    // 配置Mock
    if (config.mock) {
      this.mock.configure(config.mock);
      
      // 添加常用Mock规则
      if (config.mock.addCommonRules) {
        this.mock.addCommonRules();
      }
    }

    // 设置全局快捷键
    this.setupGlobalShortcuts();

    console.log('[DevToolsManager] Development tools initialized');
  }

  private setupGlobalShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Shift + M 切换Mock
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        this.toggleMock();
      }
      
      // Ctrl/Cmd + Shift + H 切换热重载
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'H') {
        e.preventDefault();
        this.toggleHotReload();
      }
    });
  }

  private toggleMock() {
    const currentConfig = this.mock.getConfig?.() || { enabled: false };
    this.mock.configure({ enabled: !currentConfig.enabled });
    
    console.log(`[DevToolsManager] Mock ${currentConfig.enabled ? 'disabled' : 'enabled'}`);
  }

  private toggleHotReload() {
    const status = this.hotReload.getStatus();
    this.hotReload.configure({ enabled: !status.config.enabled });
    
    console.log(`[DevToolsManager] Hot reload ${status.config.enabled ? 'disabled' : 'enabled'}`);
  }

  public destroy() {
    this.devTools.destroy();
    this.hotReload.destroy();
    this.mock.destroy();
  }
}

// 导出单例
export const devToolsManager = DevToolsManager.getInstance();
