import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

import Home from '@/pages/Home';
import Dashboard from '@/pages/Dashboard';
import UserList from '@/pages/UserList';

interface AppProps {
  routerBase?: string;
}

const App: React.FC<AppProps> = ({ routerBase = '/react-app' }) => {
  return (
    <ConfigProvider locale={zhCN}>
      <Router basename={routerBase}>
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
  );
};

export default App;
