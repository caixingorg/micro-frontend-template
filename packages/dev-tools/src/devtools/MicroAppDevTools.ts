interface MicroAppInfo {
  name: string;
  status: 'loading' | 'mounted' | 'unmounted' | 'error';
  entry: string;
  container: string;
  activeRule: string;
  loadTime?: number;
  mountTime?: number;
  errorMessage?: string;
  props?: any;
}

interface DevToolsConfig {
  enabled: boolean;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  hotReload: boolean;
  showPerformance: boolean;
  showNetwork: boolean;
  showConsole: boolean;
}

export class MicroAppDevTools {
  private static instance: MicroAppDevTools;
  private config: DevToolsConfig;
  private microApps: Map<string, MicroAppInfo> = new Map();
  private devPanel?: HTMLElement;
  private isVisible: boolean = false;

  private constructor() {
    this.config = {
      enabled: process.env.NODE_ENV === 'development',
      position: 'bottom-right',
      hotReload: true,
      showPerformance: true,
      showNetwork: true,
      showConsole: true,
    };

    if (this.config.enabled) {
      this.init();
    }
  }

  public static getInstance(): MicroAppDevTools {
    if (!MicroAppDevTools.instance) {
      MicroAppDevTools.instance = new MicroAppDevTools();
    }
    return MicroAppDevTools.instance;
  }

  private init() {
    this.createDevPanel();
    this.setupKeyboardShortcuts();
    this.setupGlobalErrorHandler();
    this.injectGlobalMethods();
  }

  private createDevPanel() {
    // 创建开发者面板
    this.devPanel = document.createElement('div');
    this.devPanel.id = 'micro-app-devtools';
    this.devPanel.innerHTML = this.getDevPanelHTML();
    this.devPanel.style.cssText = this.getDevPanelCSS();
    
    document.body.appendChild(this.devPanel);

    // 绑定事件
    this.bindDevPanelEvents();
  }

  private getDevPanelHTML(): string {
    return `
      <div class="devtools-header">
        <span class="devtools-title">🔧 Micro App DevTools</span>
        <div class="devtools-controls">
          <button class="devtools-btn" data-action="refresh">🔄</button>
          <button class="devtools-btn" data-action="clear">🗑️</button>
          <button class="devtools-btn" data-action="toggle">📊</button>
          <button class="devtools-btn" data-action="close">✕</button>
        </div>
      </div>
      <div class="devtools-content">
        <div class="devtools-tabs">
          <button class="devtools-tab active" data-tab="apps">应用</button>
          <button class="devtools-tab" data-tab="performance">性能</button>
          <button class="devtools-tab" data-tab="network">网络</button>
          <button class="devtools-tab" data-tab="console">控制台</button>
        </div>
        <div class="devtools-panels">
          <div class="devtools-panel active" data-panel="apps">
            <div class="apps-list"></div>
          </div>
          <div class="devtools-panel" data-panel="performance">
            <div class="performance-metrics"></div>
          </div>
          <div class="devtools-panel" data-panel="network">
            <div class="network-requests"></div>
          </div>
          <div class="devtools-panel" data-panel="console">
            <div class="console-logs"></div>
          </div>
        </div>
      </div>
    `;
  }

  private getDevPanelCSS(): string {
    const position = this.config.position;
    const [vPos, hPos] = position.split('-');
    
    return `
      position: fixed;
      ${vPos}: 20px;
      ${hPos}: 20px;
      width: 400px;
      height: 300px;
      background: #1f1f1f;
      color: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 12px;
      z-index: 999999;
      display: ${this.isVisible ? 'block' : 'none'};
      resize: both;
      overflow: hidden;
    `;
  }

