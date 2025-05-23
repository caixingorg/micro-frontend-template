import React from 'react';
import { Spin, SpinProps } from 'antd';

export interface LoadingProps extends SpinProps {
  /**
   * 加载文本
   */
  text?: string;
  /**
   * 是否全屏加载
   */
  fullscreen?: boolean;
  /**
   * 最小加载时间（毫秒），防止闪烁
   */
  minDuration?: number;
}

export const Loading: React.FC<LoadingProps> = ({
  text = '加载中...',
  fullscreen = false,
  size = 'large',
  spinning = true,
  style,
  ...props
}) => {
  const loadingStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    ...style,
  };

  if (fullscreen) {
    loadingStyle.position = 'fixed';
    loadingStyle.top = 0;
    loadingStyle.left = 0;
    loadingStyle.right = 0;
    loadingStyle.bottom = 0;
    loadingStyle.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    loadingStyle.zIndex = 9999;
  }

  return (
    <div style={loadingStyle}>
      <Spin size={size} spinning={spinning} tip={text} {...props} />
    </div>
  );
};

/**
 * 页面级加载组件
 */
export const PageLoading: React.FC<{ text?: string }> = ({ text }) => (
  <Loading
    text={text}
    style={{
      minHeight: '200px',
    }}
  />
);

/**
 * 全屏加载组件
 */
export const FullscreenLoading: React.FC<{ text?: string }> = ({ text }) => (
  <Loading text={text} fullscreen />
);

export default Loading;
