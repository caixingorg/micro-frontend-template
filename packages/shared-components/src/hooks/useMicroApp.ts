import { useState, useEffect, useCallback } from 'react';
import { microAppManager } from '@enterprise/micro-app-sdk';
import type { MicroAppInstance } from '@enterprise/shared-types';

export interface UseMicroAppOptions {
  /**
   * 微应用名称
   */
  name: string;
  /**
   * 容器选择器
   */
  container?: string;
  /**
   * 是否自动加载
   */
  autoLoad?: boolean;
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
  const { name, container, autoLoad = true, onLoad, onError, onUnload } = options;
  
  const [instance, setInstance] = useState<MicroAppInstance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (loading || instance) return;

    try {
      setLoading(true);
      setError(null);

      const loadedInstance = await microAppManager.loadApp(name, container);
      
      if (loadedInstance) {
        setInstance(loadedInstance);
        onLoad?.(loadedInstance);
      } else {
        throw new Error(`Failed to load micro app: ${name}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [name, container, loading, instance, onLoad, onError]);

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
  }, [autoLoad]); // 只在 autoLoad 变化时执行

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
