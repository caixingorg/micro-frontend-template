import React, { useEffect, useRef } from 'react';
import { Spin, Alert } from 'antd';
import { useParams } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '@/store';
import {
  setActiveApp,
  addLoadingApp,
  addLoadedApp,
  setAppError,
} from '@/store/slices/microAppSlice';
import { microAppManager } from '@enterprise/micro-app-sdk';

interface MicroAppContainerProps {
  name: string;
  containerId: string;
}

const MicroAppContainer: React.FC<MicroAppContainerProps> = ({
  name,
  containerId,
}) => {
  const dispatch = useAppDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const { loadingApps, errorApps } = useAppSelector(state => state.microApp);
  
  const isLoading = loadingApps.includes(name);
  const error = errorApps[name];

  useEffect(() => {
    const loadMicroApp = async () => {
      try {
        dispatch(addLoadingApp(name));
        dispatch(setActiveApp(name));

        // 显示容器
        const container = document.getElementById(containerId);
        if (container) {
          container.style.display = 'block';
        }

        // 加载微应用
        const instance = await microAppManager.loadApp(name, `#${containerId}`);
        
        if (instance) {
          dispatch(addLoadedApp(name));
        } else {
          throw new Error(`Failed to load micro app: ${name}`);
        }
      } catch (error) {
        console.error(`Error loading micro app ${name}:`, error);
        dispatch(setAppError({
          app: name,
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
      }
    };

    loadMicroApp();

    // 清理函数
    return () => {
      const container = document.getElementById(containerId);
      if (container) {
        container.style.display = 'none';
      }
    };
  }, [name, containerId, dispatch]);

  if (error) {
    return (
      <Alert
        message="微应用加载失败"
        description={error}
        type="error"
        showIcon
        action={
          <button
            onClick={() => window.location.reload()}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#1890ff',
              cursor: 'pointer',
            }}
          >
            重新加载
          </button>
        }
      />
    );
  }

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
        }}
      >
        <Spin size="large" tip={`正在加载 ${name}...`} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '500px',
      }}
    >
      {/* 微应用将在这里渲染 */}
    </div>
  );
};

export default MicroAppContainer;
