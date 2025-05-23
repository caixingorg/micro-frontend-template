// 微应用相关类型
export interface MicroAppConfig {
  name: string;
  entry: string;
  container: string;
  activeRule: string;
  props?: Record<string, any>;
}

export interface MicroAppLifeCycles {
  beforeLoad?: (app: MicroAppConfig) => Promise<void> | void;
  beforeMount?: (app: MicroAppConfig) => Promise<void> | void;
  afterMount?: (app: MicroAppConfig) => Promise<void> | void;
  beforeUnmount?: (app: MicroAppConfig) => Promise<void> | void;
  afterUnmount?: (app: MicroAppConfig) => Promise<void> | void;
}

export interface MicroAppInstance {
  name: string;
  status: 'NOT_LOADED' | 'LOADING_SOURCE_CODE' | 'NOT_BOOTSTRAPPED' | 'BOOTSTRAPPING' | 'NOT_MOUNTED' | 'MOUNTING' | 'MOUNTED' | 'UPDATING' | 'UNMOUNTING' | 'UNLOADING' | 'SKIP_BECAUSE_BROKEN' | 'LOAD_ERROR';
  loadPromise: Promise<void>;
  bootstrapPromise: Promise<void>;
  mountPromise: Promise<void>;
  unmountPromise: Promise<void>;
  getStatus(): string;
  mount(): Promise<void>;
  unmount(): Promise<void>;
  update(props: Record<string, any>): Promise<void>;
}

// 用户相关类型
export interface UserInfo {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  roles: string[];
  permissions: string[];
}

// 全局状态类型
export interface GlobalState {
  user: UserInfo | null;
  theme: 'light' | 'dark';
  language: string;
  loading: boolean;
}

// 路由相关类型
export interface RouteConfig {
  path: string;
  name: string;
  component?: React.ComponentType<any>;
  microApp?: string;
  meta?: {
    title?: string;
    icon?: string;
    requireAuth?: boolean;
    roles?: string[];
  };
  children?: RouteConfig[];
}

// 菜单相关类型
export interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
  meta?: {
    requireAuth?: boolean;
    roles?: string[];
  };
}

// 通信相关类型
export interface MicroAppMessage {
  type: string;
  payload: any;
  source: string;
  target?: string;
}

export interface EventBusEvents {
  'user:login': UserInfo;
  'user:logout': void;
  'theme:change': 'light' | 'dark';
  'language:change': string;
  'route:change': string;
  'micro-app:mount': string;
  'micro-app:unmount': string;
}

// API相关类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationResponse<T = any> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 环境配置类型
export interface EnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  API_BASE_URL: string;
  MICRO_APP_BASE_URL: string;
  ENABLE_MOCK: boolean;
}

// 错误相关类型
export interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  errorBoundary?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}
