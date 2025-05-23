# 架构设计

## 概述

本项目采用基于 qiankun 的微前端架构，实现了多个独立应用的统一管理和协调工作。

## 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        主应用 (Main App)                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   路由管理      │  │   状态管理      │  │   UI框架        │ │
│  │ React Router   │  │ Redux Toolkit   │  │ Ant Design     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                qiankun 微前端框架                           │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
        │ React微应用   │ │ Vue3微应用   │ │ 其他微应用  │
        │              │ │              │ │            │
        │ React 18     │ │ Vue 3        │ │ Angular    │
        │ TypeScript   │ │ TypeScript   │ │ Svelte     │
        │ Ant Design   │ │ Ant Design   │ │ ...        │
        └──────────────┘ └─────────────┘ └────────────┘
```

## 核心组件

### 1. 主应用 (Main App)

**技术栈：**
- React 18 + TypeScript
- Redux Toolkit (状态管理)
- React Router v6 (路由管理)
- Ant Design (UI组件库)
- Webpack 5 (构建工具)

**职责：**
- 微应用注册和生命周期管理
- 全局状态管理和共享
- 统一的导航和布局
- 用户认证和权限控制
- 错误边界和监控

### 2. 微应用

**React 微应用：**
- React 18 + TypeScript
- 独立的路由和状态管理
- 支持独立开发和部署

**Vue3 微应用：**
- Vue 3 + TypeScript
- Pinia (状态管理)
- Vue Router v4 (路由管理)
- Vite (构建工具)

### 3. 共享包 (Packages)

**@enterprise/shared-types**
- 统一的 TypeScript 类型定义
- 微应用间的接口规范

**@enterprise/shared-utils**
- HTTP 客户端封装
- 存储工具 (localStorage, sessionStorage, Cookie)
- 通用工具函数

**@enterprise/micro-app-sdk**
- 微应用管理器
- 应用间通信机制
- qiankun 生命周期封装

**@enterprise/shared-components**
- 通用 UI 组件
- 错误边界组件
- 加载状态组件

## 通信机制

### 1. 全局状态共享

```typescript
// 主应用设置全局状态
microAppManager.setGlobalState({
  user: userInfo,
  theme: 'dark'
});

// 微应用监听状态变化
microAppManager.onGlobalStateChange((state, prev) => {
  console.log('状态变化:', state, prev);
});
```

### 2. 事件通信

```typescript
// 发送事件
globalEventBus.emit('user:login', userInfo);

// 监听事件
globalEventBus.on('user:login', (userInfo) => {
  // 处理用户登录事件
});
```

### 3. Props 传递

```typescript
// 主应用向微应用传递 props
{
  name: 'react-micro-app',
  entry: '//localhost:3001',
  container: '#container',
  activeRule: '/react-app',
  props: {
    data: sharedData,
    methods: sharedMethods
  }
}
```

## 路由设计

### 主应用路由

```
/                    # 首页
├── /react-app/*     # React 微应用
├── /vue3-app/*      # Vue3 微应用
├── /system/*        # 系统管理
└── /profile         # 个人中心
```

### 微应用路由

**React 微应用 (/react-app/*)**
```
/react-app/
├── /                # 首页
├── /dashboard       # 仪表板
└── /users           # 用户管理
```

**Vue3 微应用 (/vue3-app/*)**
```
/vue3-app/
├── /                # 首页
├── /products        # 产品管理
└── /orders          # 订单管理
```

## 构建和部署

### 开发环境

```bash
# 启动所有应用
pnpm dev

# 各应用独立启动
pnpm --filter main-app dev          # 端口: 3000
pnpm --filter react-micro-app dev   # 端口: 3001
pnpm --filter vue3-micro-app dev    # 端口: 3002
```

### 生产环境

```bash
# 构建所有应用
pnpm build

# 部署结构
dist/
├── main-app/           # 主应用
├── react-micro-app/    # React 微应用
└── vue3-micro-app/     # Vue3 微应用
```

## 错误处理

### 1. 错误边界

```typescript
// 主应用和微应用都配置错误边界
<ErrorBoundary
  onError={(error, errorInfo) => {
    // 上报错误到监控系统
    reportError(error, errorInfo);
  }}
>
  <App />
</ErrorBoundary>
```

### 2. 微应用加载失败

```typescript
// 微应用加载失败时的降级处理
const lifeCycles = {
  beforeLoad: (app) => console.log('加载前', app.name),
  beforeMount: (app) => console.log('挂载前', app.name),
  afterMount: (app) => console.log('挂载后', app.name),
  beforeUnmount: (app) => console.log('卸载前', app.name),
  afterUnmount: (app) => console.log('卸载后', app.name),
};
```

## 性能优化

### 1. 代码分割

- 主应用按路由分割
- 微应用独立打包
- 共享依赖提取

### 2. 预加载策略

```typescript
// 预加载微应用
microAppManager.start({
  prefetch: true,        // 开启预加载
  singular: false,       // 允许多个应用同时存在
  sandbox: {
    experimentalStyleIsolation: true  // 样式隔离
  }
});
```

### 3. 缓存策略

- 静态资源长期缓存
- 微应用版本化部署
- CDN 加速

## 安全考虑

### 1. 沙箱隔离

- JavaScript 沙箱
- CSS 样式隔离
- 全局变量隔离

### 2. 权限控制

- 统一的用户认证
- 基于角色的权限管理
- 路由级别的权限控制

### 3. 数据安全

- HTTPS 传输
- Token 认证
- XSS 防护

## 监控和日志

### 1. 错误监控

- 全局错误捕获
- 微应用错误上报
- 性能监控

### 2. 日志系统

- 统一的日志格式
- 分级日志记录
- 日志聚合分析

## 扩展性

### 1. 新增微应用

1. 创建新的微应用项目
2. 实现 qiankun 生命周期
3. 在主应用中注册
4. 配置路由和权限

### 2. 技术栈扩展

- 支持 Angular 微应用
- 支持 Svelte 微应用
- 支持原生 JavaScript 应用

### 3. 功能扩展

- 国际化支持
- 主题切换
- 插件系统
