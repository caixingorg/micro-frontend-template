import React from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import './public-path';
import App from './App';
import 'antd/dist/reset.css';

// 声明qiankun全局变量类型
declare global {
  interface Window {
    __POWERED_BY_QIANKUN__?: boolean;
  }
}

let root: any = null;

function render(props: any = {}) {
  const { container, routerBase } = props;
  
  // 获取容器元素
  let containerElement: Element | null = null;
  
  if (container) {
    // 微前端环境下，qiankun会传入容器
    containerElement = container.querySelector('#react-micro-app-root') || container;
  } else {
    // 独立运行时，使用默认容器
    containerElement = document.getElementById('react-micro-app-root') || document.getElementById('root');
  }

  console.log('[React Micro App] Rendering with container:', containerElement);

  if (!containerElement) {
    console.error('[React Micro App] Container not found');
    return;
  }

  root = createRoot(containerElement);
  root.render(
    <ConfigProvider locale={zhCN}>
      <App routerBase={routerBase} />
    </ConfigProvider>
  );
}

function unmountApp() {
  if (root) {
    root.unmount();
    root = null;
  }
}

// 判断是否在qiankun环境中
const isQiankunEnvironment = () => {
  return window.__POWERED_BY_QIANKUN__ || false;
};

// 独立运行时直接渲染
if (!isQiankunEnvironment()) {
  render();
}

// 导出qiankun生命周期函数
export async function bootstrap() {
  console.log('[React Micro App] Bootstrap');
}

export async function mount(props: any) {
  console.log('[React Micro App] Mount with props:', props);
  render(props);
}

export async function unmount(props: any) {
  console.log('[React Micro App] Unmount');
  unmountApp();
}
