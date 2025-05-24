import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import Antd from 'ant-design-vue';
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { 
  handleMicroAppError, 
  getMountContainer 
} from '@shared/utils/micro-app-helper';
import type { MicroAppProps } from '@shared/types/micro-app';

import App from './App.vue';
import { routes } from './router';
import './public-path';
import 'ant-design-vue/dist/reset.css';

let instance: ReturnType<typeof createApp> | null = null;

// 配置错误处理
const setupErrorHandling = () => {
  // 处理常见的 ResizeObserver 错误
  const originalError = console.error;
  console.error = (...args) => {
    const errorMessage = args[0];
    if (
      typeof errorMessage === 'string' &&
      errorMessage.includes('ResizeObserver loop')
    ) {
      return;
    }
    originalError.apply(console, args);
  };

  // 全局错误处理
  window.addEventListener('error', (event) => {
    handleMicroAppError('vue3-micro-app', event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    handleMicroAppError('vue3-micro-app', event.reason);
  });
};

// 创建Vue应用实例
function createVueApp(props: MicroAppProps = {}) {
  const { routerBase, customData = {} } = props;

  // 创建路由实例
  const router = createRouter({
    history: createWebHistory(routerBase || '/'),
    routes
  });

  // 创建状态管理实例
  const pinia = createPinia();

  // 创建 Vue 应用实例
  const app = createApp(App);

  // 注入从主应用传递的属性
  app.provide('navigateToUrl', props.navigateToUrl);
  app.provide('customData', customData);

  // 注册全局状态管理
  if (props.onGlobalStateChange && props.setGlobalState) {
    app.provide('qiankunGlobalState', {
      onGlobalStateChange: props.onGlobalStateChange,
      setGlobalState: props.setGlobalState
    });
  }

  // 注册插件
  app.use(pinia)
    .use(router)
    .use(Antd);

  return { app, router };
}

// 渲染函数
async function render(props: MicroAppProps = {}) {
  const { app } = createVueApp(props);

  // 获取挂载容器
  const container = props.container 
    ? props.container.querySelector('#vue3-sub-app') || props.container
    : document.querySelector('#vue3-sub-app');

  // 记录容器信息
  console.log('[Vue3 Micro App] Container info:', {
    hasContainer: !!props.container,
    container,
    containerId: container?.id,
    isQiankun: qiankunWindow.__POWERED_BY_QIANKUN__
  });

  if (!container) {
    console.error('[Vue3 Micro App] Container not found');
    return;
  }

  instance = app;
  instance.mount(container);
}

// 卸载函数
function unmount() {
  if (instance) {
    instance.unmount();
    instance = null;
  }
}

// 初始化错误处理
setupErrorHandling();

// qiankun 生命周期
renderWithQiankun({
  mount(props) {
    console.log('[Vue3 Micro App] mount', props);
    render(props);
  },
  bootstrap() {
    console.log('[Vue3 Micro App] bootstrap');
  },
  unmount() {
    console.log('[Vue3 Micro App] unmount');
    unmount();
  },
  update(props) {
    console.log('[Vue3 Micro App] update', props);
  }
});

// 非 qiankun 环境下独立运行
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render();
}
