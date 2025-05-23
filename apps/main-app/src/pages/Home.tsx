import React from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Button } from 'antd';
import {
  UserOutlined,
  AppstoreOutlined,
  CloudServerOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { useAppSelector } from '@/store';

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo } = useAppSelector(state => state.user);
  const { loadedApps } = useAppSelector(state => state.microApp);

  const statisticsData = [
    {
      title: '在线用户',
      value: 1234,
      icon: <UserOutlined style={{ color: '#1890ff' }} />,
    },
    {
      title: '微应用数量',
      value: loadedApps.length,
      icon: <AppstoreOutlined style={{ color: '#52c41a' }} />,
    },
    {
      title: '系统运行时间',
      value: '99.9%',
      suffix: '可用性',
      icon: <CloudServerOutlined style={{ color: '#faad14' }} />,
    },
    {
      title: '安全等级',
      value: 'A+',
      icon: <SafetyOutlined style={{ color: '#f5222d' }} />,
    },
  ];

  const quickActions = [
    {
      title: 'React应用',
      description: '基于React的微前端应用',
      path: '/react-app',
      color: '#61dafb',
    },
    {
      title: 'Vue3应用',
      description: '基于Vue3的微前端应用',
      path: '/vue3-app',
      color: '#4fc08d',
    },
    {
      title: '用户管理',
      description: '管理系统用户和权限',
      path: '/system/users',
      color: '#722ed1',
    },
    {
      title: '系统设置',
      description: '配置系统参数和选项',
      path: '/system/settings',
      color: '#fa8c16',
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          欢迎回来，{userInfo?.username || '用户'}！
        </Title>
        <Paragraph>
          这是一个企业级微前端平台，基于qiankun框架构建，支持React、Vue等多种技术栈的微应用。
        </Paragraph>
      </div>

      {/* 统计数据 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {statisticsData.map((item, index) => (
          <Col span={6} key={index}>
            <Card>
              <Statistic
                title={item.title}
                value={item.value}
                suffix={item.suffix}
                prefix={item.icon}
                valueStyle={{ fontSize: '24px' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 快速操作 */}
      <Card title="快速操作" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          {quickActions.map((action, index) => (
            <Col span={6} key={index}>
              <Card
                hoverable
                style={{
                  borderLeft: `4px solid ${action.color}`,
                  cursor: 'pointer',
                }}
                onClick={() => navigate(action.path)}
              >
                <Space direction="vertical" size="small">
                  <Title level={4} style={{ margin: 0, color: action.color }}>
                    {action.title}
                  </Title>
                  <Paragraph style={{ margin: 0, color: '#666' }}>
                    {action.description}
                  </Paragraph>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 系统信息 */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="系统信息">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>版本号：</span>
                <span>v1.0.0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>构建时间：</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>运行环境：</span>
                <span>{process.env.NODE_ENV}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>微前端框架：</span>
                <span>qiankun</span>
              </div>
            </Space>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="最近活动">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>✅ React微应用已加载</div>
              <div>✅ Vue3微应用已加载</div>
              <div>✅ 用户权限验证通过</div>
              <div>✅ 系统健康检查正常</div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
