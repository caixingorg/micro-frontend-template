import { useState, useEffect } from 'react';

interface MicroAppState {
  loading: boolean;
  error: string | null;
}

export const useMicroApp = () => {
  const [state, setState] = useState<MicroAppState>({
    loading: false,
    error: null,
  });

  // 监听路由变化来更新loading状态
  useEffect(() => {
    // 这里可以根据路由变化来更新loading状态
    // 由于qiankun会自动处理应用的加载和卸载，我们只需要提供基本的状态管理
    const handleRouteChange = () => {
      setState(prev => ({ ...prev, loading: false }));
    };

    // 监听路由变化
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return {
    // 状态
    loading: state.loading,
    error: state.error,
  };
};
