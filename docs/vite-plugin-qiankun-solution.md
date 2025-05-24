# 🚀 基于vite-plugin-qiankun的Vue3+Vite微前端解决方案

## 🎯 问题背景

正如您所指出的，**qiankun官方目前还没有直接支持Vite**。直接使用UMD配置只能解决build后的集成，但在开发环境下仍然会有ES模块的问题：

```
Cannot use import statement outside a module
SyntaxError: Cannot use import statement outside a module
```

## 💡 解决方案: vite-plugin-qiankun

经过一系列的尝试，最终选择使用了 **vite-plugin-qiankun** 插件，这是专门为qiankun+Vite集成设计的解决方案。

### 📦 安装vite-plugin-qiankun

```bash
cd apps/vue3-micro-app
pnpm add vite-plugin-qiankun -D
```

### ⚙️ 配置vite.config.ts

**文件**: `apps/vue3-micro-app/vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import qiankun from 'vite-plugin-qiankun'

const packageName = 'vue3-micro-app'

// 使用vite-plugin-qiankun解决Vue3+Vite在qiankun中的ES模块问题
// 参考: https://github.com/tengmaoqing/vite-plugin-qiankun
export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development'

  return {
    plugins: [
      vue(),
      // 使用vite-plugin-qiankun插件，专门为qiankun+Vite集成设计
      qiankun(packageName, {
        useDevMode: isDevelopment
      }),
      // 开发环境可以保留devtools，生产环境禁用
      ...(isDevelopment ? [vueDevTools()] : []),
    ],
    // vite-plugin-qiankun会自动处理开发环境配置
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@shared': fileURLToPath(new URL('../../packages', import.meta.url))
      }
    },
    server: {
      port: 3002,
      cors: {
        origin: '*',
        credentials: false,
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
        'Access-Control-Allow-Credentials': 'false',
      },
    },
    // vite-plugin-qiankun会自动处理build配置和UMD格式
    define: {
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    }
  }
})
```

### 🔧 修改main.ts使用vite-plugin-qiankun

**文件**: `apps/vue3-micro-app/src/main.ts`

```typescript
import './assets/main.css'
import { createApp, type App as VueApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

import App from './App.vue'
import { routes } from './router'

// Ant Design Vue
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

// 类型定义
interface MicroAppProps {
  container?: Element
  routerBase?: string
}

// 检查是否在qiankun环境中 - 使用vite-plugin-qiankun的方法
function isQiankunEnvironment(): boolean {
  return !!qiankunWindow.__POWERED_BY_QIANKUN__
}

let instance: VueApp<Element> | null = null

function render(props: MicroAppProps = {}) {
  const { container, routerBase } = props

  const router = createRouter({
    history: createWebHistory(routerBase || '/'),
    routes,
  })

  const pinia = createPinia()

  instance = createApp(App)
  instance.use(pinia)
  instance.use(router)
  instance.use(Antd)

  // 简化容器选择逻辑
  let containerElement: Element | null = null

  if (container) {
    // 微前端环境：qiankun会传入容器
    containerElement = container
  } else {
    // 独立运行：查找默认容器
    containerElement = document.getElementById('app')
  }

  console.log('[Vue3 Micro App] Container info:', {
    hasContainer: !!container,
    containerElement,
    containerId: containerElement?.id,
    isQiankun: isQiankunEnvironment()
  })

  if (containerElement) {
    console.log('[Vue3 Micro App] Mounting to container', containerElement)
    instance.mount(containerElement)
  } else {
    console.error('[Vue3 Micro App] Container not found')
  }
}

function unmountApp() {
  if (instance) {
    instance.unmount()
    instance = null
  }
}

// 使用vite-plugin-qiankun的renderWithQiankun方法
renderWithQiankun({
  mount(props: MicroAppProps) {
    console.log('[Vue3 Micro App] Mount with vite-plugin-qiankun', props)
    render(props)
  },
  bootstrap() {
    console.log('[Vue3 Micro App] Bootstrap with vite-plugin-qiankun')
  },
  unmount(props: MicroAppProps) {
    console.log('[Vue3 Micro App] Unmount with vite-plugin-qiankun', props)
    unmountApp()
  },
  update(props: MicroAppProps) {
    console.log('[Vue3 Micro App] Update with vite-plugin-qiankun', props)
  },
})

// 独立运行时直接渲染
if (!isQiankunEnvironment()) {
  render()
}
```

## 🎯 vite-plugin-qiankun的优势

### 1. **解决ES模块问题**
- 自动处理开发环境的ES模块导入
- 无需手动配置复杂的UMD格式
- 开发和生产环境统一处理

### 2. **简化配置**
- 不需要复杂的rollup配置
- 自动处理全局变量定义
- 自动处理样式和资源加载

### 3. **完整的生命周期支持**
- 提供renderWithQiankun方法
- 支持bootstrap、mount、unmount、update生命周期
- 自动处理qiankun环境检测

### 4. **开发体验优化**
- 支持热重载
- 保持Vite的快速构建特性
- 完整的TypeScript支持

## 📊 与之前方案的对比

### ❌ 之前的UMD配置方案
```typescript
// 复杂的rollup配置
build: {
  rollupOptions: {
    external: ['vue', 'vue-router', 'pinia'],
    output: {
      format: 'umd',
      name: 'vue3microapp',
      globals: {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        pinia: 'Pinia'
      }
    }
  }
}
```

**问题**:
- 只能解决build后的集成
- 开发环境仍有ES模块问题
- 配置复杂，容易出错

### ✅ vite-plugin-qiankun方案
```typescript
// 简单的插件配置
plugins: [
  vue(),
  qiankun(packageName, {
    useDevMode: isDevelopment
  }),
]
```

**优势**:
- 开发和生产环境都能正常工作
- 配置简单，一行代码解决
- 专门为qiankun+Vite设计

## 🚀 测试验证

### 1. 启动Vue3应用
```bash
cd apps/vue3-micro-app
pnpm dev
```

### 2. 启动主应用
```bash
pnpm dev
```

### 3. 访问Vue3微应用
- 独立访问: http://localhost:3002
- 微前端访问: http://localhost:3000/vue3-app

### 4. 预期效果
```
✅ [Vue3 Micro App] Bootstrap with vite-plugin-qiankun
✅ [Vue3 Micro App] Mount with vite-plugin-qiankun
✅ 开发环境ES模块问题完全解决
✅ 生产环境UMD格式自动处理
✅ 热重载正常工作
✅ 无需复杂配置
```

## 📚 参考资料

- [vite-plugin-qiankun GitHub](https://github.com/tengmaoqing/vite-plugin-qiankun)
- [qiankun官方文档](https://qiankun.umijs.org/)
- [Vite官方文档](https://vitejs.dev/)

## ✅ 总结

使用vite-plugin-qiankun是目前解决Vue3+Vite在qiankun中集成问题的最佳方案：

1. **完全解决ES模块问题**: 开发和生产环境都能正常工作
2. **简化配置**: 无需复杂的UMD配置
3. **保持Vite优势**: 快速构建和热重载
4. **专业支持**: 专门为qiankun+Vite设计
5. **社区认可**: 被广泛使用的成熟解决方案

这个方案彻底解决了"qiankun官方还没有支持vite"的问题，为Vue3+Vite微前端提供了完整的解决方案。
