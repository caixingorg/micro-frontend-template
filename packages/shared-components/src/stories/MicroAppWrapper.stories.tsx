import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Button, Space } from 'antd';
import { MicroAppWrapper } from '../components/MicroAppWrapper/MicroAppWrapper';

// 模拟微应用容器
const MicroAppDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoad = () => {
    setLoading(true);
    setError(null);
    
    // 模拟加载过程
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const handleError = () => {
    setLoading(false);
    setError('微应用加载失败：网络连接超时');
  };

  const handleRetry = () => {
    setError(null);
    handleLoad();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>微应用容器演示</h3>
      <Space style={{ marginBottom: '20px' }}>
        <Button type="primary" onClick={handleLoad}>
          模拟加载
        </Button>
        <Button danger onClick={handleError}>
          模拟错误
        </Button>
        <Button onClick={() => { setLoading(false); setError(null); }}>
          重置状态
        </Button>
      </Space>

      <MicroAppWrapper
        name="demo-micro-app"
        containerId="demo-container"
        loading={loading}
        error={error}
        onRetry={handleRetry}
        onLoad={() => console.log('微应用加载完成')}
        onUnload={() => console.log('微应用卸载')}
        style={{ border: '1px solid #d9d9d9', borderRadius: '6px' }}
      />
      
      {/* 实际的微应用容器 */}
      <div 
        id="demo-container" 
        style={{ 
          display: loading || error ? 'none' : 'block',
          padding: '20px',
          backgroundColor: '#f0f2f5',
          textAlign: 'center',
          minHeight: '200px',
          lineHeight: '200px'
        }}
      >
        微应用内容区域
      </div>
    </div>
  );
};

const meta: Meta<typeof MicroAppWrapper> = {
  title: 'Components/MicroAppWrapper',
  component: MicroAppWrapper,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
微应用容器组件，用于包装和管理微应用的加载状态。

## 特性

- 🔄 加载状态管理
- ❌ 错误处理和重试
- 🎯 生命周期回调
- 🎨 自定义样式支持
- 🛡️ 错误边界保护

## 使用场景

- 微应用容器
- 动态组件加载
- 异步内容展示
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      description: '微应用名称',
      control: 'text',
    },
    containerId: {
      description: '容器ID',
      control: 'text',
    },
    loading: {
      description: '加载状态',
      control: 'boolean',
    },
    error: {
      description: '错误信息',
      control: 'text',
    },
    onRetry: {
      description: '重试回调',
      control: false,
    },
    onLoad: {
      description: '加载完成回调',
      control: false,
    },
    onUnload: {
      description: '卸载回调',
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <MicroAppDemo />,
  parameters: {
    docs: {
      description: {
        story: '完整的微应用容器演示，包含加载、错误和正常状态。',
      },
    },
  },
};

export const Loading: Story = {
  args: {
    name: 'example-app',
    containerId: 'example-container',
    loading: true,
    error: null,
  },
  parameters: {
    docs: {
      description: {
        story: '加载状态的微应用容器。',
      },
    },
  },
};

export const Error: Story = {
  args: {
    name: 'example-app',
    containerId: 'example-container',
    loading: false,
    error: '微应用加载失败：网络连接超时',
    onRetry: () => alert('重试加载'),
  },
  parameters: {
    docs: {
      description: {
        story: '错误状态的微应用容器，显示错误信息和重试按钮。',
      },
    },
  },
};

export const CustomStyle: Story = {
  args: {
    name: 'styled-app',
    containerId: 'styled-container',
    loading: true,
    style: {
      border: '2px solid #1890ff',
      borderRadius: '12px',
      backgroundColor: '#f6ffed',
      minHeight: '300px',
    },
  },
  parameters: {
    docs: {
      description: {
        story: '自定义样式的微应用容器。',
      },
    },
  },
};

export const WithCallbacks: Story = {
  args: {
    name: 'callback-app',
    containerId: 'callback-container',
    loading: false,
    onLoad: () => console.log('微应用加载完成'),
    onUnload: () => console.log('微应用卸载'),
  },
  parameters: {
    docs: {
      description: {
        story: '带有生命周期回调的微应用容器。',
      },
    },
  },
};
