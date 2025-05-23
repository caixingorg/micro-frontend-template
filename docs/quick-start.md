# 快速开始

## 🚀 5分钟快速体验

### 1. 环境准备

确保你的开发环境满足以下要求：

```bash
# 检查Node.js版本 (需要 >= 16.0.0)
node --version

# 检查pnpm版本 (需要 >= 8.0.0)
pnpm --version

# 如果没有安装pnpm
npm install -g pnpm
```

### 2. 克隆项目

```bash
git clone https://github.com/caixingorg/micro-frontend-template.git
cd micro-frontend-template
```

### 3. 安装依赖

```bash
# 安装所有依赖
pnpm install
```

### 4. 启动开发环境

```bash
# 启动所有应用
pnpm dev
```

等待启动完成后，访问以下地址：

- **主应用**: http://localhost:3000
- **React微应用**: http://localhost:3001  
- **Vue3微应用**: http://localhost:3002

### 5. 体验功能

#### 🎛️ 开发者工具

按 `Ctrl/Cmd + Shift + D` 打开开发者工具面板，可以：
- 查看微应用状态
- 监控性能指标
- 查看网络请求
- 查看控制台日志

#### 🎭 API Mock

按 `Ctrl/Cmd + Shift + M` 切换API Mock功能：
- 自动拦截API请求
- 返回模拟数据
- 支持延迟和错误模拟

#### ⚡ 热重载

修改微应用代码，保存后自动重载，无需手动刷新。

#### 📊 监控面板

在浏览器开发者工具的Console中查看：
- 错误自动捕获
- 性能指标收集
- 用户行为跟踪

## 📚 核心概念

### 微前端架构

```
┌─────────────────────────────────────────┐
│              主应用 (Main App)            │
│  ┌─────────────┐  ┌─────────────────────┐ │
│  │   导航菜单   │  │     内容区域        │ │
│  │             │  │                     │ │
│  │ - 首页      │  │  ┌───────────────┐  │ │
│  │ - React应用 │  │  │   微应用容器   │  │ │
│  │ - Vue3应用  │  │  │               │  │ │
│  │ - 系统管理  │  │  │  React/Vue3   │  │ │
│  └─────────────┘  │  │   微应用      │  │ │
│                   │  └───────────────┘  │ │
└─────────────────────────────────────────┘
```

### 应用通信

```typescript
// 全局事件通信
import { globalEventBus } from '@enterprise/micro-app-sdk';

// 发送事件
globalEventBus.emit('user:login', { userId: '123' });

// 监听事件
globalEventBus.on('user:login', (data) => {
  console.log('用户登录:', data);
});
```

### 共享状态

```typescript
// 设置全局状态
microAppManager.setGlobalState({
  user: userInfo,
  theme: 'dark'
});

// 监听状态变化
microAppManager.onGlobalStateChange((state, prev) => {
  console.log('状态变化:', state, prev);
});
```

## 🛠️ 开发工作流

### 1. 创建新页面

在主应用中创建新页面：

```bash
# 创建页面组件
mkdir apps/main-app/src/pages/NewPage
touch apps/main-app/src/pages/NewPage/index.tsx
```

```tsx
// apps/main-app/src/pages/NewPage/index.tsx
import React from 'react';
import { Card } from 'antd';

const NewPage: React.FC = () => {
  return (
    <Card title="新页面">
      <p>这是一个新页面</p>
    </Card>
  );
};

export default NewPage;
```

添加路由：

```tsx
// apps/main-app/src/routes/index.tsx
import NewPage from '@/pages/NewPage';

const routes = [
  // ... 其他路由
  {
    path: '/new-page',
    element: <NewPage />,
  },
];
```

### 2. 添加微应用页面

在React微应用中添加页面：

```tsx
// apps/react-micro-app/src/pages/NewFeature/index.tsx
import React from 'react';
import { Button } from 'antd';
import { trackUserEvent } from '@/utils/monitoring';

const NewFeature: React.FC = () => {
  const handleClick = () => {
    trackUserEvent('button', 'click', 'new-feature');
  };

  return (
    <div>
      <h2>新功能</h2>
      <Button type="primary" onClick={handleClick}>
        点击我
      </Button>
    </div>
  );
};

export default NewFeature;
```

### 3. 使用共享组件

```tsx
import { Loading, ErrorBoundary } from '@enterprise/shared-components';

function MyComponent() {
  return (
    <ErrorBoundary>
      <Loading text="加载中..." />
    </ErrorBoundary>
  );
}
```

### 4. 添加监控

```tsx
import { 
  trackUserEvent, 
  reportError, 
  addBreadcrumb 
} from '@/utils/monitoring';

function handleUserAction() {
  addBreadcrumb('用户执行操作', 'info');
  
  try {
    // 业务逻辑
    trackUserEvent('action', 'execute', 'user-action');
  } catch (error) {
    reportError(error);
  }
}
```

## 🧪 测试

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定应用的测试
pnpm --filter main-app test

# 运行测试覆盖率
pnpm test:coverage
```

### 编写测试

```tsx
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

## 📦 构建和部署

### 构建应用

```bash
# 构建所有应用
pnpm build

# 构建特定应用
pnpm --filter main-app build
```

### 本地预览

```bash
# 使用http-server预览构建结果
npx http-server apps/main-app/dist -p 8080
```

### Docker部署

```bash
# 构建Docker镜像
docker build -t micro-frontend-template .

# 运行容器
docker run -p 80:80 micro-frontend-template
```

## 🎯 下一步

### 学习更多

- 📖 [开发指南](./development.md) - 详细的开发文档
- 🏗️ [架构设计](./architecture.md) - 了解系统架构
- 📚 [API文档](./api.md) - 查看API参考

### 扩展功能

- 🔍 配置错误监控服务 (如Sentry)
- 📊 集成用户分析服务 (如Google Analytics)
- 🎨 自定义主题和样式
- 🌐 添加国际化支持
- 🔐 集成身份认证系统

### 社区支持

- 🐛 [报告问题](https://github.com/caixingorg/micro-frontend-template/issues)
- 💡 [功能建议](https://github.com/caixingorg/micro-frontend-template/discussions)
- 📖 [贡献指南](../CONTRIBUTING.md)

## ❓ 常见问题

### Q: 如何添加新的微应用？

A: 参考[开发指南](./development.md#微应用开发)中的详细步骤。

### Q: 如何在微应用间共享数据？

A: 使用全局事件总线或全局状态管理，参考[API文档](./api.md#微应用sdk)。

### Q: 如何调试微应用？

A: 使用内置的开发者工具面板，按 `Ctrl/Cmd + Shift + D` 打开。

### Q: 如何配置生产环境？

A: 修改环境变量文件，参考[开发指南](./development.md#环境配置)。

### Q: 如何优化性能？

A: 参考[开发指南](./development.md#性能优化)中的性能优化建议。

---

🎉 **恭喜！** 你已经成功启动了企业级微前端模版。现在可以开始构建你的微前端应用了！
