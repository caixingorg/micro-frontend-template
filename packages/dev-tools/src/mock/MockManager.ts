interface MockRule {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string | RegExp;
  response: any;
  delay?: number;
  status?: number;
  headers?: Record<string, string>;
  enabled: boolean;
  description?: string;
}

interface MockConfig {
  enabled: boolean;
  baseURL?: string;
  globalDelay?: number;
  logRequests: boolean;
  persistRules: boolean;
}

export class MockManager {
  private static instance: MockManager;
  private config: MockConfig;
  private rules: Map<string, MockRule> = new Map();
  private originalFetch?: typeof fetch;
  private originalXHR?: typeof XMLHttpRequest;

  private constructor() {
    this.config = {
      enabled: process.env.NODE_ENV === 'development',
      logRequests: true,
      persistRules: true,
    };

    if (this.config.enabled) {
      this.init();
    }
  }

  public static getInstance(): MockManager {
    if (!MockManager.instance) {
      MockManager.instance = new MockManager();
    }
    return MockManager.instance;
  }

  public configure(config: Partial<MockConfig>) {
    this.config = { ...this.config, ...config };
    
    if (this.config.enabled) {
      this.enable();
    } else {
      this.disable();
    }
  }

  private init() {
    this.loadPersistedRules();
    this.enable();
    this.setupDevToolsIntegration();
  }

  private enable() {
    this.interceptFetch();
    this.interceptXHR();
    console.log('[MockManager] Mock interceptors enabled');
  }

  private disable() {
    this.restoreFetch();
    this.restoreXHR();
    console.log('[MockManager] Mock interceptors disabled');
  }

