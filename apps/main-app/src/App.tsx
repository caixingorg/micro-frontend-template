import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';

import { useAppSelector } from '@/store';
import AppLayout from './components/AppLayout';
import { microApps } from './config/microApps';
import { microAppManager } from './micro/MicroAppManager';

const App: React.FC = () => {
  const { theme: appTheme } = useAppSelector(state => state.app);

  useEffect(() => {
    // 初始化微应用管理器
    const initializeMicroApps = async () => {
      try {
        await microAppManager.initialize(microApps);
        console.log('[App] MicroAppManager initialized successfully');
      } catch (error) {
        console.error('[App] Failed to initialize MicroAppManager:', error);
      }
    };

    initializeMicroApps();
  }, []);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: appTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#667eea',
          borderRadius: 8,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
      }}
    >
      <Router>
        <Routes>
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;
