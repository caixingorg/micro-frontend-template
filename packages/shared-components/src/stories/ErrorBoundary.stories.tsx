import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Button } from 'antd';
import { ErrorBoundary } from '../components/ErrorBoundary/ErrorBoundary';

// 故意出错的组件
const BuggyComponent: React.FC<{ shouldError: boolean }> = ({ shouldError }) => {
  if (shouldError) {
    throw new Error('This is a test error from BuggyComponent');
  }
  return <div>This component works fine!</div>;
};

// 包装组件用于演示
const ErrorBoundaryDemo: React.FC = () => {
  const [hasError, setHasError] = useState(false);

  return (
    <div style={{ padding: '20px' }}>
      <h3>错误边界演示</h3>
      <p>点击按钮触发错误，查看错误边界的处理效果：</p>
      
      <Button 
        type="primary" 
        onClick={() => setHasError(!hasError)}
        style={{ marginBottom: '20px' }}
      >
        {hasError ? '恢复正常' : '触发错误'}
      </Button>

      <ErrorBoundary
        onError={(error, errorInfo) => {
          console.log('错误被捕获:', error, errorInfo);
        }}
      >
        <div style={{ 
          border: '1px solid #d9d9d9', 
          padding: '16px', 
          borderRadius: '6px',
          backgroundColor: '#fafafa'
        }}>
          <BuggyComponent shouldError={hasError} />
        </div>
      </ErrorBoundary>
    </div>
  );
};

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Components/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
错误边界组件用于捕获子组件中的JavaScript错误，并显示友好的错误界面。

## 特性

- 🛡️ 捕获子组件中的JavaScript错误
- 📊 自动上报错误信息到监控系统
- 🎨 提供友好的错误界面
- 🔄 支持错误恢复和重试
- 🐛 开发环境显示详细错误信息

## 使用场景

- 微应用容器
- 关键业务组件
- 路由级别的错误处理
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      description: '子组件',
      control: false,
    },
    fallback: {
      description: '自定义错误界面',
      control: false,
    },
    onError: {
      description: '错误回调函数',
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <ErrorBoundaryDemo />,
  parameters: {
    docs: {
      description: {
        story: '默认的错误边界组件，包含重试和刷新功能。',
      },
    },
  },
};

export const WithCustomFallback: Story = {
  render: () => (
    <ErrorBoundary
      fallback={
        <div style={{ 
          padding: '40px', 
          textAlign: 'center',
          backgroundColor: '#fff2f0',
          border: '1px solid #ffccc7',
          borderRadius: '6px'
        }}>
          <h3 style={{ color: '#cf1322' }}>自定义错误界面</h3>
          <p>这是一个自定义的错误显示界面</p>
        </div>
      }
    >
      <BuggyComponent shouldError={true} />
    </ErrorBoundary>
  ),
  parameters: {
    docs: {
      description: {
        story: '使用自定义错误界面的错误边界组件。',
      },
    },
  },
};

export const WithErrorCallback: Story = {
  render: () => (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        alert(`错误被捕获: ${error.message}`);
      }}
    >
      <BuggyComponent shouldError={true} />
    </ErrorBoundary>
  ),
  parameters: {
    docs: {
      description: {
        story: '带有错误回调的错误边界组件，可以自定义错误处理逻辑。',
      },
    },
  },
};
