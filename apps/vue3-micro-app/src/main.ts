import { createApp, App as VueApp } from 'vue';
import { isQiankunEnvironment, setWebpackPublicPath } from '@enterprise/micro-app-sdk';

import App from './App.vue';
import { createAppRouter } from './router';
import { pinia } from './store';

// Ant Design Vue
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';

// 设置webpack公共路径
setWebpackPublicPath();

let app: VueApp | null = null;

function render(props: any = {}) {
  const { container, routerBase } = props;
  const router = createAppRouter(routerBase);
  
  app = createApp(App);
  app.use(router);
  app.use(pinia);
  app.use(Antd);

  const containerElement = container 
    ? container.querySelector('#vue3-micro-app-root') 
    : document.getElementById('vue3-micro-app-root');

  if (containerElement) {
    app.mount(containerElement);
  } else {
    console.error('Vue3 micro app container not found');
  }
}

function unmount() {
  if (app) {
    app.unmount();
    app = null;
  }
}

// 独立运行时直接渲染
if (!isQiankunEnvironment()) {
  render();
}

// 导出qiankun生命周期函数
export async function bootstrap() {
  console.log('[Vue3 Micro App] Bootstrap');
}

export async function mount(props: any) {
  console.log('[Vue3 Micro App] Mount', props);
  render(props);
}

export async function unmount(props: any) {
  console.log('[Vue3 Micro App] Unmount', props);
  unmount();
}