  private bindDevPanelEvents() {
    if (!this.devPanel) return;

    // 控制按钮事件
    this.devPanel.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const action = target.getAttribute('data-action');
      
      switch (action) {
        case 'refresh':
          this.refreshApps();
          break;
        case 'clear':
          this.clearLogs();
          break;
        case 'toggle':
          this.togglePerformanceMonitor();
          break;
        case 'close':
          this.hide();
          break;
      }

      // 标签切换
      const tab = target.getAttribute('data-tab');
      if (tab) {
        this.switchTab(tab);
      }
    });

    // 拖拽功能
    this.makeDraggable();
  }

  private makeDraggable() {
    if (!this.devPanel) return;

    const header = this.devPanel.querySelector('.devtools-header') as HTMLElement;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = this.devPanel!.offsetLeft;
      startTop = this.devPanel!.offsetTop;
      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      this.devPanel!.style.left = `${startLeft + deltaX}px`;
      this.devPanel!.style.top = `${startTop + deltaY}px`;
      this.devPanel!.style.right = 'auto';
      this.devPanel!.style.bottom = 'auto';
    };

    const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }

  private setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Shift + D 切换开发者工具
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        this.toggle();
      }
      
      // Ctrl/Cmd + Shift + R 刷新微应用
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        this.refreshApps();
      }
    });
  }

  private setupGlobalErrorHandler() {
    const originalError = console.error;
    console.error = (...args) => {
      this.addConsoleLog('error', args.join(' '));
      originalError.apply(console, args);
    };

    const originalWarn = console.warn;
    console.warn = (...args) => {
      this.addConsoleLog('warn', args.join(' '));
      originalWarn.apply(console, args);
    };

    const originalLog = console.log;
    console.log = (...args) => {
      this.addConsoleLog('log', args.join(' '));
      originalLog.apply(console, args);
    };
  }

  private injectGlobalMethods() {
    // 在全局对象上注入开发者工具方法
    (window as any).__MICRO_APP_DEVTOOLS__ = {
      show: () => this.show(),
      hide: () => this.hide(),
      toggle: () => this.toggle(),
      getApps: () => Array.from(this.microApps.values()),
      refreshApps: () => this.refreshApps(),
      clearLogs: () => this.clearLogs(),
    };
  }

  public registerApp(info: MicroAppInfo) {
    this.microApps.set(info.name, info);
    this.updateAppsPanel();
  }

  public updateAppStatus(name: string, status: MicroAppInfo['status'], extra?: Partial<MicroAppInfo>) {
    const app = this.microApps.get(name);
    if (app) {
      app.status = status;
      if (extra) {
        Object.assign(app, extra);
      }
      this.updateAppsPanel();
    }
  }

  private updateAppsPanel() {
    if (!this.devPanel) return;

    const appsPanel = this.devPanel.querySelector('.apps-list') as HTMLElement;
    if (!appsPanel) return;

    const apps = Array.from(this.microApps.values());
    appsPanel.innerHTML = apps.map(app => `
      <div class="app-item ${app.status}">
        <div class="app-header">
          <span class="app-name">${app.name}</span>
          <span class="app-status ${app.status}">${this.getStatusText(app.status)}</span>
        </div>
        <div class="app-details">
          <div>Entry: ${app.entry}</div>
          <div>Container: ${app.container}</div>
          <div>Rule: ${app.activeRule}</div>
          ${app.loadTime ? `<div>Load Time: ${app.loadTime}ms</div>` : ''}
          ${app.mountTime ? `<div>Mount Time: ${app.mountTime}ms</div>` : ''}
          ${app.errorMessage ? `<div class="error">Error: ${app.errorMessage}</div>` : ''}
        </div>
        <div class="app-actions">
          <button onclick="window.__MICRO_APP_DEVTOOLS__.reloadApp('${app.name}')">重载</button>
          <button onclick="window.__MICRO_APP_DEVTOOLS__.inspectApp('${app.name}')">检查</button>
        </div>
      </div>
    `).join('');

    // 添加样式
    this.injectAppStyles();
  }

  private injectAppStyles() {
    if (document.getElementById('devtools-styles')) return;

    const style = document.createElement('style');
    style.id = 'devtools-styles';
    style.textContent = `
      #micro-app-devtools .devtools-header {
        background: #2d2d2d;
        padding: 8px 12px;
        border-radius: 8px 8px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move;
      }
      
      #micro-app-devtools .devtools-title {
        font-weight: bold;
      }
      
      #micro-app-devtools .devtools-btn {
        background: none;
        border: none;
        color: #fff;
        cursor: pointer;
        padding: 4px;
        margin-left: 4px;
        border-radius: 3px;
      }
      
      #micro-app-devtools .devtools-btn:hover {
        background: #404040;
      }
      
      #micro-app-devtools .devtools-content {
        height: calc(100% - 40px);
        display: flex;
        flex-direction: column;
      }
      
      #micro-app-devtools .devtools-tabs {
        display: flex;
        background: #2d2d2d;
        border-bottom: 1px solid #404040;
      }
      
      #micro-app-devtools .devtools-tab {
        background: none;
        border: none;
        color: #ccc;
        padding: 8px 12px;
        cursor: pointer;
        border-bottom: 2px solid transparent;
      }
      
      #micro-app-devtools .devtools-tab.active {
        color: #fff;
        border-bottom-color: #1890ff;
      }
      
      #micro-app-devtools .devtools-panels {
        flex: 1;
        overflow: auto;
        padding: 12px;
      }
      
      #micro-app-devtools .devtools-panel {
        display: none;
      }
      
      #micro-app-devtools .devtools-panel.active {
        display: block;
      }
      
      #micro-app-devtools .app-item {
        border: 1px solid #404040;
        border-radius: 4px;
        margin-bottom: 8px;
        padding: 8px;
      }
      
      #micro-app-devtools .app-item.mounted {
        border-color: #52c41a;
      }
      
      #micro-app-devtools .app-item.error {
        border-color: #ff4d4f;
      }
      
      #micro-app-devtools .app-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
      }
      
      #micro-app-devtools .app-name {
        font-weight: bold;
      }
      
      #micro-app-devtools .app-status {
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 10px;
      }
      
      #micro-app-devtools .app-status.mounted {
        background: #52c41a;
        color: #fff;
      }
      
      #micro-app-devtools .app-status.loading {
        background: #1890ff;
        color: #fff;
      }
      
      #micro-app-devtools .app-status.error {
        background: #ff4d4f;
        color: #fff;
      }
      
      #micro-app-devtools .app-details {
        font-size: 10px;
        color: #ccc;
        margin-bottom: 8px;
      }
      
      #micro-app-devtools .app-details .error {
        color: #ff4d4f;
      }
      
      #micro-app-devtools .app-actions button {
        background: #1890ff;
        border: none;
        color: #fff;
        padding: 4px 8px;
        border-radius: 3px;
        cursor: pointer;
        margin-right: 4px;
        font-size: 10px;
      }
    `;
    
    document.head.appendChild(style);
  }

  private getStatusText(status: MicroAppInfo['status']): string {
    const statusMap = {
      loading: '加载中',
      mounted: '已挂载',
      unmounted: '已卸载',
      error: '错误',
    };
    return statusMap[status] || status;
  }

  private switchTab(tabName: string) {
    if (!this.devPanel) return;

    // 切换标签
    this.devPanel.querySelectorAll('.devtools-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    this.devPanel.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

    // 切换面板
    this.devPanel.querySelectorAll('.devtools-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    this.devPanel.querySelector(`[data-panel="${tabName}"]`)?.classList.add('active');
  }

  private refreshApps() {
    // 触发微应用刷新事件
    window.dispatchEvent(new CustomEvent('micro-app-devtools:refresh'));
  }

  private clearLogs() {
    if (!this.devPanel) return;
    const consolePanel = this.devPanel.querySelector('.console-logs') as HTMLElement;
    if (consolePanel) {
      consolePanel.innerHTML = '';
    }
  }

  private togglePerformanceMonitor() {
    // 切换性能监控
    window.dispatchEvent(new CustomEvent('micro-app-devtools:toggle-performance'));
  }

  private addConsoleLog(type: 'log' | 'warn' | 'error', message: string) {
    if (!this.devPanel) return;
    
    const consolePanel = this.devPanel.querySelector('.console-logs') as HTMLElement;
    if (!consolePanel) return;

    const logElement = document.createElement('div');
    logElement.className = `console-log ${type}`;
    logElement.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    
    consolePanel.appendChild(logElement);
    consolePanel.scrollTop = consolePanel.scrollHeight;
  }

  public show() {
    this.isVisible = true;
    if (this.devPanel) {
      this.devPanel.style.display = 'block';
    }
  }

  public hide() {
    this.isVisible = false;
    if (this.devPanel) {
      this.devPanel.style.display = 'none';
    }
  }

  public toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  public destroy() {
    if (this.devPanel) {
      this.devPanel.remove();
    }
    
    // 清理全局方法
    delete (window as any).__MICRO_APP_DEVTOOLS__;
  }
}

// 导出单例
export const microAppDevTools = MicroAppDevTools.getInstance();
