import React, { useEffect, useRef, useState } from 'react';
import { Alert } from 'antd';
import { ErrorBoundary } from '../ErrorBoundary/ErrorBoundary';
import { Loading } from '../Loading/Loading';

export interface MicroAppWrapperProps {
  /**
   * 微应用名称
   */
  name: string;
  /**
   * 容器ID
   */
  containerId: string;
  /**
   * 加载状态
   */
  loading?: boolean;
  /**
   * 错误信息
   */
  error?: string;
  /**
   * 自定义样式
   */
  style?: React.CSSProperties;
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 错误重试回调
   */
  onRetry?: () => void;
  /**
   * 微应用加载完成回调
   */
  onLoad?: () => void;
  /**
   * 微应用卸载回调
   */
  onUnload?: () => void;
}

export const MicroAppWrapper: React.FC<MicroAppWrapperProps> = ({
  name,
  containerId,
  loading = false,
  error,
  style,
  className,
  onRetry,
  onLoad,
  onUnload,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 创建或获取微应用容器
    let container = document.getElementById(containerId);

    if (!container) {
      // 如果容器不存在，创建一个新的容器
      container = document.createElement('div');
      container.id = containerId;
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.minHeight = '400px';
      container.style.overflow = 'hidden';

      // 将容器添加到当前组件的 ref 中
      if (containerRef.current) {
        containerRef.current.appendChild(container);
      }
    }

    if (container) {
      container.style.display = 'block';
      setMounted(true);
      onLoad?.();
    }

    return () => {
      // 清理容器但不移除，避免影响微应用的卸载
      if (container) {
        setMounted(false);
        onUnload?.();
      }
    };
  }, [containerId]); // 移除onLoad和onUnload依赖，避免无限循环

  const defaultStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '400px',
    position: 'relative',
    ...style,
  };

  if (error) {
    return (
      <div style={defaultStyle} className={className}>
        <Alert
          message="微应用加载失败"
          description={error}
          type="error"
          showIcon
          action={
            onRetry && (
              <button
                onClick={onRetry}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#1890ff',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                重新加载
              </button>
            )
          }
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div style={defaultStyle} className={className}>
        <Loading text={`正在加载 ${name}...`} />
      </div>
    );
  }

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error(`[MicroAppWrapper] Error in ${name}:`, error, errorInfo);
      }}
    >
      <div
        ref={containerRef}
        style={defaultStyle}
        className={className}
        data-micro-app={name}
        data-container-id={containerId}
      >
        {!mounted && <Loading text={`初始化 ${name}...`} />}
      </div>
    </ErrorBoundary>
  );
};

export default MicroAppWrapper;
