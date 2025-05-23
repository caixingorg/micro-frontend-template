import React, { useState } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Avatar,
  Input,
  Select,
  Typography,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  avatar?: string;
  createTime: string;
}

const UserList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 模拟数据
  const [users] = useState<User[]>([
    {
      id: '1',
      name: '张三',
      email: 'zhangsan@example.com',
      role: 'admin',
      status: 'active',
      createTime: '2023-01-15',
    },
    {
      id: '2',
      name: '李四',
      email: 'lisi@example.com',
      role: 'user',
      status: 'active',
      createTime: '2023-02-20',
    },
    {
      id: '3',
      name: '王五',
      email: 'wangwu@example.com',
      role: 'editor',
      status: 'inactive',
      createTime: '2023-03-10',
    },
    {
      id: '4',
      name: '赵六',
      email: 'zhaoliu@example.com',
      role: 'user',
      status: 'active',
      createTime: '2023-04-05',
    },
  ]);

  const handleEdit = (record: User) => {
    console.log('编辑用户:', record);
  };

  const handleDelete = (record: User) => {
    console.log('删除用户:', record);
  };

  const handleAdd = () => {
    console.log('添加用户');
  };

  const columns: ColumnsType<User> = [
    {
      title: '用户',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar
            size="small"
            icon={<UserOutlined />}
            src={record.avatar}
          />
          <div>
            <div>{text}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              {record.email}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const roleConfig = {
          admin: { color: 'red', text: '管理员' },
          editor: { color: 'blue', text: '编辑者' },
          user: { color: 'green', text: '普通用户' },
        };
        const config = roleConfig[role as keyof typeof roleConfig] || { color: 'default', text: role };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? '活跃' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 过滤数据
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        用户管理
      </Title>

      <Card>
        {/* 搜索和过滤 */}
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Search
              placeholder="搜索用户名或邮箱"
              allowClear
              style={{ width: 300 }}
              onSearch={setSearchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              value={statusFilter}
              style={{ width: 120 }}
              onChange={setStatusFilter}
            >
              <Option value="all">全部状态</Option>
              <Option value="active">活跃</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </Space>
          
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            添加用户
          </Button>
        </div>

        {/* 用户表格 */}
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredUsers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
          }}
        />
      </Card>
    </div>
  );
};

export default UserList;
