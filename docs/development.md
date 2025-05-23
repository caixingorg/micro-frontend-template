# 开发指南

## 环境准备

### 系统要求

- Node.js >= 16.0.0
- pnpm >= 8.0.0
- Git >= 2.0.0

### 开发工具推荐

- **IDE**: VSCode
- **浏览器**: Chrome (推荐使用开发者工具)
- **Git 客户端**: 命令行或 SourceTree

### VSCode 插件推荐

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "vue.volar",
    "ms-vscode.vscode-json"
  ]
}
```

## 项目初始化

### 1. 克隆项目

```bash
git clone https://github.com/caixingorg/micro-frontend-template.git
cd micro-frontend-template
```

### 2. 安装依赖

```bash
# 安装 pnpm (如果还没有安装)
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 3. 启动开发环境

```bash
# 启动所有应用
pnpm dev

# 或者分别启动
pnpm --filter main-app dev          # 主应用 (端口: 3000)
pnpm --filter react-micro-app dev   # React微应用 (端口: 3001)
pnpm --filter vue3-micro-app dev    # Vue3微应用 (端口: 3002)
```

## 开发流程

### 1. 分支管理

```bash
# 从 main 分支创建功能分支
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# 开发完成后提交
git add .
git commit -m "feat: 添加新功能"
git push origin feature/your-feature-name

# 创建 Pull Request
```

### 2. 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
# 功能
git commit -m "feat: 添加用户管理功能"

# 修复
git commit -m "fix: 修复登录页面样式问题"

# 文档
git commit -m "docs: 更新开发指南"

# 样式
git commit -m "style: 调整按钮样式"

# 重构
git commit -m "refactor: 重构用户服务"

# 测试
git commit -m "test: 添加用户管理测试用例"

# 构建
git commit -m "chore: 更新构建配置"
```

## 添加新的微应用

### 1. 创建应用目录

```bash
mkdir apps/new-micro-app
cd apps/new-micro-app
```

### 2. 初始化 package.json

```json
{
  "name": "new-micro-app",
  "version": "1.0.0",
  "description": "New micro-frontend application",
  "private": true,
  "scripts": {
    "dev": "webpack serve --mode development",
    "build": "webpack --mode production",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx",
    "test": "jest"
  },
  "dependencies": {
    "@enterprise/micro-app-sdk": "workspace:*",
    "@enterprise/shared-types": "workspace:*",
    "@enterprise/shared-utils": "workspace:*"
  }
}
```

### 3. 实现生命周期函数

```typescript
// src/index.tsx
import { isQiankunEnvironment, setWebpackPublicPath } from '@enterprise/micro-app-sdk';
import App from './App';

// 设置webpack公共路径
setWebpackPublicPath();

let root: any = null;

function render(props: any = {}) {
  const { container, routerBase } = props;
  // 渲染逻辑
}

function unmount() {
  // 卸载逻辑
}

// 独立运行时直接渲染
if (!isQiankunEnvironment()) {
  render();
}

// 导出qiankun生命周期函数
export async function bootstrap() {
  console.log('[New Micro App] Bootstrap');
}

export async function mount(props: any) {
  console.log('[New Micro App] Mount', props);
  render(props);
}

export async function unmount(props: any) {
  console.log('[New Micro App] Unmount', props);
  unmount();
}
```

### 4. 配置 Webpack

```javascript
// webpack.config.js
const { createMicroAppConfig } = require('@enterprise/webpack-config');

module.exports = createMicroAppConfig({
  packageName: 'new-micro-app',
  port: 3003,
  isDevelopment: process.env.NODE_ENV === 'development',
});
```

### 5. 在主应用中注册

```typescript
// apps/main-app/src/config/microApps.ts
export const microApps: MicroAppConfig[] = [
  // ... 其他微应用
  {
    name: 'new-micro-app',
    entry: process.env.NODE_ENV === 'development'
      ? '//localhost:3003'
      : '/new-micro-app',
    container: '#new-micro-app-container',
    activeRule: '/new-app',
    props: {
      routerBase: '/new-app',
    },
  },
];
```

## 共享组件开发

### 1. 创建组件

```typescript
// packages/shared-components/src/components/MyComponent/MyComponent.tsx
import React from 'react';

