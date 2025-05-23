import React from 'react';
import { Card, Row, Col, Statistic, Progress, Typography } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  EyeOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const statisticsData = [
    {
      title: '总用户数',
      value: 11280,
      precision: 0,
      valueStyle: { color: '#3f8600' },
      prefix: <ArrowUpOutlined />,
      suffix: <UserOutlined />,
    },
    {
      title: '总订单数',
      value: 9300,
      precision: 0,
      valueStyle: { color: '#cf1322' },
      prefix: <ArrowDownOutlined />,
      suffix: <ShoppingCartOutlined />,
    },
    {
      title: '总收入',
      value: 112893,
      precision: 2,
      valueStyle: { color: '#3f8600' },
      prefix: <DollarOutlined />,
      suffix: '元',
    },
    {
      title: '页面浏览量',
      value: 893012,
      precision: 0,
      valueStyle: { color: '#1890ff' },
      suffix: <EyeOutlined />,
    },
  ];

  const progressData = [
    { title: '销售目标完成度', percent: 75, status: 'active' as const },
    { title: '用户增长率', percent: 60, status: 'normal' as const },
    { title: '客户满意度', percent: 90, status: 'success' as const },
    { title: '系统稳定性', percent: 95, status: 'success' as const },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        数据仪表板
      </Title>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {statisticsData.map((item, index) => (
          <Col span={6} key={index}>
            <Card>
              <Statistic
                title={item.title}
                value={item.value}
                precision={item.precision}
                valueStyle={item.valueStyle}
                prefix={item.prefix}
                suffix={item.suffix}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 进度指标 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {progressData.map((item, index) => (
          <Col span={6} key={index}>
            <Card>
              <div style={{ marginBottom: 16 }}>
                <strong>{item.title}</strong>
              </div>
              <Progress
                percent={item.percent}
                status={item.status}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 详细数据 */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="最近活动">
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', color: '#999' }}>
                <p>这里可以集成图表组件</p>
                <p>如 ECharts、Chart.js 等</p>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="系统状态">
            <div style={{ height: 300 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>CPU 使用率</span>
                  <span>45%</span>
                </div>
                <Progress percent={45} showInfo={false} />
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>内存使用率</span>
                  <span>67%</span>
                </div>
                <Progress percent={67} showInfo={false} status="active" />
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>磁盘使用率</span>
                  <span>23%</span>
                </div>
                <Progress percent={23} showInfo={false} />
              </div>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>网络带宽</span>
                  <span>89%</span>
                </div>
                <Progress percent={89} showInfo={false} status="exception" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
