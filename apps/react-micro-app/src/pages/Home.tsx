import React from 'react';
import { Card, Typography, Space, Button, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: '数据仪表板',
      description: '查看实时数据和统计信息',
      icon: <DashboardOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      path: '/dashboard',
    },
    {
      title: '用户管理',
      description: '管理系统用户和权限',
      icon: <UserOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
      path: '/users',
    },
    {
      title: '数据分析',
      description: '深入分析业务数据',
      icon: <BarChartOutlined style={{ fontSize: '24px', color: '#faad14' }} />,
      path: '/analytics',
    },
    {
      title: '系统设置',
      description: '配置应用参数',
      icon: <SettingOutlined style={{ fontSize: '24px', color: '#f5222d' }} />,
      path: '/settings',
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2}>欢迎使用 React 微应用</Title>
            <Paragraph>
              这是一个基于 React 18 + TypeScript + Ant Design 构建的微前端应用示例。
              它展示了如何在 qiankun 框架中集成 React 应用。
            </Paragraph>
          </div>
          
          <Row gutter={[16, 16]}>
            {features.map((feature, index) => (
              <Col span={6} key={index}>
                <Card
                  hoverable
                  style={{ textAlign: 'center', height: '200px' }}
                  bodyStyle={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center',
                    height: '100%'
                  }}
                  onClick={() => navigate(feature.path)}
                >
                  <Space direction="vertical" size="middle">
                    {feature.icon}
                    <Title level={4} style={{ margin: 0 }}>
                      {feature.title}
                    </Title>
                    <Paragraph style={{ margin: 0, color: '#666' }}>
                      {feature.description}
                    </Paragraph>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Space>
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="技术栈">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>✅ React 18</div>
              <div>✅ TypeScript</div>
              <div>✅ Ant Design</div>
              <div>✅ React Router</div>
              <div>✅ Webpack 5</div>
            </Space>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="特性">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>🚀 热更新开发</div>
              <div>📦 模块化架构</div>
              <div>🎨 响应式设计</div>
              <div>🔒 类型安全</div>
              <div>⚡ 性能优化</div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
