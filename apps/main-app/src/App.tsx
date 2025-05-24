import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { registerMicroApps, start } from 'qiankun';
import zhCN from 'antd/locale/zh_CN';

import { useAppSelector } from '@/store';
import AppLayout from './components/AppLayout';
import { microApps } from './config/microApps';

const App: React.FC = () => {
  const { theme: appTheme } = useAppSelector(state => state.app);

  useEffect(() => {
    // 注册微应用
    registerMicroApps(microApps, {
      beforeLoad: (app) => {
        console.log(`Loading micro app: ${app.name}`);
        return Promise.resolve();
      },
      afterMount: (app) => {
        console.log(`Mounted micro app: ${app.name}`);
        return Promise.resolve();
      },
      beforeUnmount: (app) => {
        console.log(`Unmounting micro app: ${app.name}`);
        return Promise.resolve();
      },
    });

    // 启动qiankun
    start({
      prefetch: false, // 关闭预加载，按需加载
      sandbox: {
        strictStyleIsolation: false,
        experimentalStyleIsolation: true, // 开启样式隔离
        loose: true, // 宽松沙箱模式，提高兼容性
      },
      singular: false, // 允许多个微应用同时存在
      excludeAssetFilter: (assetUrl) => {
        // 排除主应用的样式文件，避免被子应用影响
        const excludeAssets = ['/static/css/', '/assets/', '/styles/'];
        return excludeAssets.some(asset => assetUrl.includes(asset));
      },
    });
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
