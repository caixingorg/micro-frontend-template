import React, { Component, ReactNode } from 'react';
import { Result, Button } from 'antd';
import type { ErrorInfo } from '@enterprise/shared-types';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const customErrorInfo: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack || undefined,
      errorBoundary: this.constructor.name,
    };

    this.setState({
      error,
      errorInfo: customErrorInfo,
    });

    // 调用错误回调
    this.props.onError?.(error, customErrorInfo);

    // 上报错误到监控系统
    this.reportError(error, customErrorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // 这里可以集成错误监控服务，如 Sentry
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // 发送到错误监控服务
    if (window.location.hostname !== 'localhost') {
      // 生产环境才上报
      // Sentry.captureException(error, { extra: errorInfo });
    }
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // 自定义错误UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误UI
      return (
        <Result
          status="error"
          title="应用出现错误"
          subTitle={
            process.env.NODE_ENV === 'development'
              ? this.state.error?.message
              : '抱歉，应用遇到了一些问题，请稍后重试。'
          }
          extra={[
            <Button type="primary" key="retry" onClick={this.handleRetry}>
              重试
            </Button>,
            <Button key="reload" onClick={this.handleReload}>
              刷新页面
            </Button>,
          ]}
        >
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <div style={{ textAlign: 'left', marginTop: 16 }}>
              <details>
                <summary>错误详情</summary>
                <pre style={{ fontSize: 12, overflow: 'auto' }}>
                  {this.state.errorInfo.stack}
                </pre>
                {this.state.errorInfo.componentStack && (
                  <pre style={{ fontSize: 12, overflow: 'auto' }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            </div>
          )}
        </Result>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
