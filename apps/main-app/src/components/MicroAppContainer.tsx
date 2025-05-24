import React from 'react';
import { Spin } from 'antd';
import ErrorBoundary from './ErrorBoundary';

const MicroAppContainer: React.FC = () => {
  return (
    <ErrorBoundary>
      <div
        id="micro-app-container"
        style={{
          width: '100%',
          minHeight: '600px',
          position: 'relative',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
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
