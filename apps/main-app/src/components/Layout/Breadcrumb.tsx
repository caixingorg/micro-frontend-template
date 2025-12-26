import React from 'react';
import { Breadcrumb as AntBreadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

import { useAppSelector } from '@/store';

const Breadcrumb: React.FC = () => {
  const { breadcrumb } = useAppSelector(state => state.app);

  const breadcrumbItems = breadcrumb.map((item, index) => ({
    key: item.path || index,
    title: index === 0 ? (
      <span>
        <HomeOutlined style={{ marginRight: '4px' }} />
        {item.path ? <Link to={item.path}>{item.title}</Link> : item.title}
      </span>
    ) : (
      item.path ? <Link to={item.path}>{item.title}</Link> : item.title
    ),
  }));

  if (breadcrumb.length === 0) {
    return null;
  }

  return (
    <AntBreadcrumb
      items={breadcrumbItems}
      style={{
        margin: '16px 0',
        fontSize: '14px',
      }}
    />
  );
};

export default Breadcrumb;
