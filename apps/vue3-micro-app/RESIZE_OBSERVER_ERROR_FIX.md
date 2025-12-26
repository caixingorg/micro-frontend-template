# ResizeObserver 错误根本解决方案

## 问题描述

在加载Vue3子应用时出现以下错误：
```
Uncaught runtime errors:
×
ERROR
ResizeObserver loop completed with undelivered notifications.
    at handleError (webpack-internal:///../../node_modules/.pnpm/webpack-dev-server@4.15.2_webpack-cli@5.1.4_webpack@5.99.9/node_modules/webpack-dev-server/client/overlay.js:251:58)
    at eval (webpack-internal:///../../node_modules/.pnpm/webpack-dev-server@4.15.2_webpack-cli@5.1.4_webpack@5.99.9/node_modules/webpack-dev-server/client/overlay.js:270:7)
```

## 错误原因分析

1. **UI组件库冲突**：Vue3子应用使用了Ant Design Vue，其中某些组件在resize时会触发连锁反应
2. **微前端环境特殊性**：在qiankun环境中，多个应用共享DOM，ResizeObserver实例可能相互影响
3. **容器高度动态变化**：当子应用内容高度变化时，容器会自动调整，触发ResizeObserver循环
4. **ResizeObserver循环**：当ResizeObserver的回调函数修改了DOM，导致新的resize事件，形成无限循环

## 根本解决方案 - 固定容器高度

### 1. 修改主应用容器组件 (MicroAppContainer.tsx)

采用固定高度策略，从根本上避免高度变化引起的ResizeObserver循环：

```typescript
import React from 'react';
import { Spin } from 'antd';
import ErrorBoundary from './ErrorBoundary';
import { useResponsive } from '@/hooks/useResponsive';
import '@/styles/micro-app-container.css';

const MicroAppContainer: React.FC = () => {
  const responsive = useResponsive();

  // 根据屏幕尺寸设置固定高度，避免ResizeObserver循环
  const containerHeight = responsive.isMobile 
    ? 'calc(100vh - 180px)' 
    : 'calc(100vh - 220px)';

  return (
    <ErrorBoundary>
      <div
        id="micro-app-container"
        style={{
          width: '100%',
          height: containerHeight, // 固定高度，避免ResizeObserver循环
          position: 'relative',
          borderRadius: '8px',
          overflow: 'auto', // 内容溢出时显示滚动条
          backgroundColor: '#fff',
          boxSizing: 'border-box',
          transition: 'height 0.2s ease-in-out',
        }}
        className="micro-app-container"
      >
        {/* 加载状态 */}
        <div className="micro-app-loading">
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>正在加载微应用...</div>
        </div>
      </div>
    </ErrorBoundary>
  );
};
```

### 2. 调整主应用布局 (AppLayout.tsx)

配合固定高度容器，调整整体布局：

```typescript
<Content
  style={{
    padding: responsive.isMobile ? 16 : 24,
    margin: 0,
    height: responsive.isMobile ? 'calc(100vh - 140px)' : 'calc(100vh - 180px)', // 固定高度，配合MicroAppContainer
    background: colorBgContainer,
    borderRadius: borderRadius,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  }}
>
```

### 3. CSS样式优化 (micro-app-container.css)

专门的样式文件优化容器显示效果：

```css
.micro-app-container {
  width: 100%;
  position: relative;
  border-radius: 8px;
  background-color: #fff;
  box-sizing: border-box;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
  transition: height 0.2s ease-in-out;
}

/* 滚动条优化 */
.micro-app-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.micro-app-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.micro-app-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.micro-app-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
```

## 技术原理

### ResizeObserver循环错误的产生机制：

1. **观察者模式触发**：ResizeObserver监听到元素大小变化
2. **回调执行**：回调函数执行，可能修改DOM
3. **连锁反应**：DOM修改导致新的resize事件
4. **循环形成**：新的resize事件触发更多回调，形成无限循环
5. **浏览器保护**：浏览器检测到循环，抛出此错误

### 微前端环境的特殊性：

- **多应用共存**：多个应用的ResizeObserver可能相互影响
- **DOM隔离不完全**：某些全局事件仍会传播
- **组件库冲突**：不同应用使用的UI组件库可能有冲突

## 验证方法

1. **启动Vue3微应用**：
   ```bash
   cd apps/vue3-micro-app
   pnpm dev
   ```

2. **在主应用中加载子应用**：
   - 启动主应用
   - 导航到Vue3子应用页面
   - 检查控制台是否还有ResizeObserver错误

3. **功能测试**：
   - 确认子应用正常加载
   - 测试包含resize监听的组件
   - 验证响应式布局功能

## 注意事项

1. **这不是真正的错误**：ResizeObserver循环错误通常不影响应用功能
2. **开发环境特有**：这类错误在生产环境通常不会显示
3. **UI组件库相关**：使用Ant Design、Element Plus等组件库时更容易出现
4. **定期检查**：定期检查是否有新的类似错误需要处理

## 相关资源

- [ResizeObserver MDN文档](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)
- [qiankun官方文档](https://qiankun.umijs.org/)
- [vite-plugin-qiankun使用指南](https://github.com/tengmaoqing/vite-plugin-qiankun)
- [Ant Design Vue文档](https://antdv.com/)
