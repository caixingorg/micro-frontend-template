/**
 * 检查是否在qiankun环境中运行
 */
export function isQiankunEnvironment(): boolean {
  return !!(window as any).__POWERED_BY_QIANKUN__;
}

/**
 * 获取qiankun的公共路径
 */
export function getPublicPath(): string {
  if (isQiankunEnvironment()) {
    return (window as any).__INJECTED_PUBLIC_PATH_BY_QIANKUN__ || '/';
  }
  return '/';
}

/**
 * 设置webpack的公共路径
 */
export function setWebpackPublicPath(): void {
  if (isQiankunEnvironment()) {
    // eslint-disable-next-line no-undef
    __webpack_public_path__ = getPublicPath();
  }
}

/**
 * 生成唯一ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 深度合并对象
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}

/**
 * 检查是否为对象
 */
function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * 安全的JSON解析
 */
export function safeJsonParse<T = any>(str: string, defaultValue: T): T {
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
}

/**
 * 获取环境变量
 */
export function getEnvVar(key: string, defaultValue = ''): string {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  return defaultValue;
}

/**
 * 检查是否为开发环境
 */
export function isDevelopment(): boolean {
  return getEnvVar('NODE_ENV') === 'development';
}

/**
 * 检查是否为生产环境
 */
export function isProduction(): boolean {
  return getEnvVar('NODE_ENV') === 'production';
}

/**
 * 格式化错误信息
 */
export function formatError(error: Error | string): string {
  if (typeof error === 'string') {
    return error;
  }
  
  return `${error.name}: ${error.message}${
    error.stack ? `\n${error.stack}` : ''
  }`;
}

/**
 * 创建错误边界包装器
 */
export function createErrorBoundary<T extends (...args: any[]) => any>(
  fn: T,
  onError?: (error: Error) => void
): T {
  return ((...args: Parameters<T>) => {
    try {
      return fn(...args);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
      throw err;
    }
  }) as T;
}
