# API 文档

## 目录

- [微应用SDK](#微应用sdk)
- [监控SDK](#监控sdk)
- [开发工具](#开发工具)
- [共享组件](#共享组件)
- [工具函数](#工具函数)

## 微应用SDK

### MicroAppManager

微应用管理器，负责微应用的注册、加载、卸载等操作。

#### 方法

##### `registerApps(apps, lifeCycles?)`

注册微应用列表。

**参数:**
- `apps: MicroAppConfig[]` - 微应用配置数组
- `lifeCycles?: LifeCycles` - 生命周期回调函数

**示例:**
```typescript
import { microAppManager } from '@enterprise/micro-app-sdk';

microAppManager.registerApps([
  {
    name: 'react-micro-app',
    entry: '//localhost:3001',
    container: '#react-container',
    activeRule: '/react-app',
  }
], {
  beforeLoad: (app) => console.log('Loading:', app.name),
  afterMount: (app) => console.log('Mounted:', app.name),
});
```

##### `start(options?)`

启动微前端框架。

**参数:**
- `options?: StartOptions` - 启动配置选项

**示例:**
```typescript
microAppManager.start({
  prefetch: true,
  singular: false,
  sandbox: {
    experimentalStyleIsolation: true,
  },
});
```

##### `loadApp(name, container?)`

手动加载指定微应用。

**参数:**
- `name: string` - 微应用名称
- `container?: string` - 容器选择器

**返回值:**
- `Promise<MicroAppInstance | null>` - 微应用实例

##### `unloadApp(name)`

卸载指定微应用。

**参数:**
- `name: string` - 微应用名称

**返回值:**
- `Promise<void>`

### GlobalEventBus

全局事件总线，用于微应用间通信。

#### 方法

##### `emit(event, data?)`

发送事件。

**参数:**
- `event: string` - 事件名称
- `data?: any` - 事件数据

##### `on(event, handler)`

监听事件。

**参数:**
- `event: string` - 事件名称
- `handler: Function` - 事件处理函数

##### `off(event, handler)`

取消监听事件。

**参数:**
- `event: string` - 事件名称
- `handler: Function` - 事件处理函数

##### `once(event, handler)`

一次性监听事件。

**参数:**
- `event: string` - 事件名称
- `handler: Function` - 事件处理函数

**示例:**
```typescript
import { globalEventBus } from '@enterprise/micro-app-sdk';

// 发送事件
globalEventBus.emit('user:login', { userId: '123' });

// 监听事件
globalEventBus.on('user:login', (data) => {
  console.log('User logged in:', data.userId);
});
```

## 监控SDK

### ErrorTracker

错误跟踪器，自动捕获和上报错误。

#### 方法

##### `captureError(error)`

手动捕获错误。

**参数:**
- `error: Error | string | ErrorInfo` - 错误信息

**示例:**
```typescript
import { errorTracker } from '@enterprise/monitoring-sdk';

try {
  // 业务逻辑
} catch (error) {
  errorTracker.captureError(error);
}
```

##### `addBreadcrumb(message, level?)`

添加面包屑记录。

**参数:**
- `message: string` - 面包屑消息
- `level?: string` - 日志级别 ('info' | 'warn' | 'error')

##### `setUser(userId)`

设置用户ID。

**参数:**
- `userId: string` - 用户ID

##### `setMicroApp(microApp)`

设置当前微应用标识。

**参数:**
- `microApp: string` - 微应用名称

### PerformanceMonitor

性能监控器，收集和上报性能指标。

#### 方法

##### `trackMicroAppPerformance(name, phase, startTime)`

跟踪微应用性能。

**参数:**
- `name: string` - 微应用名称
- `phase: 'load' | 'mount' | 'unmount'` - 阶段
- `startTime: number` - 开始时间

##### `markUserTiming(name, detail?)`

添加性能标记。

**参数:**
- `name: string` - 标记名称
- `detail?: any` - 详细信息

##### `measureUserTiming(name, startMark, endMark?)`

测量性能指标。

**参数:**
- `name: string` - 测量名称
- `startMark: string` - 开始标记
- `endMark?: string` - 结束标记

**返回值:**
- `number` - 持续时间（毫秒）

### UserAnalytics

用户行为分析器。

#### 方法

##### `trackPageView(path?, title?)`

跟踪页面访问。

**参数:**
- `path?: string` - 页面路径
- `title?: string` - 页面标题

##### `trackEvent(event)`

跟踪用户事件。

**参数:**
- `event: Partial<UserEvent>` - 事件信息

**示例:**
```typescript
import { userAnalytics } from '@enterprise/monitoring-sdk';

userAnalytics.trackEvent({
  category: 'button',
  action: 'click',
  label: 'submit-form',
  value: 1,
});
```

##### `setUserId(userId)`

设置用户ID。

**参数:**
- `userId: string` - 用户ID

##### `setMicroApp(microApp)`

设置当前微应用。

**参数:**
- `microApp: string` - 微应用名称

## 开发工具

### MicroAppDevTools

微应用开发工具面板。

#### 方法

##### `show()`

显示开发工具面板。

##### `hide()`

隐藏开发工具面板。

##### `toggle()`

切换开发工具面板显示状态。

##### `registerApp(info)`

注册微应用信息。

**参数:**
- `info: MicroAppInfo` - 微应用信息

##### `updateAppStatus(name, status, extra?)`

更新微应用状态。

**参数:**
- `name: string` - 微应用名称
- `status: 'loading' | 'mounted' | 'unmounted' | 'error'` - 状态
- `extra?: Partial<MicroAppInfo>` - 额外信息

### MockManager

API Mock管理器。

#### 方法

##### `addRule(rule)`

添加Mock规则。

**参数:**
- `rule: Omit<MockRule, 'id'> & { id?: string }` - Mock规则

**返回值:**
- `string` - 规则ID

**示例:**
```typescript
import { mockManager } from '@enterprise/dev-tools';

mockManager.addRule({
  method: 'GET',
  url: '/api/users',
  response: { users: [] },
  delay: 1000,
});
```

##### `removeRule(id)`

删除Mock规则。

**参数:**
- `id: string` - 规则ID

**返回值:**
- `boolean` - 是否删除成功

##### `enableRule(id)` / `disableRule(id)`

启用/禁用Mock规则。

**参数:**
- `id: string` - 规则ID

**返回值:**
- `boolean` - 是否操作成功

##### `getRules()`

获取所有Mock规则。

**返回值:**
- `MockRule[]` - Mock规则数组

### HotReloadManager

热重载管理器。

#### 方法

##### `configure(config)`

配置热重载。

**参数:**
- `config: Partial<HotReloadConfig>` - 配置选项

##### `registerMicroAppHandler(name, handler)`

注册微应用热重载处理器。

**参数:**
- `name: string` - 微应用名称
- `handler: () => void` - 处理函数

##### `getStatus()`

获取热重载状态。

**返回值:**
- `{ connected: boolean, reconnectAttempts: number, config: HotReloadConfig }`

## 共享组件

### ErrorBoundary

错误边界组件。

#### Props

- `children: ReactNode` - 子组件
- `fallback?: ReactNode` - 自定义错误界面
- `onError?: (error: Error, errorInfo: ErrorInfo) => void` - 错误回调

**示例:**
```tsx
import { ErrorBoundary } from '@enterprise/shared-components';

<ErrorBoundary onError={(error) => console.error(error)}>
  <App />
</ErrorBoundary>
```

### Loading

加载状态组件。

#### Props

- `text?: string` - 加载文本
- `size?: 'small' | 'default' | 'large'` - 大小
- `spinning?: boolean` - 是否显示加载状态
- `fullscreen?: boolean` - 是否全屏显示

**示例:**
```tsx
import { Loading } from '@enterprise/shared-components';

<Loading text="加载中..." size="large" />
```

### MicroAppWrapper

微应用容器组件。

#### Props

- `name: string` - 微应用名称
- `containerId: string` - 容器ID
- `loading?: boolean` - 加载状态
- `error?: string` - 错误信息
- `onRetry?: () => void` - 重试回调
- `onLoad?: () => void` - 加载完成回调
- `onUnload?: () => void` - 卸载回调

**示例:**
```tsx
import { MicroAppWrapper } from '@enterprise/shared-components';

<MicroAppWrapper
  name="react-micro-app"
  containerId="react-container"
  loading={loading}
  error={error}
  onRetry={handleRetry}
/>
```

## 工具函数

### HTTP客户端

#### `createHttpClient(config?)`

创建HTTP客户端实例。

**参数:**
- `config?: HttpClientConfig` - 配置选项

**返回值:**
- `HttpClient` - HTTP客户端实例

**示例:**
```typescript
import { createHttpClient } from '@enterprise/shared-utils';

const httpClient = createHttpClient({
  baseURL: '/api',
  timeout: 5000,
});

const data = await httpClient.get('/users');
```

### 存储工具

#### `storage.set(key, value, options?)`

设置存储值。

**参数:**
- `key: string` - 键名
- `value: any` - 值
- `options?: StorageOptions` - 存储选项

#### `storage.get(key, defaultValue?)`

获取存储值。

**参数:**
- `key: string` - 键名
- `defaultValue?: any` - 默认值

**返回值:**
- `any` - 存储的值

#### `storage.remove(key)`

删除存储值。

**参数:**
- `key: string` - 键名

**示例:**
```typescript
import { storage } from '@enterprise/shared-utils';

// 设置值
storage.set('user', { id: 1, name: 'John' });

// 获取值
const user = storage.get('user');

// 删除值
storage.remove('user');
```

### 工具函数

#### `formatDate(date, format?)`

格式化日期。

**参数:**
- `date: Date | string | number` - 日期
- `format?: string` - 格式字符串

**返回值:**
- `string` - 格式化后的日期字符串

#### `debounce(func, wait, immediate?)`

防抖函数。

**参数:**
- `func: Function` - 要防抖的函数
- `wait: number` - 等待时间（毫秒）
- `immediate?: boolean` - 是否立即执行

**返回值:**
- `Function` - 防抖后的函数

#### `throttle(func, wait)`

节流函数。

**参数:**
- `func: Function` - 要节流的函数
- `wait: number` - 等待时间（毫秒）

**返回值:**
- `Function` - 节流后的函数

**示例:**
```typescript
import { formatDate, debounce, throttle } from '@enterprise/shared-utils';

// 格式化日期
const formatted = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss');

// 防抖
const debouncedSearch = debounce((query) => {
  // 搜索逻辑
}, 300);

// 节流
const throttledScroll = throttle(() => {
  // 滚动处理逻辑
}, 100);
```
