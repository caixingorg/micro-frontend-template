import React from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Button, Progress, Tag } from 'antd';
import {
  UserOutlined,
  AppstoreOutlined,
  CloudServerOutlined,
  SafetyOutlined,
  RocketOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { useAppSelector } from '@/store';

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo } = useAppSelector(state => state.user);

  const statisticsData = [
    {
      title: '在线用户',
      value: 1234,
      icon: <UserOutlined style={{ color: '#1890ff' }} />,
    },
    {
      title: '微应用数量',
      value: 3,
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
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {statisticsData.map((item, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              hoverable
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: 'none',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                position: 'relative',
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '60px',
                  height: '60px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '0 0 0 60px',
                }}
              />
              <Statistic
                title={
                  <span style={{
                    color: '#666',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    {item.title}
                  </span>
                }
                value={item.value}
                suffix={item.suffix}
                prefix={
                  <div style={{
                    fontSize: '24px',
                    marginRight: '8px',
                    position: 'relative',
                    zIndex: 1,
                  }}>
                    {item.icon}
                  </div>
                }
                valueStyle={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#333',
                }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 快速操作 */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RocketOutlined style={{ color: '#1890ff' }} />
            <span style={{ fontSize: '18px', fontWeight: '600' }}>快速操作</span>
          </div>
        }
        style={{
          marginBottom: 32,
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: 'none',
        }}
        styles={{ body: { padding: '24px' } }}
      >
        <Row gutter={[16, 16]}>
          {quickActions.map((action, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card
                hoverable
                style={{
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  background: `linear-gradient(135deg, ${action.color}15 0%, ${action.color}05 100%)`,
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                styles={{ body: { padding: '20px' } }}
                onClick={() => navigate(action.path)}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '80px',
                    height: '80px',
                    background: `${action.color}20`,
                    borderRadius: '50%',
                  }}
                />
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        background: action.color,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '16px',
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      {index === 0 ? <ThunderboltOutlined /> :
                       index === 1 ? <HeartOutlined /> :
                       index === 2 ? <UserOutlined /> : <TrophyOutlined />}
                    </div>
                    <Title level={5} style={{ margin: 0, color: action.color, fontWeight: '600' }}>
                      {action.title}
                    </Title>
                  </div>
                  <Paragraph style={{ margin: 0, color: '#666', fontSize: '13px' }}>
                    {action.description}
                  </Paragraph>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 系统信息 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CloudServerOutlined style={{ color: '#52c41a' }} />
                <span style={{ fontSize: '16px', fontWeight: '600' }}>系统信息</span>
              </div>
            }
            style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              border: 'none',
              background: 'linear-gradient(135deg, #f6ffed 0%, #f6ffed 100%)',
            }}
            styles={{ body: { padding: '24px' } }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #f0f0f0',
              }}>
                <span style={{ color: '#666', fontWeight: '500' }}>版本号：</span>
                <Tag color="blue">v1.0.0</Tag>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #f0f0f0',
              }}>
                <span style={{ color: '#666', fontWeight: '500' }}>构建时间：</span>
                <span style={{ fontWeight: '500' }}>{new Date().toLocaleDateString()}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #f0f0f0',
              }}>
                <span style={{ color: '#666', fontWeight: '500' }}>运行环境：</span>
                <Tag color={process.env.NODE_ENV === 'development' ? 'orange' : 'green'}>
                  {process.env.NODE_ENV}
                </Tag>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
              }}>
                <span style={{ color: '#666', fontWeight: '500' }}>微前端框架：</span>
                <Tag color="purple">qiankun</Tag>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrophyOutlined style={{ color: '#faad14' }} />
                <span style={{ fontSize: '16px', fontWeight: '600' }}>最近活动</span>
              </div>
            }
            style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              border: 'none',
              background: 'linear-gradient(135deg, #fffbe6 0%, #fffbe6 100%)',
            }}
            styles={{ body: { padding: '24px' } }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#52c41a',
                  borderRadius: '50%'
                }} />
                <span>React微应用已加载</span>
                <Tag color="success" style={{ fontSize: '12px' }}>完成</Tag>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#52c41a',
                  borderRadius: '50%'
                }} />
                <span>Vue3微应用已加载</span>
                <Tag color="success" style={{ fontSize: '12px' }}>完成</Tag>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#52c41a',
                  borderRadius: '50%'
                }} />
                <span>用户权限验证通过</span>
                <Tag color="success" style={{ fontSize: '12px' }}>完成</Tag>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#52c41a',
                  borderRadius: '50%'
                }} />
                <span>系统健康检查正常</span>
                <Tag color="success" style={{ fontSize: '12px' }}>完成</Tag>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
