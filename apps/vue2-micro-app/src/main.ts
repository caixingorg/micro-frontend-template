import Vue from 'vue';
import App from './App.vue';
import { createRouter } from './router';

// Ant Design Vue
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';

// 全局配置
Vue.config.productionTip = false;
Vue.use(Antd);

// 类型定义
interface MicroAppProps {
  container?: Element;
  routerBase?: string;
}

declare global {
  interface Window {
    __POWERED_BY_QIANKUN__?: boolean;
  }
}

let instance: Vue | null = null;

function render(props: MicroAppProps = {}) {
  const { container, routerBase } = props;
  const router = createRouter(routerBase);

  instance = new Vue({
    router,
    render: (h) => h(App),
  });

  // qiankun最简单的容器处理逻辑
  const containerElement = container || document.getElementById('app');
  
  if (containerElement) {
    instance.$mount(containerElement);
  } else {
    console.error('[Vue2 Micro App] Container not found');
  }

  console.log('[Vue2 Micro App] Mounted to container:', containerElement);
}

function unmountApp() {
  if (instance) {
    instance.$destroy();
    instance = null;
  }
}

// 独立运行时直接渲染
if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

// 导出qiankun生命周期函数
export async function bootstrap() {
  console.log('[Vue2 Micro App] Bootstrap');
}

export async function mount(props: MicroAppProps) {
  console.log('[Vue2 Micro App] Mount', props);
  render(props);
}

export async function unmount(props: MicroAppProps) {
  console.log('[Vue2 Micro App] Unmount', props);
  unmountApp();
}
