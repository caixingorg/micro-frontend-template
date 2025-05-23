<template>
  <div>
    <a-typography-title :level="2" style="margin-bottom: 24px">
      订单管理
    </a-typography-title>

    <!-- 统计卡片 -->
    <a-row :gutter="16" style="margin-bottom: 24px">
      <a-col :span="6" v-for="(stat, index) in statistics" :key="index">
        <a-card>
          <a-statistic
            :title="stat.title"
            :value="stat.value"
            :precision="stat.precision"
            :value-style="stat.valueStyle"
            :prefix="stat.prefix"
            :suffix="stat.suffix"
          />
        </a-card>
      </a-col>
    </a-row>

    <a-card>
      <!-- 搜索和过滤 -->
      <div style="margin-bottom: 16px; display: flex; justify-content: space-between">
        <a-space>
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索订单号或客户"
            allow-clear
            style="width: 300px"
          />
          <a-select
            v-model:value="statusFilter"
            style="width: 120px"
          >
            <a-select-option value="all">全部状态</a-select-option>
            <a-select-option value="pending">待处理</a-select-option>
            <a-select-option value="processing">处理中</a-select-option>
            <a-select-option value="shipped">已发货</a-select-option>
            <a-select-option value="delivered">已送达</a-select-option>
            <a-select-option value="cancelled">已取消</a-select-option>
          </a-select>
          <a-range-picker v-model:value="dateRange" />
        </a-space>
        
        <a-button type="primary" @click="handleExport">
          <template #icon>
            <DownloadOutlined />
          </template>
          导出订单
        </a-button>
      </div>

      <!-- 订单表格 -->
      <a-table
        :columns="columns"
        :data-source="filteredOrders"
        :loading="loading"
        row-key="id"
        :pagination="{
          total: filteredOrders.length,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
        }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'amount'">
            ¥{{ record.amount.toFixed(2) }}
          </template>
          
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          
          <template v-if="column.key === 'action'">
            <a-space size="middle">
              <a-button type="link" @click="handleView(record)">
                查看详情
              </a-button>
              <a-button 
                type="link" 
                @click="handleUpdateStatus(record)"
                v-if="record.status !== 'delivered' && record.status !== 'cancelled'"
              >
                更新状态
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { DownloadOutlined } from '@ant-design/icons-vue';
import type { Dayjs } from 'dayjs';

const loading = ref(false);
const searchText = ref('');
const statusFilter = ref('all');
const dateRange = ref<[Dayjs, Dayjs] | null>(null);

// 模拟订单数据
const orders = ref([
  {
    id: 'ORD001',
    customer: '张三',
    amount: 1299.00,
    status: 'pending',
    createTime: '2023-12-01 10:30:00',
    items: 2,
  },
  {
    id: 'ORD002',
    customer: '李四',
    amount: 899.50,
    status: 'processing',
    createTime: '2023-12-01 14:20:00',
    items: 1,
  },
  {
    id: 'ORD003',
    customer: '王五',
    amount: 2599.00,
    status: 'shipped',
    createTime: '2023-11-30 16:45:00',
    items: 3,
  },
  {
    id: 'ORD004',
    customer: '赵六',
    amount: 599.00,
    status: 'delivered',
    createTime: '2023-11-29 09:15:00',
    items: 1,
  },
]);

const statistics = computed(() => [
  {
    title: '总订单数',
    value: orders.value.length,
    valueStyle: { color: '#3f8600' },
  },
  {
    title: '待处理订单',
    value: orders.value.filter(o => o.status === 'pending').length,
    valueStyle: { color: '#cf1322' },
  },
  {
    title: '总金额',
    value: orders.value.reduce((sum, order) => sum + order.amount, 0),
    precision: 2,
    prefix: '¥',
    valueStyle: { color: '#1890ff' },
  },
  {
    title: '平均订单金额',
    value: orders.value.length > 0 
      ? orders.value.reduce((sum, order) => sum + order.amount, 0) / orders.value.length 
      : 0,
    precision: 2,
    prefix: '¥',
    valueStyle: { color: '#722ed1' },
  },
]);

const columns = [
  {
    title: '订单号',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: '客户',
    dataIndex: 'customer',
    key: 'customer',
  },
  {
    title: '商品数量',
    dataIndex: 'items',
    key: 'items',
  },
  {
    title: '订单金额',
    dataIndex: 'amount',
    key: 'amount',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
  },
  {
    title: '操作',
    key: 'action',
  },
];

const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchText.value.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchText.value.toLowerCase());
    const matchesStatus = statusFilter.value === 'all' || order.status === statusFilter.value;
    return matchesSearch && matchesStatus;
  });
});

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: 'orange',
    processing: 'blue',
    shipped: 'cyan',
    delivered: 'green',
    cancelled: 'red',
  };
  return colorMap[status] || 'default';
};

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    shipped: '已发货',
    delivered: '已送达',
    cancelled: '已取消',
  };
  return textMap[status] || status;
};

const handleView = (record: any) => {
  console.log('查看订单详情:', record);
};

const handleUpdateStatus = (record: any) => {
  console.log('更新订单状态:', record);
};

const handleExport = () => {
  console.log('导出订单数据');
};

onMounted(() => {
  // 组件挂载时的初始化逻辑
});
</script>
