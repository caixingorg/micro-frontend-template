import React from 'react';
import { Spin } from 'antd';
import ErrorBoundary from './ErrorBoundary';
import { useResponsive } from '@/hooks/useResponsive';
import '@/styles/micro-app-container.css';

const MicroAppContainer: React.FC = () => {
  const responsive = useResponsive();

  // 根据屏幕尺寸设置固定高度，避免ResizeObserver循环
  const containerHeight = responsive.isMobile 
    ? 'calc(100vh - 180px)' 
    : 'calc(100vh - 220px)';

  return (
    <ErrorBoundary>
      <div
        id="micro-app-container"
        style={{
          width: '100%',
          height: containerHeight, // 固定高度，避免ResizeObserver循环
          position: 'relative',
          borderRadius: '8px',
          overflow: 'auto', // 内容溢出时显示滚动条
          backgroundColor: '#fff',
          boxSizing: 'border-box',
          // 平滑过渡
          transition: 'height 0.2s ease-in-out',
        }}
        className="micro-app-container"
      >
        {/* qiankun 会自动在这里渲染微应用 */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#999',
            display: 'none', // 默认隐藏，只有在加载时显示
            zIndex: 1000,
          }}
          className="micro-app-loading"
        >
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>正在加载微应用...</div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default MicroAppContainer;
