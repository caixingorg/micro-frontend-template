# 🚀 基于官方标准的 vite-plugin-qiankun 配置

## 📚 参考官方文档

基于 [vite-plugin-qiankun 官方仓库](https://github.com/tengmaoqing/vite-plugin-qiankun) 的标准配置方式。

## ⚙️ 1. vite.config.ts 配置

**文件**: `apps/vue3-micro-app/vite.config.ts`

```typescript
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import qiankun from 'vite-plugin-qiankun'

const packageName = 'vue3-micro-app'

// 参考官方文档: https://github.com/tengmaoqing/vite-plugin-qiankun
// useDevMode 开启时与热更新插件冲突,使用变量切换
const useDevMode = true

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      vue(),
      // 官方推荐: useDevMode开启时与热更新插件冲突，需要条件性加载
      ...(useDevMode ? [] : [vueDevTools()]),
      // 这里的 'vue3-micro-app' 是子应用名，主应用注册时AppName需保持一致
      qiankun(packageName, {
        useDevMode
      }),
    ],
    // 官方推荐: 生产环境需要指定运行域名作为base
    base: mode === 'production' ? 'http://localhost:3002/' : '/',
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
    define: {
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    }
  }
})
```

### 🔑 关键配置说明

1. **useDevMode 变量**: 官方明确指出开发环境作为子应用时与热更新插件有冲突
2. **条件性插件加载**: `useDevMode = true` 时不使用热更新插件
3. **base 配置**: 生产环境需要指定运行域名作为base
4. **应用名一致性**: vite.config.ts 中的名称必须与主应用注册时保持一致

## 🔧 2. main.ts 配置

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

// 官方推荐: 使用qiankunWindow检查环境
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

  // 容器选择逻辑
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

// 官方标准: 使用renderWithQiankun配置qiankun生命周期
renderWithQiankun({
  mount(props: MicroAppProps) {
    console.log('[Vue3 Micro App] mount', props)
    render(props)
  },
  bootstrap() {
    console.log('[Vue3 Micro App] bootstrap')
  },
  unmount(props: MicroAppProps) {
    console.log('[Vue3 Micro App] unmount', props)
    unmountApp()
  },
  update(props: MicroAppProps) {
    console.log('[Vue3 Micro App] update', props)
  },
})

// 官方标准: 非qiankun环境下独立运行
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({})
}
```

### 🔑 关键配置说明

1. **renderWithQiankun**: 官方提供的生命周期配置方法
2. **qiankunWindow**: 官方推荐的环境检测方式
3. **生命周期函数**: bootstrap、mount、unmount、update 四个标准生命周期
4. **独立运行**: 使用 `qiankunWindow.__POWERED_BY_QIANKUN__` 检测

## 🎯 3. 官方特性说明

### 保留 Vite ES 特性
- ✅ 保留vite构建es模块的优势
- ✅ 一键配置，不影响已有的vite配置
- ✅ 支持vite开发环境

### 开发环境注意事项
根据官方文档：
> 因为开发环境作为子应用时与热更新插件（可能与其他修改html的插件也会存在冲突）有冲突，所以需要额外的调试配置

**解决方案**:
```typescript
// useDevMode 开启时与热更新插件冲突,使用变量切换
const useDevMode = true

const baseConfig: UserConfig = {
  plugins: [
    ...(
      useDevMode ? [] : [
        vueDevTools() // 热更新插件
      ]
    ),
    qiankun('vue3-micro-app', {
      useDevMode
    })
  ],
}
```

- `useDevMode = true`: 不使用热更新插件，但可以作为子应用加载
- `useDevMode = false`: 能使用热更新，但无法作为子应用加载

### qiankunWindow 使用
官方说明：
> 因为es模块加载与qiankun的实现方式有些冲突，所以使用本插件实现的qiankun微应用里面没有运行在js沙盒中

**推荐用法**:
```typescript
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

// 设置全局属性
qiankunWindow.customxxx = 'ssss'

// 检测qiankun环境
if (qiankunWindow.__POWERED_BY_QIANKUN__) {
  console.log('我正在作为子应用运行')
}
```

## 🚀 4. 测试验证

### 启动Vue3应用
```bash
cd apps/vue3-micro-app
pnpm dev
```

### 预期效果
```
✅ VITE v6.3.5 ready in 497 ms
✅ ✨ new dependencies optimized: vite-plugin-qiankun/dist/helper
✅ ✨ optimized dependencies changed. reloading
✅ [Vue3 Micro App] bootstrap
✅ [Vue3 Micro App] mount
```

### 访问测试
- **独立访问**: http://localhost:3002
- **微前端访问**: http://localhost:3000/vue3-app

## ✅ 总结

这个配置完全遵循 vite-plugin-qiankun 官方标准：

1. **官方推荐的插件配置**: 正确处理热更新冲突
2. **官方标准的生命周期**: 使用 renderWithQiankun 方法
3. **官方推荐的环境检测**: 使用 qiankunWindow
4. **官方要求的base配置**: 生产环境指定域名
5. **官方说明的注意事项**: 正确处理沙盒和全局变量

这确保了Vue3+Vite微应用能够完美集成到qiankun微前端架构中，同时保留了Vite的所有优势。
