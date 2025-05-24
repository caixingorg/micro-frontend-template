import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button } from 'antd';

interface Props {
  children: ReactNode;
  appName?: string;
  fallback?: ReactNode;
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
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ padding: '20px' }}>
          <Alert
            message="应用加载失败"
            description={
              <div>
                <p>{this.state.error?.message || '未知错误'}</p>
                <Button
                  type="primary"
                  danger
                  onClick={this.handleReload}
                  style={{ marginTop: '16px' }}
                >
                  重新加载
                </Button>
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
