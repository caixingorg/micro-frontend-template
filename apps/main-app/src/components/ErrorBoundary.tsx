import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button } from 'antd';

interface Props {
  children: ReactNode;
  appName?: string;
  fallback?: ReactNode;
  onRetry?: () => void; // 新增重试回调
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error in ${this.props.appName || 'micro app'}:`, error);
    console.error('Error info:', errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    // 如果父组件传递了onRetry，则调用；否则默认只重置状态（可能不足以恢复，取决于父组件逻辑）
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ padding: '20px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Alert
            message="应用加载失败"
            description={
              <div>
                <p>{this.state.error?.message || '未知错误'}</p>
                <div style={{ marginTop: 16 }}>
                  <Button
                    type="primary"
                    danger
                    onClick={this.handleReload}
                  >
                    尝试恢复
                  </Button>
                </div>
              </div>
            }
            type="error"
            showIcon
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
