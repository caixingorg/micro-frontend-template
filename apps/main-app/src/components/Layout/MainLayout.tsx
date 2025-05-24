import React, { useEffect, useState } from 'react';
import { Layout, theme, Spin } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '@/store';
import { setBreadcrumb, setSelectedKeys } from '@/store/slices/appSlice';
import { useResponsive } from '@/hooks/useResponsive';
import Header from './Header';
import Sidebar from './Sidebar';
import Breadcrumb from './Breadcrumb';
import { microAppRoutes } from '@/config/microApps';

const { Content } = Layout;

const MainLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { collapsed } = useAppSelector(state => state.app);
  const [loading, setLoading] = useState(false);
  const responsive = useResponsive();

  const {
    token: { colorBgContainer, borderRadius },
  } = theme.useToken();

  useEffect(() => {
    // 根据当前路径更新面包屑和选中的菜单项
    const pathname = location.pathname;

    // 更新选中的菜单项
    const selectedKeys = [pathname];
    dispatch(setSelectedKeys(selectedKeys));

    // 更新面包屑
    const breadcrumbItems = generateBreadcrumb(pathname);
    dispatch(setBreadcrumb(breadcrumbItems));
  }, [location.pathname, dispatch]);

  const generateBreadcrumb = (pathname: string) => {
    const items = [{ title: '首页', path: '/' }];

    // 查找匹配的微应用路由
    const matchedRoute = microAppRoutes.find(route =>
      pathname.startsWith(route.path.replace('/*', ''))
    );

    if (matchedRoute) {
      items.push({
        title: matchedRoute.meta?.title || matchedRoute.name,
        path: matchedRoute.path.replace('/*', ''),
      });
    }

    return items;
  };

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
              background: colorBgContainer,
              borderRadius: borderRadius,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.3s ease',
              overflow: 'hidden',
            }}
          >
            <Spin spinning={loading} size="large">
              <div
                style={{
                  minHeight: '100%',
                  animation: 'fadeIn 0.5s ease-in-out',
                }}
                className="fade-in"
              >
                <Outlet />
              </div>
            </Spin>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
