import React from 'react';
import { Layout, Button, Dropdown, Avatar, Space, Switch, theme } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

import { useAppSelector, useAppDispatch } from '@/store';
import { setCollapsed, setTheme } from '@/store/slices/appSlice';
import { logoutAsync } from '@/store/slices/userSlice';

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { collapsed, theme: appTheme } = useAppSelector(state => state.app);
  const { userInfo } = useAppSelector(state => state.user);
  
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const handleLogout = () => {
    dispatch(logoutAsync());
  };

  const handleThemeChange = (checked: boolean) => {
    dispatch(setTheme(checked ? 'dark' : 'light'));
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader
      style={{
        padding: '0 16px',
        background: colorBgContainer,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => dispatch(setCollapsed(!collapsed))}
          style={{
            fontSize: '16px',
            width: 64,
            height: 64,
          }}
        />
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
          企业级微前端平台
        </h1>
      </div>

      <Space size="middle">
        <Space>
          <BulbOutlined />
          <Switch
            checked={appTheme === 'dark'}
            onChange={handleThemeChange}
            checkedChildren="🌙"
            unCheckedChildren="☀️"
          />
        </Space>
        
        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          arrow
        >
          <Space style={{ cursor: 'pointer' }}>
            <Avatar
              size="small"
              icon={<UserOutlined />}
              src={userInfo?.avatar}
            />
            <span>{userInfo?.username || '用户'}</span>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;