  private interceptFetch() {
    if (this.originalFetch) return;

    this.originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input.toString();
      const method = (init?.method || 'GET').toUpperCase() as MockRule['method'];
      
      const matchedRule = this.findMatchingRule(method, url);
      
      if (matchedRule && matchedRule.enabled) {
        return this.createMockResponse(matchedRule, url, init);
      }
      
      // 记录真实请求
      if (this.config.logRequests) {
        console.log(`[MockManager] Real request: ${method} ${url}`);
      }
      
      return this.originalFetch!(input, init);
    };
  }

  private interceptXHR() {
    if (this.originalXHR) return;

    this.originalXHR = window.XMLHttpRequest;
    
    const mockManager = this;
    
    window.XMLHttpRequest = class extends this.originalXHR! {
      private _method?: string;
      private _url?: string;
      
      open(method: string, url: string | URL, async?: boolean, user?: string | null, password?: string | null) {
        this._method = method.toUpperCase();
        this._url = url.toString();
        
        const matchedRule = mockManager.findMatchingRule(this._method as MockRule['method'], this._url);
        
        if (matchedRule && matchedRule.enabled) {
          // 模拟异步响应
          setTimeout(() => {
            this.readyState = 4;
            this.status = matchedRule.status || 200;
            this.statusText = 'OK';
            this.responseText = JSON.stringify(matchedRule.response);
            
            // 设置响应头
            if (matchedRule.headers) {
              Object.entries(matchedRule.headers).forEach(([key, value]) => {
                this.setRequestHeader(key, value);
              });
            }
            
            this.onreadystatechange?.();
            
            if (mockManager.config.logRequests) {
              console.log(`[MockManager] Mock response: ${this._method} ${this._url}`, matchedRule.response);
            }
          }, matchedRule.delay || mockManager.config.globalDelay || 0);
          
          return;
        }
        
        // 记录真实请求
        if (mockManager.config.logRequests) {
          console.log(`[MockManager] Real XHR request: ${this._method} ${this._url}`);
        }
        
        super.open(method, url, async, user, password);
      }
    };
  }

  private restoreFetch() {
    if (this.originalFetch) {
      window.fetch = this.originalFetch;
      this.originalFetch = undefined;
    }
  }

  private restoreXHR() {
    if (this.originalXHR) {
      window.XMLHttpRequest = this.originalXHR;
      this.originalXHR = undefined;
    }
  }

  private findMatchingRule(method: MockRule['method'], url: string): MockRule | null {
    for (const rule of this.rules.values()) {
      if (rule.method === method && this.urlMatches(rule.url, url)) {
        return rule;
      }
    }
    return null;
  }

  private urlMatches(pattern: string | RegExp, url: string): boolean {
    if (typeof pattern === 'string') {
      // 支持通配符匹配
      const regexPattern = pattern
        .replace(/\*/g, '.*')
        .replace(/\?/g, '\\?');
      return new RegExp(regexPattern).test(url);
    }
    return pattern.test(url);
  }

  private async createMockResponse(rule: MockRule, url: string, init?: RequestInit): Promise<Response> {
    // 模拟延迟
    const delay = rule.delay || this.config.globalDelay || 0;
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // 记录模拟请求
    if (this.config.logRequests) {
      console.log(`[MockManager] Mock response: ${rule.method} ${url}`, rule.response);
    }

    // 创建响应
    const response = new Response(JSON.stringify(rule.response), {
      status: rule.status || 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/json',
        ...rule.headers,
      },
    });

    return response;
  }

  public addRule(rule: Omit<MockRule, 'id'> & { id?: string }): string {
    const id = rule.id || this.generateRuleId();
    const fullRule: MockRule = {
      id,
      enabled: true,
      ...rule,
    };
    
    this.rules.set(id, fullRule);
    this.persistRules();
    
    console.log(`[MockManager] Added mock rule: ${fullRule.method} ${fullRule.url}`);
    return id;
  }

  public removeRule(id: string): boolean {
    const removed = this.rules.delete(id);
    if (removed) {
      this.persistRules();
      console.log(`[MockManager] Removed mock rule: ${id}`);
    }
    return removed;
  }

  public updateRule(id: string, updates: Partial<MockRule>): boolean {
    const rule = this.rules.get(id);
    if (rule) {
      Object.assign(rule, updates);
      this.persistRules();
      console.log(`[MockManager] Updated mock rule: ${id}`);
      return true;
    }
    return false;
  }

  public enableRule(id: string): boolean {
    return this.updateRule(id, { enabled: true });
  }

  public disableRule(id: string): boolean {
    return this.updateRule(id, { enabled: false });
  }

  public getRules(): MockRule[] {
    return Array.from(this.rules.values());
  }

  public getRule(id: string): MockRule | undefined {
    return this.rules.get(id);
  }

  public clearRules(): void {
    this.rules.clear();
    this.persistRules();
    console.log('[MockManager] Cleared all mock rules');
  }

  private generateRuleId(): string {
    return `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private persistRules(): void {
    if (!this.config.persistRules) return;
    
    try {
      const rulesData = Array.from(this.rules.values());
      localStorage.setItem('mock-manager-rules', JSON.stringify(rulesData));
    } catch (error) {
      console.warn('[MockManager] Failed to persist rules:', error);
    }
  }

  private loadPersistedRules(): void {
    if (!this.config.persistRules) return;
    
    try {
      const rulesData = localStorage.getItem('mock-manager-rules');
      if (rulesData) {
        const rules: MockRule[] = JSON.parse(rulesData);
        rules.forEach(rule => {
          this.rules.set(rule.id, rule);
        });
        console.log(`[MockManager] Loaded ${rules.length} persisted rules`);
      }
    } catch (error) {
      console.warn('[MockManager] Failed to load persisted rules:', error);
    }
  }

  private setupDevToolsIntegration(): void {
    // 在全局对象上暴露Mock管理器
    (window as any).__MOCK_MANAGER__ = {
      addRule: (rule: any) => this.addRule(rule),
      removeRule: (id: string) => this.removeRule(id),
      updateRule: (id: string, updates: any) => this.updateRule(id, updates),
      enableRule: (id: string) => this.enableRule(id),
      disableRule: (id: string) => this.disableRule(id),
      getRules: () => this.getRules(),
      clearRules: () => this.clearRules(),
      enable: () => this.enable(),
      disable: () => this.disable(),
      getConfig: () => this.config,
    };
  }

  // 预设常用的Mock规则
  public addCommonRules(): void {
    // 用户信息
    this.addRule({
      method: 'GET',
      url: '/api/user/info',
      response: {
        code: 0,
        data: {
          id: 1,
          name: '张三',
          email: 'zhangsan@example.com',
          avatar: 'https://via.placeholder.com/64',
          role: 'admin',
        },
        message: 'success',
      },
      description: '获取用户信息',
    });

    // 用户列表
    this.addRule({
      method: 'GET',
      url: '/api/users*',
      response: {
        code: 0,
        data: {
          list: [
            { id: 1, name: '张三', email: 'zhangsan@example.com', status: 'active' },
            { id: 2, name: '李四', email: 'lisi@example.com', status: 'inactive' },
            { id: 3, name: '王五', email: 'wangwu@example.com', status: 'active' },
          ],
          total: 3,
          page: 1,
          pageSize: 10,
        },
        message: 'success',
      },
      description: '获取用户列表',
    });

    // 登录接口
    this.addRule({
      method: 'POST',
      url: '/api/auth/login',
      response: {
        code: 0,
        data: {
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            id: 1,
            name: '张三',
            email: 'zhangsan@example.com',
          },
        },
        message: 'success',
      },
      delay: 1000,
      description: '用户登录',
    });

    console.log('[MockManager] Added common mock rules');
  }

  public destroy(): void {
    this.disable();
    this.rules.clear();
    delete (window as any).__MOCK_MANAGER__;
  }
}

// 导出单例
export const mockManager = MockManager.getInstance();
