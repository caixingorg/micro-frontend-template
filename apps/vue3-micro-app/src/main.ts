import './assets/main.css'
import './styles/style-isolation.css'
import './styles/antd-override.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

import App from './App.vue'
import { routes } from './router'

import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

let instance: any = null

function render(props: any = {}) {
  const { container, routerBase, globalState } = props

  // 注入全局状态 (如果有)
  if (globalState) {
    // 这里可以将其挂载到 Pinia 或 Vue 原型
    console.log('[Vue3 Micro App] GlobalState connected', globalState)
  }

  const router = createRouter({
    history: createWebHistory(qiankunWindow.__POWERED_BY_QIANKUN__ ? routerBase : '/'),
    routes,
  })

  const pinia = createPinia()

  instance = createApp(App)
  instance.use(pinia)
  instance.use(router)
  instance.use(Antd)

  // 关键：确保挂载点在沙箱内部
  // container 是 Qiankun 提供的当前应用容器 DOM
  const mountNode = container
    ? container.querySelector('#app')
    : document.getElementById('app')

  if (mountNode) {
    instance.mount(mountNode)
    console.log('[Vue3 Micro App] Mounted to:', mountNode)
  } else {
    // 如果找不到 #app，可能是因为 index.html 模板未正确加载，或者被样式隔离隐藏
    // 尝试直接挂载到 container (不推荐，但作为降级)
    if (container) {
      console.warn('[Vue3 Micro App] Target #app not found in container, falling back to container itself')
      instance.mount(container)
    } else {
      console.error('[Vue3 Micro App] Mount target not found')
    }
  }
}

// 使用 vite-plugin-qiankun 的 helper 函数来管理生命周期
// 这样更兼容 Vite 的 ESM 加载机制
renderWithQiankun({
  bootstrap() {
    console.log('[Vue3 Micro App] Bootstrap')
  },
  mount(props) {
    console.log('[Vue3 Micro App] Mount', props)
    render(props)
  },
  unmount(props) {
    console.log('[Vue3 Micro App] Unmount', props)
    if (instance) {
      instance.unmount()
      instance = null
    }
  },
  update(props) {
    console.log('[Vue3 Micro App] Update', props)
  }
})

// 独立运行时
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({})
}
