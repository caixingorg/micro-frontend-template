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
  const { container, routerBase, globalState } = props;

  if (globalState) {
    console.log('[React Micro App] GlobalState connected', globalState);
    // 这里可以 dispatch 到 Redux 或 Context
  }

  // 关键：在 Qiankun 提供的 container 中寻找挂载点
  // 确保在 ShadowDOM 或 Scope Isolation 下正确挂载
  const ROOT_ID = 'react-micro-app-root';
  const containerElement = container
    ? container.querySelector(`#${ROOT_ID}`)
    : document.getElementById(ROOT_ID);

  if (!containerElement) {
    // 降级策略
    if (container) {
      console.warn(`[React Micro App] Target #${ROOT_ID} not found, mounting to container directly`);
      const newRoot = document.createElement('div');
      newRoot.id = ROOT_ID;
      container.appendChild(newRoot);

      root = createRoot(newRoot);
      root.render(
        <ConfigProvider locale={zhCN}>
          <App routerBase={routerBase} />
        </ConfigProvider>
      );
      return;
    }

    console.error('[React Micro App] Container not found');
    return;
  }

  console.log('[React Micro App] Rendering to container:', containerElement);

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

// 独立运行时直接渲染
if (!window.__POWERED_BY_QIANKUN__) {
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
