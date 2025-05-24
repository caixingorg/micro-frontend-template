import { useState, useEffect, useCallback } from 'react';
import { microAppManager } from '@enterprise/micro-app-sdk';
import type { MicroAppInstance } from '@enterprise/shared-types';

export interface UseMicroAppOptions {
  /**
   * 微应用名称
   */
  name: string;
  /**
   * 容器选择器或DOM元素
   */
  container?: string | HTMLElement;
  /**
   * 是否自动加载
   */
  autoLoad?: boolean;
  /**
   * 传递给微应用的属性
   */
  props?: Record<string, any>;
  /**
   * 微应用加载配置
   */
  configuration?: {
    /**
     * 是否开启沙箱
     * @default true
     */
    sandbox?: boolean | {
      /**
       * 是否开启严格样式隔离
       * @default false
       */
      strictStyleIsolation?: boolean;
      /**
       * 是否开启实验性样式隔离
       * @default false
       */
      experimentalStyleIsolation?: boolean;
    };
    /**
     * 是否为单实例场景
     * @default false
     */
    singular?: boolean;
    /**
     * 自定义fetch方法
     */
    fetch?: typeof window.fetch;
    /**
     * 自定义获取publicPath的方法
     */
    getPublicPath?: (entry: string) => string;
    /**
     * 自定义获取模板的方法
     */
    getTemplate?: (tpl: string) => string;
    /**
     * 自定义排除资源的方法
     */
    excludeAssetFilter?: (assetUrl: string) => boolean;
  };
  /**
   * 加载完成回调
   */
  onLoad?: (instance: MicroAppInstance) => void;
  /**
   * 加载失败回调
   */
  onError?: (error: Error) => void;
  /**
   * 卸载回调
   */
  onUnload?: () => void;
}

export interface UseMicroAppReturn {
  /**
   * 微应用实例
   */
  instance: MicroAppInstance | null;
  /**
   * 加载状态
   */
  loading: boolean;
  /**
   * 错误信息
   */
  error: string | null;
  /**
   * 手动加载微应用
   */
  load: () => Promise<void>;
  /**
   * 卸载微应用
   */
  unload: () => Promise<void>;
  /**
   * 重新加载微应用
   */
  reload: () => Promise<void>;
  /**
   * 清除错误
   */
  clearError: () => void;
}

export const useMicroApp = (options: UseMicroAppOptions): UseMicroAppReturn => {
  const { name, container, props, configuration, autoLoad = true, onLoad, onError, onUnload } = options;

  const [instance, setInstance] = useState<MicroAppInstance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 检查微应用是否已经通过 qiankun 路由加载
      const existingInstance = microAppManager.getInstance(name);
      if (existingInstance) {
        console.log(`[useMicroApp] Found existing instance for ${name}`);
        setInstance(existingInstance);
        onLoad?.(existingInstance);
        return;
      }

      // 等待一段时间让 qiankun 路由系统加载微应用
      console.log(`[useMicroApp] Waiting for qiankun router to load ${name}...`);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const loadedInstance = microAppManager.getInstance(name);
      if (loadedInstance) {
        console.log(`[useMicroApp] Found instance loaded by qiankun router for ${name}`);
        setInstance(loadedInstance);
        onLoad?.(loadedInstance);
      } else {
        // 如果路由系统没有加载，则手动加载
        console.log(`[useMicroApp] Manually loading ${name}...`);
        const defaultContainer = container || '#container';
        const manualInstance = await microAppManager.loadApp(
          name, 
          defaultContainer, 
          props, 
          configuration
        );
        
        if (manualInstance) {
          console.log(`[useMicroApp] Successfully loaded ${name} manually`);
          setInstance(manualInstance);
          onLoad?.(manualInstance);
        } else {
          throw new Error(`Failed to load micro app: ${name}`);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[useMicroApp] Error loading ${name}:`, errorMessage);
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [name, container, props, configuration, onLoad, onError]);

  const unload = useCallback(async () => {
    if (!instance) return;

    try {
      await microAppManager.unloadApp(name);
      setInstance(null);
      onUnload?.();
    } catch (err) {
      console.error(`Failed to unload micro app ${name}:`, err);
    }
  }, [name, instance, onUnload]);

  const reload = useCallback(async () => {
    await unload();
    await load();
  }, [unload, load]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoLoad) {
      load();
    }

    return () => {
      if (instance) {
        unload();
      }
    };
  }, [autoLoad, load, unload, instance]); // 添加依赖项

  return {
    instance,
    loading,
    error,
    load,
    unload,
    reload,
    clearError,
  };
};

export default useMicroApp;
