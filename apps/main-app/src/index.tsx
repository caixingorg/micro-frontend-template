import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import { store } from '@/store';
import App from './App';
import './styles/global.css';

// 全局样式
import 'antd/dist/reset.css';

// 处理ResizeObserver错误 - 微前端环境中的常见问题
const handleResizeObserverError = () => {
  const originalError = console.error;
  console.error = (...args) => {
    const errorMessage = args[0];
    if (
      typeof errorMessage === 'string' &&
      errorMessage.includes('ResizeObserver loop completed with undelivered notifications')
    ) {
      // 忽略这个特定的ResizeObserver错误
      return;
    }
    originalError.apply(console, args);
  };

  // 处理未捕获的错误
  window.addEventListener('error', (event) => {
    if (
      event.message &&
      event.message.includes('ResizeObserver loop completed with undelivered notifications')
    ) {
      event.preventDefault();
      return false;
    }
  });
};

// 初始化错误处理
handleResizeObserverError();

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
