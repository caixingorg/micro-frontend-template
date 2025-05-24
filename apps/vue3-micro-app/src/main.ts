import './assets/main.css'
import './styles/style-isolation.css'
import './styles/antd-override.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { 
  qiankunWindow,
  renderWithQiankun
} from 'vite-plugin-qiankun/dist/helper'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

import App from './App.vue'
import { routes } from './router'

let instance: any = null

function render(props: any = {}) {
  const { container, routerBase } = props
  
  const router = createRouter({
    history: createWebHistory(qiankunWindow.__POWERED_BY_QIANKUN__ ? routerBase : '/'),
    routes,
  })

  const pinia = createPinia()

  instance = createApp(App)
  instance.use(pinia)
  instance.use(router)
  instance.use(Antd)

  const containerElement = container ? container.querySelector('#app') : document.getElementById('app')
  
  if (containerElement) {
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

renderWithQiankun({
  mount(props: any) {
    console.log('[Vue3 Micro App] mount', props)
    render(props)
  },
  bootstrap() {
    console.log('[Vue3 Micro App] bootstrap')
  },
  unmount(props: any) {
    console.log('[Vue3 Micro App] unmount', props)
    unmountApp()
  },
  update(props: any) {
    console.log('[Vue3 Micro App] update', props)
  },
})

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({})
}
