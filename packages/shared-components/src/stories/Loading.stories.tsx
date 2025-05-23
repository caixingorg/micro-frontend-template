import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Loading, PageLoading, FullscreenLoading } from '../components/Loading/Loading';

const meta: Meta<typeof Loading> = {
  title: 'Components/Loading',
  component: Loading,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
加载状态组件，提供多种加载样式和配置选项。

## 特性

- 🎨 多种加载样式
- 📱 支持全屏加载
- ⚡ 防闪烁机制
- 🎯 灵活的配置选项

## 组件变体

- \`Loading\` - 基础加载组件
- \`PageLoading\` - 页面级加载组件
- \`FullscreenLoading\` - 全屏加载组件
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    text: {
      description: '加载文本',
      control: 'text',
    },
    size: {
      description: '加载图标大小',
      control: 'select',
      options: ['small', 'default', 'large'],
    },
    spinning: {
      description: '是否显示加载状态',
      control: 'boolean',
    },
    fullscreen: {
      description: '是否全屏显示',
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: '加载中...',
    size: 'large',
    spinning: true,
  },
  parameters: {
    docs: {
      description: {
        story: '默认的加载组件。',
      },
    },
  },
};

export const Small: Story = {
  args: {
    text: '请稍候',
    size: 'small',
    spinning: true,
  },
  parameters: {
    docs: {
      description: {
        story: '小尺寸的加载组件。',
      },
    },
  },
};

export const Large: Story = {
  args: {
    text: '正在加载数据...',
    size: 'large',
    spinning: true,
  },
  parameters: {
    docs: {
      description: {
        story: '大尺寸的加载组件。',
      },
    },
  },
};

export const CustomText: Story = {
  args: {
    text: '正在初始化微应用...',
    size: 'large',
    spinning: true,
  },
  parameters: {
    docs: {
      description: {
        story: '自定义加载文本的组件。',
      },
    },
  },
};

export const PageLoadingExample: Story = {
  render: () => <PageLoading text="页面加载中..." />,
  parameters: {
    docs: {
      description: {
        story: '页面级加载组件，适用于页面或大块内容的加载。',
      },
    },
  },
};

export const FullscreenExample: Story = {
  render: () => (
    <div style={{ position: 'relative', height: '300px' }}>
      <div style={{ padding: '20px' }}>
        <h3>页面内容</h3>
        <p>这是页面的正常内容...</p>
      </div>
      <FullscreenLoading text="全屏加载中..." />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '全屏加载组件，会覆盖整个视口。',
      },
    },
  },
};

export const WithoutText: Story = {
  args: {
    text: '',
    size: 'large',
    spinning: true,
  },
  parameters: {
    docs: {
      description: {
        story: '不显示文本的加载组件。',
      },
    },
  },
};

export const NotSpinning: Story = {
  args: {
    text: '加载完成',
    size: 'large',
    spinning: false,
  },
  parameters: {
    docs: {
      description: {
        story: '停止旋转的加载组件。',
      },
    },
  },
};
