import React from 'react';
import { Breadcrumb as AntBreadcrumb } from 'antd';
import { Link } from 'react-router-dom';

import { useAppSelector } from '@/store';

const Breadcrumb: React.FC = () => {
  const { breadcrumb } = useAppSelector(state => state.app);

  const items = breadcrumb.map((item, index) => ({
    title: item.path && index < breadcrumb.length - 1 ? (
      <Link to={item.path}>{item.title}</Link>
    ) : (
      item.title
    ),
  }));

  return (
    <AntBreadcrumb
      style={{ margin: '16px 0' }}
      items={items}
    />
  );
};

export default Breadcrumb;
