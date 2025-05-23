import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';

import { useAppSelector, useAppDispatch } from '@/store';
import { getUserInfoAsync } from '@/store/slices/userSlice';
import { microAppManager } from '@enterprise/micro-app-sdk';
import { microApps } from '@/config/microApps';
import {
  initMonitoring,
  initDevTools,
  trackPageView,
  trackMicroAppPerformance,
  setCurrentMicroApp,
  addBreadcrumb
} from '@/utils/monitoring';

import MainLayout from '@/components/Layout/MainLayout';
import Home from '@/pages/Home';
import ReactMicroApp from '@/pages/ReactMicroApp';
import Vue3MicroApp from '@/pages/Vue3MicroApp';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme: appTheme } = useAppSelector(state => state.app);
  const { isAuthenticated } = useAppSelector(state => state.user);

  useEffect(() => {
    // 初始化监控系统
    initMonitoring();

    // 初始化开发工具
    initDevTools();

    // 初始化微前端
    initMicroApps();

    // 跟踪初始页面访问
    trackPageView();

    // 添加面包屑
    addBreadcrumb('应用启动', 'info');

    // 检查用户登录状态
    const token = localStorage.getItem('auth_token');
    if (token && !isAuthenticated) {
      dispatch(getUserInfoAsync());
    }
  }, [dispatch, isAuthenticated]);

  const initMicroApps = () => {
    // 注册微应用
    microAppManager.registerApps(microApps, {
      beforeLoad: (app) => {
        console.log(`[Main App] Before load: ${app.name}`);
        const startTime = performance.now();
        setCurrentMicroApp(app.name);
        addBreadcrumb(`开始加载微应用: ${app.name}`, 'info');
        return startTime;
      },
      beforeMount: (app) => {
        console.log(`[Main App] Before mount: ${app.name}`);
        const startTime = performance.now();
        addBreadcrumb(`开始挂载微应用: ${app.name}`, 'info');
        return startTime;
      },
      afterMount: (app) => {
        console.log(`[Main App] After mount: ${app.name}`);
        const mountTime = performance.now();
        trackMicroAppPerformance(app.name, 'mount', mountTime);
        addBreadcrumb(`微应用挂载完成: ${app.name}`, 'info');
      },
      beforeUnmount: (app) => {
        console.log(`[Main App] Before unmount: ${app.name}`);
        const startTime = performance.now();
        addBreadcrumb(`开始卸载微应用: ${app.name}`, 'info');
        return startTime;
      },
      afterUnmount: (app) => {
        console.log(`[Main App] After unmount: ${app.name}`);
        const unmountTime = performance.now();
        trackMicroAppPerformance(app.name, 'unmount', unmountTime);
        addBreadcrumb(`微应用卸载完成: ${app.name}`, 'info');
      },
    });

    // 启动qiankun
    microAppManager.start({
      prefetch: true,
      singular: false,
      sandbox: {
        experimentalStyleIsolation: true,
      },
    });
  };

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: appTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="react-app/*" element={<ReactMicroApp />} />
            <Route path="vue3-app/*" element={<Vue3MicroApp />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;
