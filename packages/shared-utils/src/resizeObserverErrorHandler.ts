/**
 * ResizeObserver错误处理工具
 * 用于处理微前端环境中常见的ResizeObserver循环错误
 */

/**
 * 处理ResizeObserver循环错误
 * 这个错误在微前端环境中很常见，通常不影响功能，但会在控制台产生噪音
 */
export const handleResizeObserverError = (): void => {
  // 保存原始的console.error方法
  const originalError = console.error;
  
  // 重写console.error方法，过滤ResizeObserver错误
  console.error = (...args: any[]) => {
    const errorMessage = args[0];
    
    // 检查是否是ResizeObserver循环错误
    if (
      typeof errorMessage === 'string' &&
      errorMessage.includes('ResizeObserver loop completed with undelivered notifications')
    ) {
      // 忽略这个特定的错误，不输出到控制台
      return;
    }
    
    // 其他错误正常输出
    originalError.apply(console, args);
  };

  // 处理未捕获的错误事件
  window.addEventListener('error', (event: ErrorEvent) => {
    if (
      event.message &&
      event.message.includes('ResizeObserver loop completed with undelivered notifications')
    ) {
      // 阻止错误冒泡
      event.preventDefault();
      return false;
    }
  });

  // 处理未捕获的Promise错误
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    if (
      event.reason &&
      typeof event.reason === 'string' &&
      event.reason.includes('ResizeObserver loop completed with undelivered notifications')
    ) {
      // 阻止错误冒泡
      event.preventDefault();
      return false;
    }
  });
};

/**
 * 创建一个安全的ResizeObserver包装器
 * 自动处理循环错误，避免在微前端环境中出现问题
 */
export const createSafeResizeObserver = (
  callback: ResizeObserverCallback
): ResizeObserver => {
  const safeCallback: ResizeObserverCallback = (entries, observer) => {
    try {
      // 使用requestAnimationFrame来避免循环问题
      requestAnimationFrame(() => {
        callback(entries, observer);
      });
    } catch (error) {
      // 忽略ResizeObserver相关的错误
      if (
        error instanceof Error &&
        error.message.includes('ResizeObserver loop completed with undelivered notifications')
      ) {
        return;
      }
      // 其他错误正常抛出
      throw error;
    }
  };

  return new ResizeObserver(safeCallback);
};

/**
 * 微前端环境初始化函数
 * 在微应用启动时调用，设置必要的错误处理
 */
export const initMicroFrontendErrorHandling = (): void => {
  // 处理ResizeObserver错误
  handleResizeObserverError();
  
  // 可以在这里添加其他微前端相关的错误处理
  console.log('[MicroFrontend] Error handling initialized');
};

/**
 * 检查是否在qiankun环境中运行
 */
export const isQiankunEnvironment = (): boolean => {
  return !!(window as any).__POWERED_BY_QIANKUN__;
};

/**
 * 微前端环境专用的错误处理配置
 */
export const microFrontendErrorConfig = {
  // 是否启用ResizeObserver错误处理
  enableResizeObserverErrorHandling: true,
  
  // 是否在控制台输出调试信息
  enableDebugLogging: process.env.NODE_ENV === 'development',
  
  // 错误过滤规则
  errorFilters: [
    'ResizeObserver loop completed with undelivered notifications',
    'ResizeObserver loop limit exceeded',
  ],
} as const;

export default {
  handleResizeObserverError,
  createSafeResizeObserver,
  initMicroFrontendErrorHandling,
  isQiankunEnvironment,
  microFrontendErrorConfig,
};
