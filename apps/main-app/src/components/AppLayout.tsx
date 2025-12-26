import React, { useEffect, useState } from 'react';
import { Layout, theme, Spin } from 'antd';
import { useLocation } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '@/store';
import { setBreadcrumb, setSelectedKeys } from '@/store/slices/appSlice';
import { useResponsive } from '@/hooks/useResponsive';
import Header from './Layout/Header';
import Sidebar from './Layout/Sidebar';
import Breadcrumb from './Layout/Breadcrumb';
import MicroAppContainer from './MicroAppContainer';
import { PerformanceMonitor } from './PerformanceMonitor';
import { microAppRoutes } from '@/config/microApps';

const { Content } = Layout;

const AppLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { collapsed } = useAppSelector(state => state.app);
  const [loading, setLoading] = useState(false);
  const responsive = useResponsive();
  const isHome = location.pathname === '/';

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
    <Layout style={{ minHeight: '100vh' }} hasSider>
      <Sidebar />
      <Layout style={{ marginLeft: responsive.isMobile ? 0 : (collapsed ? 80 : 256), transition: 'all 0.2s' }}>
        <Header />

        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadius,
            minHeight: 280,
            overflow: 'auto', // 允许滚动，防止内容截断
            position: 'relative'
          }}
        >
          {/* 移除 Spin 组件的包裹，避免其 div 结构导致 flex 布局塌陷 
               加载状态由 MicroAppContainer 内部或 Global Loading 处理 */}
          <div style={{ height: '100%', width: '100%' }}>
            {isHome ? (
              <div style={{ textAlign: 'center', padding: '100px 0', color: '#666' }}>
                <h1>欢迎使用微前端系统</h1>
                <p>请从左侧菜单选择应用</p>
              </div>
            ) : (
              <MicroAppContainer />
            )}
          </div>
        </Content>
      </Layout>

      {/* 性能监控浮动按钮 */}
      <PerformanceMonitor />
    </Layout>
  );
};

export default AppLayout;
