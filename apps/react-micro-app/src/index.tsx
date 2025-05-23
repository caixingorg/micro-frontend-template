import React from 'react';
import { createRoot } from 'react-dom/client';
import { isQiankunEnvironment, setWebpackPublicPath } from '@enterprise/micro-app-sdk';

import App from './App';
import 'antd/dist/reset.css';

// 设置webpack公共路径
setWebpackPublicPath();

let root: any = null;

function render(props: any = {}) {
  const { container, routerBase } = props;
  const containerElement = container 
    ? container.querySelector('#react-micro-app-root') 
    : document.getElementById('react-micro-app-root');

  if (!containerElement) {
    console.error('React micro app container not found');
    return;
  }

  root = createRoot(containerElement);
  root.render(<App routerBase={routerBase} />);
}

function unmount() {
  if (root) {
    root.unmount();
    root = null;
  }
}

// 独立运行时直接渲染
if (!isQiankunEnvironment()) {
  render();
}

// 导出qiankun生命周期函数
export async function bootstrap() {
  console.log('[React Micro App] Bootstrap');
}

export async function mount(props: any) {
  console.log('[React Micro App] Mount', props);
  render(props);
}

export async function unmount(props: any) {
  console.log('[React Micro App] Unmount', props);
  unmount();
}
