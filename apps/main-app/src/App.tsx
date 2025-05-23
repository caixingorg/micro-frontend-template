import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';

import { useAppSelector, useAppDispatch } from '@/store';
import { getUserInfoAsync } from '@/store/slices/userSlice';
import { microAppManager } from '@enterprise/micro-app-sdk';
import { microApps } from '@/config/microApps';

import MainLayout from '@/components/Layout/MainLayout';
import Home from '@/pages/Home';
import ReactMicroApp from '@/pages/ReactMicroApp';
import Vue3MicroApp from '@/pages/Vue3MicroApp';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme: appTheme } = useAppSelector(state => state.app);
  const { isAuthenticated } = useAppSelector(state => state.user);

  useEffect(() => {
    // 初始化微前端
    initMicroApps();
    
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
      },
      beforeMount: (app) => {
        console.log(`[Main App] Before mount: ${app.name}`);
      },
      afterMount: (app) => {
        console.log(`[Main App] After mount: ${app.name}`);
      },
      beforeUnmount: (app) => {
        console.log(`[Main App] Before unmount: ${app.name}`);
      },
      afterUnmount: (app) => {
        console.log(`[Main App] After unmount: ${app.name}`);
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
