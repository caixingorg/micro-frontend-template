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

// 全局状态通信
let globalStateActions: any = null;

function render(props: MicroAppProps = {}) {
  const { container, routerBase } = props;
  const router = createRouter(routerBase);

  instance = new Vue({
    router,
    render: (h) => h(App),
  });

  // 关键优化：优先在 container 内部寻找挂载点，支持 ShadowDOM/Scoped CSS
  const ROOT_ID = 'vue2-micro-app-root';
  const containerElement = container
    ? container.querySelector(`#${ROOT_ID}`)
    : document.getElementById(ROOT_ID);

  if (containerElement) {
    instance.$mount(containerElement);
  } else {
    // 降级处理：如果在 container 中找不到挂载点，尝试直接挂载
    if (container) {
      console.warn(`[Vue2 Micro App] Target #${ROOT_ID} not found in container, mounting to container directly`);
      const newAppDiv = document.createElement('div');
      newAppDiv.id = ROOT_ID;
      container.appendChild(newAppDiv);
      instance.$mount(newAppDiv);
    } else {
      console.error(`[Vue2 Micro App] Container #${ROOT_ID} not found`);
    }
  }
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

export async function mount(props: any) {
  console.log('[Vue2 Micro App] Mount', props);

  // 处理全局状态
  if (props.onGlobalStateChange) {
    props.onGlobalStateChange((state: any, prev: any) => {
      console.log('[Vue2 Micro App] Global state changed:', state, prev);
      // 这里可以触发 Vuex action 或 EventBus
    });
    globalStateActions = {
      setGlobalState: props.setGlobalState
    };
    // 注入全局属性 (可选)
    Vue.prototype.$globalState = globalStateActions;
  }

  render(props);
}

export async function unmount(props: MicroAppProps) {
  console.log('[Vue2 Micro App] Unmount', props);
  unmountApp();
}
