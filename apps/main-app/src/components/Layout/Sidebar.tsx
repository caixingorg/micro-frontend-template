import React from 'react';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  AppstoreOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '@/store';
import { setOpenKeys } from '@/store/slices/appSlice';

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const { collapsed, selectedKeys, openKeys } = useAppSelector(state => state.app);

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
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div
        style={{
          height: 32,
          margin: 16,
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
        }}
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
      />
    </Sider>
  );
};

export default Sidebar;
