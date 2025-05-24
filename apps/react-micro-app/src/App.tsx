import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

import Home from '@/pages/Home';
import Dashboard from '@/pages/Dashboard';
import UserList from '@/pages/UserList';

interface AppProps {
  routerBase?: string;
}

const App: React.FC<AppProps> = ({ routerBase }) => {
  // 在独立运行时使用根路径，在微前端环境中使用指定的基础路径
  const basename = routerBase || '/';
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 参考qiankun官方FAQ的样式隔离最佳实践
    const isQiankun = !!(window as any).__POWERED_BY_QIANKUN__;

    if (!isQiankun) return;

    console.log('[React App] Applying qiankun official style isolation practices');

    // 官方推荐方案：确保样式容器存在，但依赖qiankun的experimentalStyleIsolation
    // 这里只做最小化的容器确保，主要依赖qiankun的官方样式隔离机制
    const ensureBasicStyleContainer = () => {
      if (!document.head) {
        const head = document.createElement('head');
        document.documentElement.insertBefore(head, document.body);
      }
    };

    ensureBasicStyleContainer();

    return () => {
      // 清理函数 - 由于使用官方样式隔离，这里不需要手动清理
      console.log('[React App] Style environment cleanup handled by qiankun');
    };
  }, []);

  // 参考Ant Design官方推荐的getPopupContainer配置
  const getPopupContainer = (triggerNode?: Element | null): HTMLElement => {
    // 优先使用触发节点的父容器（Ant Design官方推荐）
    if (triggerNode?.parentElement) {
      return triggerNode.parentElement as HTMLElement;
    }

    // 在qiankun环境中使用应用容器
    if (containerRef.current) {
      return containerRef.current;
    }

    // 默认返回body
    return document.body;
  };

  return (
    <div ref={containerRef} style={{ height: '100%' }}>
      <ConfigProvider
        locale={zhCN}
        getPopupContainer={getPopupContainer}
      >
        <Router basename={basename} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div style={{ padding: '20px' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<UserList />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </ConfigProvider>
    </div>
  );
};

export default App;
