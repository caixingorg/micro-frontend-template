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

  // 容器选择逻辑
  let containerElement: Element | null = null;

  if (container) {
    // 微前端环境：qiankun会传入容器，直接使用
    containerElement = container;
  } else {
    // 独立运行：查找默认容器
    containerElement = document.getElementById('vue2-micro-app-root');
  }

  console.log('[Vue2 Micro App] Mounting to container:', containerElement);

  if (containerElement) {
    // Vue2的$mount需要一个新的DOM元素
    const mountNode = document.createElement('div');
    containerElement.appendChild(mountNode);
    instance.$mount(mountNode);
  } else {
    console.error('[Vue2 Micro App] Container not found');
  }
}

function unmountApp() {
  if (instance) {
    instance.$destroy();
    if (instance.$el && instance.$el.parentNode) {
      instance.$el.parentNode.removeChild(instance.$el);
    }
    instance = null;
  }
}

// 检查是否在qiankun环境中
function isQiankunEnvironment(): boolean {
  return !!window.__POWERED_BY_QIANKUN__;
}

// 独立运行时直接渲染
if (!isQiankunEnvironment()) {
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
