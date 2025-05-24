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
        padding: '0 24px',
        background: colorBgContainer,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 999,
        height: 64,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => dispatch(setCollapsed(!collapsed))}
          style={{
            fontSize: '16px',
            width: 48,
            height: 48,
            borderRadius: '8px',
            transition: 'all 0.3s ease',
          }}
          className="header-collapse-btn"
        />
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
          <h1
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            企业级微前端平台
          </h1>
        </div>
      </div>

      <Space size="large">
        <Space size="small">
          <BulbOutlined style={{ fontSize: '16px', color: '#666' }} />
          <Switch
            checked={appTheme === 'dark'}
            onChange={handleThemeChange}
            checkedChildren="🌙"
            unCheckedChildren="☀️"
            style={{
              background: appTheme === 'dark' ? '#1890ff' : '#f0f0f0',
            }}
          />
        </Space>

        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          arrow
          trigger={['click']}
        >
          <Space
            style={{
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
            }}
            className="user-dropdown"
          >
            <Avatar
              size={32}
              icon={<UserOutlined />}
              src={userInfo?.avatar}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            />
            <span style={{ fontWeight: '500' }}>
              {userInfo?.username || '用户'}
            </span>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;
