import React, { useEffect } from 'react';
import { Layout, theme } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '@/store';
import { setBreadcrumb, setSelectedKeys } from '@/store/slices/appSlice';
import Header from './Header';
import Sidebar from './Sidebar';
import Breadcrumb from './Breadcrumb';
import { microAppRoutes } from '@/config/microApps';

const { Content } = Layout;

const MainLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { collapsed, theme: appTheme } = useAppSelector(state => state.app);
  
  const {
    token: { colorBgContainer },
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
      <Layout>
        <Header />
        <Layout style={{ padding: '0 24px 24px' }}>
          <Breadcrumb />
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: 8,
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
