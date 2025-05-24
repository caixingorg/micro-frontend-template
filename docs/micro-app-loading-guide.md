# 微应用加载指南

本文档提供了关于如何在主应用中加载微应用的详细指南，包括配置选项和最佳实践。

## 目录

- [基本概念](#基本概念)
- [加载方式](#加载方式)
- [配置选项](#配置选项)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)

## 基本概念

在我们的微前端架构中，有两种方式加载微应用：

1. **路由自动加载**：当用户访问特定路由时，qiankun 会自动加载对应的微应用。
2. **手动加载**：通过 API 手动加载微应用，适用于不依赖路由的场景。

## 加载方式

### 路由自动加载

路由自动加载是通过在主应用中注册微应用配置，并启动 qiankun 实现的：

```tsx
// 在 App.tsx 中
import { microAppManager } from '@enterprise/micro-app-sdk';
import { microApps } from '@/config/microApps';

// 注册微应用
microAppManager.registerApps(microApps);

// 启动 qiankun
microAppManager.start({
  prefetch: false,
  singular: false,
  sandbox: {
    strictStyleIsolation: false,
    experimentalStyleIsolation: false,
  },
});
```

然后，在路由组件中使用 `SimpleMicroAppContainer` 组件创建容器：

```tsx
import React from 'react';
import SimpleMicroAppContainer from '@/components/MicroApp/SimpleMicroAppContainer';

const ReactMicroApp: React.FC = () => {
  return (
    <SimpleMicroAppContainer
      name="react-micro-app"
      containerId="react-micro-app-container"
    />
  );
};

export default ReactMicroApp;
```

### 手动加载

手动加载是通过 `MicroAppContainer` 组件和 `useMicroApp` hook 实现的：

```tsx
import React from 'react';
import { MicroAppContainer } from '@/components/MicroApp/MicroAppContainer';

const CustomMicroApp: React.FC = () => {
  return (
    <MicroAppContainer
      name="custom-micro-app"
      containerId="custom-micro-app-container"
      props={{
        customProp: 'value',
      }}
      configuration={{
        sandbox: {
          strictStyleIsolation: true,
        },
      }}
    />
  );
};

export default CustomMicroApp;
```

或者直接使用 `useMicroApp` hook：

```tsx
import React, { useEffect } from 'react';
import { useMicroApp } from '@enterprise/shared-components';

const CustomMicroApp: React.FC = () => {
  const { instance, loading, error, load, unload, reload } = useMicroApp({
    name: 'custom-micro-app',
    container: '#custom-micro-app-container',
    props: {
      customProp: 'value',
    },
    configuration: {
      sandbox: {
        strictStyleIsolation: true,
      },
    },
    onLoad: (instance) => {
      console.log('微应用加载成功', instance);
    },
    onError: (error) => {
      console.error('微应用加载失败', error);
    },
  });

  // 自定义加载逻辑
  useEffect(() => {
    // 可以在特定条件下手动加载/卸载微应用
    if (someCondition) {
      load();
    } else {
      unload();
    }
  }, [someCondition, load, unload]);

  return (
    <div>
      {loading && <div>加载中...</div>}
      {error && <div>加载失败: {error}</div>}
      <div id="custom-micro-app-container" />
      {instance && <button onClick={reload}>重新加载</button>}
    </div>
  );
};

export default CustomMicroApp;
```

## 配置选项

### 微应用配置

在 `microApps.ts` 中定义微应用配置：

```ts
import type { MicroAppConfig } from '@enterprise/shared-types';

export const microApps: MicroAppConfig[] = [
  {
    name: 'react-micro-app',
    entry: process.env.NODE_ENV === 'development'
      ? 'http://localhost:3001'
      : '/react-micro-app',
    container: '#react-micro-app-container',
    activeRule: '/react-app',
    props: {
      routerBase: '/react-app',
    },
  },
  // 其他微应用...
];
```

### useMicroApp 选项

`useMicroApp` hook 支持以下选项：

```ts
export interface UseMicroAppOptions {
  /**
   * 微应用名称
   */
  name: string;
  /**
   * 容器选择器或DOM元素
   */
  container?: string | HTMLElement;
  /**
   * 是否自动加载
   */
  autoLoad?: boolean;
  /**
   * 传递给微应用的属性
   */
  props?: Record<string, any>;
  /**
   * 微应用加载配置
   */
  configuration?: {
    /**
     * 是否开启沙箱
     * @default true
     */
    sandbox?: boolean | {
      /**
       * 是否开启严格样式隔离
       * @default false
       */
      strictStyleIsolation?: boolean;
      /**
       * 是否开启实验性样式隔离
       * @default false
       */
      experimentalStyleIsolation?: boolean;
    };
    /**
     * 是否为单实例场景
     * @default false
     */
    singular?: boolean;
    /**
     * 自定义fetch方法
     */
    fetch?: typeof window.fetch;
    /**
     * 自定义获取publicPath的方法
     */
    getPublicPath?: (entry: string) => string;
    /**
     * 自定义获取模板的方法
     */
    getTemplate?: (tpl: string) => string;
    /**
     * 自定义排除资源的方法
     */
    excludeAssetFilter?: (assetUrl: string) => boolean;
  };
  /**
   * 加载完成回调
   */
  onLoad?: (instance: MicroAppInstance) => void;
  /**
   * 加载失败回调
   */
  onError?: (error: Error) => void;
  /**
   * 卸载回调
   */
  onUnload?: () => void;
}
```

## 最佳实践

### 1. 关闭预加载

在开发环境中，建议关闭预加载以避免不必要的网络请求：

```ts
microAppManager.start({
  prefetch: false,
  // 其他配置...
});
```

### 2. 样式隔离

根据需要选择合适的样式隔离策略：

- **无样式隔离**：适用于样式命名规范良好的场景
- **实验性样式隔离**：通过为所有样式添加特定前缀实现隔离
- **严格样式隔离**：使用 Shadow DOM 实现完全隔离，但可能需要额外适配

```ts
// 示例：使用严格样式隔离
useMicroApp({
  name: 'app',
  container: '#container',
  configuration: {
    sandbox: {
      strictStyleIsolation: true,
    },
  },
});
```

### 3. 错误处理

始终添加错误处理逻辑，确保微应用加载失败时有良好的用户体验：

```ts
useMicroApp({
  name: 'app',
  container: '#container',
  onError: (error) => {
    console.error('微应用加载失败', error);
    // 显示友好的错误提示
    // 可以尝试重新加载或提供降级方案
  },
});
```

### 4. 生命周期管理

确保在组件卸载时正确卸载微应用，避免内存泄漏：

```tsx
const CustomMicroApp: React.FC = () => {
  const { instance, unload } = useMicroApp({
    name: 'app',
    container: '#container',
  });

  useEffect(() => {
    return () => {
      // 组件卸载时卸载微应用
      if (instance) {
        unload();
      }
    };
  }, [instance, unload]);

  // ...
};
```

## 常见问题

### 1. Failed to fetch 错误

**问题**：微应用加载时出现 "Failed to fetch" 错误。

**解决方案**：
- 确保微应用入口地址正确，开发环境使用完整的 URL（包含协议）
- 确保微应用服务器允许跨域请求（设置 CORS）
- 检查网络连接是否正常

### 2. 样式冲突

**问题**：主应用和微应用之间的样式相互影响。

**解决方案**：
- 使用样式隔离选项（strictStyleIsolation 或 experimentalStyleIsolation）
- 在微应用中使用 CSS Modules 或其他 CSS 作用域解决方案
- 为微应用样式添加特定前缀

### 3. 微应用加载缓慢

**问题**：微应用加载时间过长。

**解决方案**：
- 优化微应用打包大小
- 实现智能预加载策略
- 添加加载状态指示器提升用户体验

### 4. 多个微应用同时加载

**问题**：需要在同一页面同时加载多个微应用。

**解决方案**：
- 设置 `singular: false` 允许多个微应用同时存在
- 为每个微应用提供唯一的容器
- 使用 `loadMicroApp` 手动加载多个微应用