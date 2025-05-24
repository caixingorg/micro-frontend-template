import React from 'react';
import { Breadcrumb as AntBreadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

import { useAppSelector } from '@/store';

const Breadcrumb: React.FC = () => {
  const { breadcrumb } = useAppSelector(state => state.app);

  const items = breadcrumb.map((item, index) => ({
    title: item.path && index < breadcrumb.length - 1 ? (
      <Link
        to={item.path}
        style={{
          color: '#666',
          textDecoration: 'none',
          transition: 'color 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#1890ff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#666';
        }}
      >
        {index === 0 && <HomeOutlined style={{ marginRight: '4px' }} />}
        {item.title}
      </Link>
    ) : (
      <span style={{ color: '#333', fontWeight: '500' }}>
        {index === 0 && <HomeOutlined style={{ marginRight: '4px' }} />}
        {item.title}
      </span>
    ),
  }));

  return (
    <AntBreadcrumb
      style={{
        margin: '16px 0',
        padding: '12px 16px',
        background: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '8px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}
      items={items}
    />
  );
};

export default Breadcrumb;
