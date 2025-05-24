import React from 'react';
import { Layout } from 'antd';
import { useLocation } from 'react-router-dom';

import { useAppSelector } from '@/store';
import { useResponsive } from '@/hooks/useResponsive';
import Header from './Layout/Header';
import Sidebar from './Layout/Sidebar';
import Breadcrumb from './Layout/Breadcrumb';
import MicroAppContainer from './MicroAppContainer';

const { Content } = Layout;

const AppLayout: React.FC = () => {
  const location = useLocation();
  const { collapsed } = useAppSelector(state => state.app);
  const responsive = useResponsive();
  const isHome = location.pathname === '/';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout
        style={{
          marginLeft: responsive.isMobile ? 0 : (collapsed ? 80 : 256),
          transition: 'margin-left 0.2s ease-in-out',
        }}
      >
        <Header />
        <Layout
          style={{
            padding: responsive.isMobile ? '0 16px 16px' : '0 24px 24px',
            background: 'transparent',
          }}
        >
          <Breadcrumb />
          <Content
            style={{
              padding: responsive.isMobile ? 16 : 24,
              margin: 0,
              minHeight: 'calc(100vh - 180px)',
              background: '#ffffff',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              overflow: 'hidden',
            }}
          >
            {isHome ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#666',
                }}
              >
                <h1 style={{ fontSize: '2em', marginBottom: '16px' }}>
                  欢迎使用微前端系统
                </h1>
                <p>请从左侧菜单选择应用进行体验</p>
              </div>
            ) : (
              <MicroAppContainer />
            )}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