export interface MyComponentProps {
  title: string;
  onClick?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onClick }) => {
  return (
    <div onClick={onClick}>
      <h3>{title}</h3>
    </div>
  );
};

export default MyComponent;
```

### 2. 导出组件

```typescript
// packages/shared-components/src/index.ts
export { MyComponent } from './components/MyComponent/MyComponent';
export type { MyComponentProps } from './components/MyComponent/MyComponent';
```

### 3. 在应用中使用

```typescript
// 在微应用中使用
import { MyComponent } from '@enterprise/shared-components';

function App() {
  return (
    <MyComponent
      title="Hello World"
      onClick={() => console.log('clicked')}
    />
  );
}
```

## 状态管理

### 1. 全局状态

```typescript
// 主应用设置全局状态
import { microAppManager } from '@enterprise/micro-app-sdk';

microAppManager.setGlobalState({
  user: userInfo,
  theme: 'dark',
  language: 'zh-CN'
});

// 微应用监听状态变化
microAppManager.onGlobalStateChange((state, prev) => {
  console.log('状态变化:', state, prev);
  // 更新本地状态
});
```

### 2. 应用间通信

```typescript
// 发送消息
import { globalEventBus } from '@enterprise/micro-app-sdk';

globalEventBus.emit('user:login', userInfo);

// 监听消息
globalEventBus.on('user:login', (userInfo) => {
  console.log('用户登录:', userInfo);
});

// 一次性监听
globalEventBus.once('app:ready', () => {
  console.log('应用就绪');
});
```

## 样式管理

### 1. 样式隔离

qiankun 提供了样式隔离机制：

```typescript
// 启用样式隔离
microAppManager.start({
  sandbox: {
    experimentalStyleIsolation: true
  }
});
```

### 2. 主题管理

```typescript
// 主应用主题切换
const toggleTheme = () => {
  const newTheme = theme === 'light' ? 'dark' : 'light';
  dispatch(setTheme(newTheme));

  // 通知所有微应用
  microAppManager.setGlobalState({ theme: newTheme });
};
```

### 3. CSS 命名规范

使用 BEM 命名规范避免样式冲突：

```css
/* 好的命名 */
.user-card {}
.user-card__header {}
.user-card__title {}
.user-card--active {}

/* 避免的命名 */
.card {}
.header {}
.title {}
```

## 测试

### 1. 单元测试

```typescript
// MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders title correctly', () => {
    render(<MyComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<MyComponent title="Test" onClick={handleClick} />);

    screen.getByText('Test').click();
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### 2. 集成测试

```typescript
// 测试微应用加载
describe('Micro App Integration', () => {
  it('should load react micro app', async () => {
    const instance = await microAppManager.loadApp('react-micro-app');
    expect(instance).toBeDefined();
    expect(instance.getStatus()).toBe('MOUNTED');
  });
});
```

### 3. E2E 测试

```typescript
// cypress/integration/micro-frontend.spec.ts
describe('Micro Frontend', () => {
  it('should navigate between micro apps', () => {
    cy.visit('/');
    cy.contains('React应用').click();
    cy.url().should('include', '/react-app');

    cy.contains('Vue3应用').click();
    cy.url().should('include', '/vue3-app');
  });
});
```

## 调试技巧

### 1. 开发者工具

```typescript
// 在浏览器控制台中调试
window.__QIANKUN_DEVELOPMENT__ = true;

// 查看已注册的微应用
console.log(window.__QIANKUN__.apps);

// 查看当前活跃的微应用
console.log(window.__QIANKUN__.activeApps);
```

### 2. 日志调试

