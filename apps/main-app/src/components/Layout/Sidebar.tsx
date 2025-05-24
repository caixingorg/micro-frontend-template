import React, { useEffect } from 'react';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  AppstoreOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '@/store';
import { setOpenKeys, setSelectedKeys } from '@/store/slices/appSlice';

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { collapsed, selectedKeys, openKeys } = useAppSelector(state => state.app);

  // 监听路由变化，更新菜单状态
  useEffect(() => {
    const pathname = location.pathname;
    
    // 设置选中的菜单项
    if (pathname.startsWith('/react-app')) {
      dispatch(setSelectedKeys(['/react-app']));
      dispatch(setOpenKeys(['/micro-apps']));
    } else if (pathname.startsWith('/vue3-app')) {
      dispatch(setSelectedKeys(['/vue3-app']));
      dispatch(setOpenKeys(['/micro-apps']));
    } else if (pathname.startsWith('/vue2-app')) {
      dispatch(setSelectedKeys(['/vue2-app']));
      dispatch(setOpenKeys(['/micro-apps']));
    } else if (pathname.startsWith('/system')) {
      dispatch(setSelectedKeys([pathname]));
      dispatch(setOpenKeys(['/system']));
    } else {
      dispatch(setSelectedKeys([pathname]));
      dispatch(setOpenKeys([]));
    }
  }, [location.pathname, dispatch]);

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/micro-apps',
      icon: <AppstoreOutlined />,
      label: '微应用',
      children: [
        {
          key: '/react-app',
          label: 'React应用',
        },
        {
          key: '/vue3-app',
          label: 'Vue3应用',
        },
        {
          key: '/vue2-app',
          label: 'Vue2应用',
        },
      ],
    },
    {
      key: '/system',
      icon: <SettingOutlined />,
      label: '系统管理',
      children: [
        {
          key: '/system/users',
          label: '用户管理',
        },
        {
          key: '/system/roles',
          label: '角色管理',
        },
        {
          key: '/system/permissions',
          label: '权限管理',
        },
      ],
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleOpenChange = (keys: string[]) => {
    dispatch(setOpenKeys(keys));
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={256}
      collapsedWidth={80}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1000,
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <div
        style={{
          height: 64,
          margin: '16px 16px 24px 16px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: collapsed ? '14px' : '16px',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
        }}
        onClick={() => navigate('/')}
      >
        {collapsed ? 'MF' : 'Micro Frontend'}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        items={menuItems}
        onClick={handleMenuClick}
        onOpenChange={handleOpenChange}
        style={{
          borderRight: 'none',
          background: 'transparent',
        }}
      />
    </Sider>
  );
};

export default Sidebar;
