import React from 'react';
import { Layout, Menu, theme } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  AppstoreOutlined,
  SettingOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

import { useAppSelector, useAppDispatch } from '@/store';
import { setSelectedKeys, setOpenKeys } from '@/store/slices/appSlice';
import { useResponsive } from '@/hooks/useResponsive';
import { microAppRoutes } from '@/config/microApps';

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { collapsed, selectedKeys, openKeys } = useAppSelector(state => state.app);
  const responsive = useResponsive();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/micro-apps',
      icon: <AppstoreOutlined />,
      label: '微应用',
      children: microAppRoutes.map(route => ({
        key: route.path.replace('/*', ''),
        icon: <DashboardOutlined />,
        label: route.name,
      })),
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    dispatch(setSelectedKeys([e.key]));
    navigate(e.key);
  };

  const handleOpenChange = (keys: string[]) => {
    dispatch(setOpenKeys(keys));
  };

  if (responsive.isMobile && !collapsed) {
    return null;
  }

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={256}
      collapsedWidth={80}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        height: '100vh',
        zIndex: 1000,
        background: colorBgContainer,
        borderRight: '1px solid #f0f0f0',
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0',
          padding: collapsed ? '0 16px' : '0 24px',
        }}
      >
        {collapsed ? (
          <div
            style={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          >
            MF
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              MF
            </div>
            <span
              style={{
                fontSize: '16px',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              微前端
            </span>
          </div>
        )}
      </div>

      <Menu
        theme="light"
        mode="inline"
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        items={menuItems}
        onClick={handleMenuClick}
        onOpenChange={handleOpenChange}
        style={{
          border: 'none',
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
        }}
      />
    </Sider>
  );
};

export default Sidebar;