```typescript
// 启用详细日志
microAppManager.start({
  sandbox: {
    strictStyleIsolation: true,
    experimentalStyleIsolation: true,
  },
  // 开发环境启用详细日志
  ...(process.env.NODE_ENV === 'development' && {
    getTemplate: (tpl) => {
      console.log('Template:', tpl);
      return tpl;
    }
  })
});
```

### 3. 网络调试

```bash
# 查看微应用加载情况
# 在 Network 面板中过滤 JS 文件
# 检查微应用的入口文件是否正确加载
```

## 性能优化

### 1. 预加载

```typescript
// 预加载微应用
microAppManager.start({
  prefetch: true,  // 开启预加载
  prefetchApps: ['react-micro-app', 'vue3-micro-app']
});
```

### 2. 代码分割

```typescript
// 路由级别的代码分割
const LazyComponent = React.lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent />
    </Suspense>
  );
}
```

### 3. 缓存策略

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};
```

## 监控和分析

### 错误监控

项目集成了完整的错误监控系统：

```typescript
import { reportError, addBreadcrumb } from '@/utils/monitoring';

// 手动上报错误
try {
  // 业务逻辑
} catch (error) {
  reportError(error, { context: 'user-action' });
}

// 添加面包屑
addBreadcrumb('用户点击按钮', 'info');
```

### 性能监控

自动收集性能指标：

```typescript
import { markPerformance, measurePerformance } from '@/utils/monitoring';

// 性能标记
markPerformance('api-start');
await fetchData();
markPerformance('api-end');

// 性能测量
const duration = measurePerformance('api-duration', 'api-start', 'api-end');
```

### 用户行为分析

跟踪用户行为：

```typescript
import { trackUserEvent, trackPageView } from '@/utils/monitoring';

// 跟踪事件
trackUserEvent('button', 'click', 'submit-form');

// 跟踪页面访问
trackPageView('/dashboard', '仪表板');
```

## 开发工具

### 微应用开发工具

开发环境下自动启用开发者工具面板：

- **快捷键**: `Ctrl/Cmd + Shift + D` 切换开发者工具
- **功能**:
  - 微应用状态监控
  - 性能指标查看
  - 网络请求监控
  - 控制台日志

### 热重载

支持微应用热重载：

```typescript
import { hotReloadManager } from '@enterprise/dev-tools';

// 注册微应用热重载处理器
hotReloadManager.registerMicroAppHandler('my-app', () => {
  // 自定义重载逻辑
  console.log('微应用热重载');
});
```

### Mock数据

开发环境下支持API Mock：

```typescript
import { mockManager } from '@enterprise/dev-tools';

// 添加Mock规则
mockManager.addRule({
  method: 'GET',
  url: '/api/users',
  response: { users: [] },
  delay: 1000,
});

// 快捷键: Ctrl/Cmd + Shift + M 切换Mock
```

## Storybook组件文档

查看和测试共享组件：

```bash
# 启动Storybook
cd packages/shared-components
pnpm storybook

# 构建Storybook
pnpm build-storybook
```

## 常见问题

### 1. 微应用加载失败

**问题**: 微应用无法加载或白屏

**解决方案**:
- 检查微应用的入口地址是否正确
- 确认微应用已正确导出生命周期函数
- 检查 CORS 配置
- 查看浏览器控制台错误信息

### 2. 样式冲突

**问题**: 微应用样式相互影响

**解决方案**:
- 启用样式隔离
- 使用 CSS Modules 或 styled-components
- 采用 BEM 命名规范

### 3. 路由冲突

**问题**: 微应用路由不生效

**解决方案**:
- 确认路由配置正确
- 检查 activeRule 规则
- 使用 history 模式而非 hash 模式

### 4. 状态同步问题

**问题**: 微应用间状态不同步

**解决方案**:
- 使用全局状态管理
- 实现事件通信机制
- 确保状态更新的时机正确
