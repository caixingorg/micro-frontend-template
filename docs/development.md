# 企业级微前端开发指南

## 📋 目录

- [环境准备](#环境准备)
- [项目初始化](#项目初始化)
- [项目架构](#项目架构)
- [开发流程](#开发流程)
- [微应用开发](#微应用开发)
- [共享包开发](#共享包开发)
- [状态管理](#状态管理)
- [样式管理](#样式管理)
- [监控和分析](#监控和分析)
- [开发工具](#开发工具)
- [测试](#测试)
- [构建和部署](#构建和部署)
- [性能优化](#性能优化)
- [故障排除](#故障排除)

## 环境准备

### 系统要求

- **Node.js**: >= 16.0.0 (推荐 18.x LTS)
- **pnpm**: >= 8.0.0 (包管理器)
- **Git**: >= 2.0.0 (版本控制)

### 开发工具推荐

- **IDE**: VSCode (推荐)
- **浏览器**: Chrome (推荐使用开发者工具)
- **Git 客户端**: 命令行或 SourceTree
- **API 测试**: Postman 或 Insomnia

### VSCode 插件推荐

创建 `.vscode/extensions.json` 文件：

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "vue.volar",
    "ms-vscode.vscode-json",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-jest",
    "ms-vscode.vscode-docker"
  ]
}
```

### VSCode 设置

创建 `.vscode/settings.json` 文件：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "files.associations": {
    "*.css": "css",
    "*.less": "less"
  }
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

### 3. 环境配置

复制环境配置文件：

```bash
# 复制环境配置模板
cp .env.example .env.local

# 编辑环境配置
vim .env.local
```

主要配置项：

```bash
# 应用环境
NODE_ENV=development

# API 配置
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_MOCK_ENABLED=true

# 微应用入口地址
REACT_APP_REACT_MICRO_APP_ENTRY=//localhost:3001
REACT_APP_VUE3_MICRO_APP_ENTRY=//localhost:3002

# 监控配置
REACT_APP_SENTRY_DSN=your-sentry-dsn
REACT_APP_ANALYTICS_ID=your-analytics-id

# 功能开关
REACT_APP_ENABLE_MOCK=true
REACT_APP_ENABLE_DEVTOOLS=true
```

### 4. 启动开发环境

```bash
# 启动所有应用
pnpm dev

# 或者分别启动
pnpm --filter main-app dev          # 主应用 (端口: 3000)
pnpm --filter react-micro-app dev   # React微应用 (端口: 3001)
pnpm --filter vue3-micro-app dev    # Vue3微应用 (端口: 3002)
```

### 5. 验证安装

访问以下地址验证安装：

- **主应用**: http://localhost:3000
- **React微应用**: http://localhost:3001
- **Vue3微应用**: http://localhost:3002
- **Storybook**: `cd packages/shared-components && pnpm storybook`

## 项目架构

### 整体架构

```
micro-frontend-template/
├── 📁 apps/                          # 应用目录
│   ├── 📁 main-app/                  # 主应用 (React + TypeScript)
│   │   ├── 📁 src/
│   │   │   ├── 📁 components/        # 组件
│   │   │   ├── 📁 pages/            # 页面
│   │   │   ├── 📁 store/            # Redux状态管理
│   │   │   ├── 📁 utils/            # 工具函数
│   │   │   └── 📁 config/           # 配置文件
│   │   ├── 📄 webpack.config.js     # Webpack配置
│   │   └── 📄 package.json
│   ├── 📁 react-micro-app/          # React微应用
│   │   ├── 📁 src/
│   │   │   ├── 📁 components/
│   │   │   ├── 📁 pages/
│   │   │   └── 📁 utils/
│   │   ├── 📄 webpack.config.js
│   │   └── 📄 package.json
│   └── 📁 vue3-micro-app/           # Vue3微应用
│       ├── 📁 src/
│       │   ├── 📁 components/
│       │   ├── 📁 pages/
│       │   ├── 📁 store/            # Pinia状态管理
│       │   └── 📁 utils/
│       ├── 📄 vite.config.ts        # Vite配置
│       └── 📄 package.json
├── 📁 packages/                     # 共享包目录
│   ├── 📁 shared-types/             # 类型定义
│   ├── 📁 shared-utils/             # 工具函数
│   ├── 📁 micro-app-sdk/            # 微应用SDK
│   ├── 📁 shared-components/        # 共享组件库
│   ├── 📁 monitoring-sdk/           # 监控SDK
│   └── 📁 dev-tools/                # 开发工具
├── 📁 tools/                        # 工具目录
│   ├── 📁 webpack-config/           # Webpack配置包
│   └── 📁 eslint-config/            # ESLint配置包
├── 📁 docs/                         # 文档目录
├── 📁 scripts/                      # 构建脚本
├── 📁 docker/                       # Docker配置
├── 📄 pnpm-workspace.yaml          # pnpm工作空间配置
├── 📄 package.json                  # 根package.json
├── 📄 tsconfig.json                 # TypeScript配置
└── 📄 docker-compose.yml           # Docker Compose配置
```

### 技术栈

#### 主应用 (main-app)
- **框架**: React 18 + TypeScript
- **状态管理**: Redux Toolkit + RTK Query
- **路由**: React Router v6
- **UI组件**: Ant Design
- **构建工具**: Webpack 5
- **样式**: CSS Modules + Less

#### React微应用 (react-micro-app)
- **框架**: React 18 + TypeScript
- **UI组件**: Ant Design
- **路由**: React Router v6
- **构建工具**: Webpack 5
- **qiankun集成**: 完整生命周期支持

#### Vue3微应用 (vue3-micro-app)
- **框架**: Vue 3 + TypeScript
- **状态管理**: Pinia
- **路由**: Vue Router v4
- **UI组件**: Ant Design Vue
- **构建工具**: Vite
- **qiankun集成**: 完整生命周期支持

#### 共享包生态
- **@enterprise/shared-types**: 统一类型定义
- **@enterprise/shared-utils**: 通用工具函数
- **@enterprise/micro-app-sdk**: 微应用管理SDK
- **@enterprise/shared-components**: 共享UI组件
- **@enterprise/monitoring-sdk**: 监控分析SDK
- **@enterprise/dev-tools**: 开发工具包

### 核心特性

#### 🏗️ 微前端架构
- 基于qiankun框架
- 应用隔离和沙箱机制
- 独立开发和部署
- 技术栈无关

#### 📦 Monorepo管理
- pnpm workspace
- 统一依赖管理
- 共享包复用
- 增量构建

#### 🔍 监控分析
- 错误监控和上报
- 性能指标收集
- 用户行为分析
- 实时监控面板

#### 🛠️ 开发体验
- 热重载支持
- API Mock系统
- 可视化开发工具
- Storybook组件文档

#### 🚀 生产就绪
- Docker容器化
- CI/CD流程
- 多环境部署
- 性能优化

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

## 微应用开发

### 创建新的微应用

#### 1. 使用脚手架创建

```bash
# 使用内置脚手架创建微应用
pnpm create-micro-app new-micro-app --framework react
# 或
pnpm create-micro-app new-micro-app --framework vue3
```

#### 2. 手动创建应用目录

```bash
mkdir apps/new-micro-app
cd apps/new-micro-app
```

#### 3. 初始化 package.json

**React微应用**:

```json
{
  "name": "new-micro-app",
  "version": "1.0.0",
  "description": "New React micro-frontend application",
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
    "@enterprise/shared-utils": "workspace:*",
    "@enterprise/shared-components": "workspace:*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "antd": "^5.12.8"
  },
  "devDependencies": {
    "@enterprise/webpack-config": "workspace:*",
    "@enterprise/eslint-config": "workspace:*",
    "@types/react": "^18.2.42",
    "@types/react-dom": "^18.2.17",
    "typescript": "^5.3.2"
  }
}
```

**Vue3微应用**:

```json
{
  "name": "new-vue3-micro-app",
  "version": "1.0.0",
  "description": "New Vue3 micro-frontend application",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "type-check": "vue-tsc --noEmit",
    "lint": "eslint src --ext .ts,.vue",
    "test": "vitest"
  },
  "dependencies": {
    "@enterprise/micro-app-sdk": "workspace:*",
    "@enterprise/shared-types": "workspace:*",
    "@enterprise/shared-utils": "workspace:*",
    "vue": "^3.3.8",
    "vue-router": "^4.2.5",
    "pinia": "^2.1.7",
    "ant-design-vue": "^4.0.7"
  },
  "devDependencies": {
    "@enterprise/eslint-config": "workspace:*",
    "@vitejs/plugin-vue": "^4.5.0",
    "vite": "^5.0.5",
    "vue-tsc": "^1.8.22",
    "typescript": "^5.3.2"
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

## 构建和部署

### 构建命令

```bash
# 构建所有应用和包
pnpm build

# 清理后构建
pnpm build:clean

# 构建特定应用
pnpm --filter main-app build
pnpm --filter react-micro-app build
pnpm --filter vue3-micro-app build

# 构建共享包
pnpm build:packages
```

### 构建配置

#### Webpack配置 (React应用)

```javascript
// webpack.config.js
const { createMicroAppConfig } = require('@enterprise/webpack-config');

module.exports = createMicroAppConfig({
  packageName: 'new-micro-app',
  port: 3003,
  isDevelopment: process.env.NODE_ENV === 'development',
  alias: {
    '@': path.resolve(__dirname, 'src'),
  },
});
```

#### Vite配置 (Vue3应用)

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';

export default defineConfig({
  plugins: [
    vue(),
    qiankun('new-vue3-micro-app', {
      useDevMode: true,
    }),
  ],
  server: {
    port: 3003,
    cors: true,
    origin: 'http://localhost:3003',
  },
  build: {
    target: 'esnext',
    lib: {
      name: 'new-vue3-micro-app',
      formats: ['umd'],
    },
    rollupOptions: {
      external: ['vue', 'vue-router'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
        },
      },
    },
  },
});
```

### 部署方案

#### 1. Docker部署

```bash
# 构建Docker镜像
docker build -t micro-frontend-template .

# 运行容器
docker run -p 80:80 micro-frontend-template

# 使用Docker Compose
docker-compose up -d
```

#### 2. 多环境部署

```bash
# 部署到测试环境
pnpm deploy:staging

# 部署到生产环境
pnpm deploy:production

# 使用Docker部署
pnpm deploy --docker
```

#### 3. CI/CD流程

GitHub Actions自动化流程：

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Run tests
        run: pnpm test
      - name: Build
        run: pnpm build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: pnpm deploy:production
```

### 环境配置

#### 开发环境

```bash
# .env.development
NODE_ENV=development
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_REACT_MICRO_APP_ENTRY=//localhost:3001
REACT_APP_VUE3_MICRO_APP_ENTRY=//localhost:3002
REACT_APP_ENABLE_MOCK=true
REACT_APP_ENABLE_DEVTOOLS=true
```

#### 生产环境

```bash
# .env.production
NODE_ENV=production
REACT_APP_API_BASE_URL=https://api.example.com
REACT_APP_REACT_MICRO_APP_ENTRY=/react-micro-app
REACT_APP_VUE3_MICRO_APP_ENTRY=/vue3-micro-app
REACT_APP_ENABLE_MOCK=false
REACT_APP_ENABLE_DEVTOOLS=false
REACT_APP_SENTRY_DSN=your-production-sentry-dsn
```

## Storybook组件文档

### 启动Storybook

```bash
# 启动Storybook开发服务器
cd packages/shared-components
pnpm storybook

# 构建静态Storybook
pnpm build-storybook

# 预览构建结果
npx http-server storybook-static
```

### 编写组件故事

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Button',
  },
};
```

### Storybook配置

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-viewport',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
};

export default config;
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

### 5. 开发工具不显示

**问题**: 开发者工具面板不显示

**解决方案**:
```typescript
// 检查开发工具状态
console.log(window.__MICRO_APP_DEVTOOLS__);

// 手动显示开发工具
window.__MICRO_APP_DEVTOOLS__.show();

// 检查环境变量
console.log(process.env.NODE_ENV);
```

### 6. Mock数据不生效

**问题**: API Mock规则不生效

**解决方案**:
```typescript
// 检查Mock管理器状态
console.log(window.__MOCK_MANAGER__.getConfig());

// 查看Mock规则
console.log(window.__MOCK_MANAGER__.getRules());

// 手动启用Mock
window.__MOCK_MANAGER__.enable();
```

### 7. 热重载不工作

**问题**: 微应用热重载不工作

**解决方案**:
```typescript
// 检查热重载状态
import { hotReloadManager } from '@enterprise/dev-tools';
console.log(hotReloadManager.getStatus());

// 手动触发重载
hotReloadManager.triggerReload();
```

### 8. 监控数据不上报

**问题**: 错误或性能数据不上报

**解决方案**:
```typescript
// 检查监控配置
import { monitoringManager } from '@enterprise/monitoring-sdk';

// 手动上报错误
monitoringManager.errorTracker.captureError(new Error('Test error'));

// 检查网络请求
// 在Network面板中查看是否有上报请求
```

## 性能优化

### 1. 微应用预加载

```typescript
// 主应用中配置预加载
import { microAppManager } from '@enterprise/micro-app-sdk';

microAppManager.start({
  prefetch: true,  // 开启预加载
  prefetchApps: ['react-micro-app', 'vue3-micro-app'],
  singular: false, // 允许多个应用同时存在
});
```

### 2. 代码分割优化

```typescript
// React应用中的路由级代码分割
import { lazy, Suspense } from 'react';
import { Loading } from '@enterprise/shared-components';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Users = lazy(() => import('./pages/Users'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
      </Routes>
    </Suspense>
  );
}
```

### 3. 资源缓存策略

```javascript
// webpack.config.js
module.exports = {
  output: {
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js',
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        shared: {
          test: /[\\/]packages[\\/]/,
          name: 'shared',
          chunks: 'all',
        },
      },
    },
  },
};
```

### 4. 性能监控优化

```typescript
// 自定义性能标记
import { markPerformance, measurePerformance } from '@/utils/monitoring';

// 标记关键操作
markPerformance('api-start');
const data = await fetchData();
markPerformance('api-end');

// 测量性能
const duration = measurePerformance('api-call', 'api-start', 'api-end');
console.log(`API调用耗时: ${duration}ms`);
```

### 5. 内存优化

```typescript
// 组件卸载时清理资源
useEffect(() => {
  const subscription = eventBus.subscribe('event', handler);

  return () => {
    subscription.unsubscribe();
  };
}, []);

// 微应用卸载时清理
export async function unmount() {
  // 清理事件监听器
  eventBus.removeAllListeners();

  // 清理定时器
  clearInterval(timer);

  // 清理DOM
  if (root) {
    root.unmount();
  }
}
```

### 6. 网络优化

```typescript
// HTTP/2 Server Push
// 在nginx配置中启用
// http2_push /static/js/vendors.js;
// http2_push /static/css/main.css;

// 资源预加载
<link rel="preload" href="/static/js/vendors.js" as="script">
<link rel="preload" href="/static/css/main.css" as="style">

// DNS预解析
<link rel="dns-prefetch" href="//api.example.com">
```

## 故障排除

### 调试工具

#### 1. 浏览器开发者工具

```typescript
// 在控制台中调试微应用
window.__QIANKUN_DEVELOPMENT__ = true;

// 查看微应用状态
console.log(window.__QIANKUN__.apps);
console.log(window.__QIANKUN__.activeApps);

// 查看全局状态
console.log(window.__QIANKUN__.globalState);
```

#### 2. 微应用开发工具

快捷键：
- `Ctrl/Cmd + Shift + D`: 切换开发者工具
- `Ctrl/Cmd + Shift + R`: 刷新微应用
- `Ctrl/Cmd + Shift + M`: 切换Mock
- `Ctrl/Cmd + Shift + H`: 切换热重载

#### 3. 网络调试

```bash
# 检查微应用入口文件
curl -I http://localhost:3001/

# 检查CORS配置
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:3001/
```

### 日志分析

#### 1. 错误日志

```typescript
// 启用详细错误日志
import { errorTracker } from '@enterprise/monitoring-sdk';

errorTracker.configure({
  beforeSend: (error) => {
    console.log('Error details:', error);
    return error;
  },
});
```

#### 2. 性能日志

```typescript
// 启用性能日志
import { performanceMonitor } from '@enterprise/monitoring-sdk';

performanceMonitor.on('report', (metrics) => {
  console.log('Performance metrics:', metrics);
});
```

### 常见错误解决

#### 1. Module Federation错误

```bash
# 错误: Shared module is not available for eager consumption
# 解决: 检查webpack配置中的shared模块配置

# webpack.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
      },
    }),
  ],
};
```

#### 2. 样式冲突

```typescript
// 启用样式隔离
microAppManager.start({
  sandbox: {
    strictStyleIsolation: true,
    experimentalStyleIsolation: true,
  },
});
```

#### 3. 路由冲突

```typescript
// 确保微应用路由配置正确
const router = createBrowserRouter([
  {
    path: '/react-app/*',
    element: <App />,
  },
], {
  basename: window.__POWERED_BY_QIANKUN__ ? '/react-app' : '/',
});
```

## 最佳实践

### 1. 代码组织

- 使用统一的目录结构
- 遵循命名规范
- 合理划分组件粒度
- 保持代码简洁

### 2. 状态管理

- 最小化全局状态
- 使用事件通信替代直接状态共享
- 避免状态污染

### 3. 性能优化

- 合理使用预加载
- 实施代码分割
- 优化资源加载
- 监控性能指标

### 4. 错误处理

- 实施错误边界
- 完善错误上报
- 提供降级方案
- 用户友好的错误提示

### 5. 测试策略

- 单元测试覆盖核心逻辑
- 集成测试验证微应用交互
- E2E测试保证用户体验
- 性能测试确保系统稳定
