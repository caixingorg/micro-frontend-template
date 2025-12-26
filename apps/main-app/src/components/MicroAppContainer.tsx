import React from 'react';
import { Alert } from 'antd';
import ErrorBoundary from './ErrorBoundary';
import { useResponsive } from '@/hooks/useResponsive';
import { useMicroApp } from '@/hooks/useMicroApp';
import '@/styles/micro-app-container.css';

const MicroAppContainer: React.FC = () => {
  const responsive = useResponsive();
  const { loading, error } = useMicroApp();
  const [retryKey, setRetryKey] = React.useState(0); // 用于强制重新渲染容器

  // 根据屏幕尺寸设置固定高度，避免ResizeObserver循环
  const containerHeight = responsive.isMobile
    ? 'calc(100vh - 180px)'
    : 'calc(100vh - 220px)';

  // 处理重试逻辑
  const handleRetry = () => {
    console.log('[MicroAppContainer] Retrying mount...');
    setRetryKey(prev => prev + 1);

    // 触发 popstate 事件，通知 qiankun 重新尝试加载
    // 因为 DOM 重建后 qiankun 需要重新检测路由匹配
    setTimeout(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, 100);
  };

  // 渲染错误状态 (useMicroApp Hook返回的加载错误)
  const renderErrorState = () => {
    if (!error) return null;

    return (
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          zIndex: 1001, // 确保显示在顶层
        }}
      >
        <Alert
          message="微应用加载异常"
          description={error}
          type="error"
          showIcon
          closable
          banner
        />
      </div>
    );
  };

  return (
    <ErrorBoundary onRetry={handleRetry}>
      <div
        // key 变化时，React 会销毁旧 div 并创建新 div
        // 这相当于重置了挂载点
        key={retryKey}
        id="micro-app-container"
        style={{
          width: '100%',
          height: containerHeight,
          position: 'relative',
          borderRadius: '8px',
          overflow: 'auto',
          backgroundColor: '#fff',
          boxSizing: 'border-box',
          transition: 'height 0.2s ease-in-out',
        }}
        className="micro-app-container"
      >
        {/* qiankun会自动在这个容器中渲染微应用 */}

        {/* useMicroApp Hook 返回的错误状态 (通常是加载脚本失败) */}
        {renderErrorState()}
      </div>
    </ErrorBoundary>
  );
};

export default MicroAppContainer;
