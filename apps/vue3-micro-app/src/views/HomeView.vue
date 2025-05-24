<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCounterStore } from '@/stores/counter'
import {
  ReloadOutlined,
  DownloadOutlined,
  UserOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  BarChartOutlined,
  PlusOutlined,
  SettingOutlined,
  FileTextOutlined,
  BellOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons-vue'

const counterStore = useCounterStore()
const chartPeriod = ref('week')

// 数据统计
const statistics = ref([
  {
    id: 1,
    label: '总用户数',
    value: '12,345',
    icon: UserOutlined,
    color: '#1890ff',
    trend: 'up',
    trendIcon: ArrowUpOutlined,
    trendText: '+12.5%'
  },
  {
    id: 2,
    label: '活跃用户',
    value: '8,234',
    icon: TeamOutlined,
    color: '#52c41a',
    trend: 'up',
    trendIcon: ArrowUpOutlined,
    trendText: '+8.2%'
  },
  {
    id: 3,
    label: '订单总数',
    value: '3,456',
    icon: ShoppingCartOutlined,
    color: '#faad14',
    trend: 'down',
    trendIcon: ArrowDownOutlined,
    trendText: '-2.1%'
  },
  {
    id: 4,
    label: '总收入',
    value: '¥234,567',
    icon: DollarOutlined,
    color: '#f5222d',
    trend: 'up',
    trendIcon: ArrowUpOutlined,
    trendText: '+15.3%'
  }
])

// 快速操作
const quickActions = ref([
  {
    id: 1,
    label: '新建用户',
    icon: PlusOutlined,
    color: '#1890ff'
  },
  {
    id: 2,
    label: '系统设置',
    icon: SettingOutlined,
    color: '#52c41a'
  },
  {
    id: 3,
    label: '数据报表',
    icon: FileTextOutlined,
    color: '#faad14'
  },
  {
    id: 4,
    label: '消息通知',
    icon: BellOutlined,
    color: '#f5222d'
  }
])

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    title: '用户张三注册了账号',
    description: '新用户通过邮箱注册',
    time: '2分钟前',
    icon: UserOutlined,
    color: '#1890ff'
  },
  {
    id: 2,
    title: '订单 #12345 已完成',
    description: '用户李四的订单已成功处理',
    time: '5分钟前',
    icon: ShoppingCartOutlined,
    color: '#52c41a'
  },
  {
    id: 3,
    title: '系统维护通知',
    description: '系统将于今晚进行例行维护',
    time: '10分钟前',
    icon: SettingOutlined,
    color: '#faad14'
  },
  {
    id: 4,
    title: '数据备份完成',
    description: '每日数据备份已成功完成',
    time: '1小时前',
    icon: FileTextOutlined,
    color: '#722ed1'
  }
])

// 系统信息
const systemInfo = ref([
  { label: 'CPU使用率', value: '45%' },
  { label: '内存使用率', value: '68%' },
  { label: '磁盘使用率', value: '32%' },
  { label: '网络状态', value: '正常' },
  { label: '在线用户', value: '1,234' },
  { label: '系统版本', value: 'v1.2.3' }
])

// 通知公告
const notices = ref([
  {
    id: 1,
    title: '系统升级公告',
    date: '2024-01-15',
    type: 'important'
  },
  {
    id: 2,
    title: '新功能发布通知',
    date: '2024-01-12',
    type: 'normal'
  },
  {
    id: 3,
    title: '维护计划通知',
    date: '2024-01-10',
    type: 'normal'
  }
])

// 方法
const handleRefresh = () => {
  console.log('刷新数据')
}

const handleExport = () => {
  console.log('导出报表')
}

const handleActionClick = (action: any) => {
  console.log('快速操作:', action.label)
}

onMounted(() => {
  console.log('工作台页面已加载')
})
</script>

<template>
  <div class="dashboard-container">
    <!-- 工作台头部 -->
    <div class="dashboard-header">
      <div class="header-info">
        <h1 class="page-title">工作台</h1>
        <p class="page-subtitle">欢迎回来，这里是您的工作概览</p>
      </div>
      <div class="header-actions">
        <a-space>
          <a-button type="primary" @click="handleRefresh">
            <template #icon><ReloadOutlined /></template>
            刷新数据
          </a-button>
          <a-button @click="handleExport">
            <template #icon><DownloadOutlined /></template>
            导出报表
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 数据统计卡片 -->
    <a-row :gutter="[24, 24]" class="stats-row">
      <a-col :xs="24" :sm="12" :lg="6" v-for="stat in statistics" :key="stat.id">
        <a-card class="stat-card" :bordered="false">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: stat.color }">
              <component :is="stat.icon" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-trend" :class="stat.trend">
                <component :is="stat.trendIcon" />
                {{ stat.trendText }}
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 主要内容区域 -->
    <a-row :gutter="[24, 24]" class="content-row">
      <!-- 左侧内容 -->
      <a-col :xs="24" :lg="16">
        <!-- 数据图表 -->
        <a-card title="数据趋势" class="chart-card" :bordered="false">
          <template #extra>
            <a-radio-group v-model:value="chartPeriod" size="small">
              <a-radio-button value="week">本周</a-radio-button>
              <a-radio-button value="month">本月</a-radio-button>
              <a-radio-button value="year">本年</a-radio-button>
            </a-radio-group>
          </template>
          <div class="chart-placeholder">
            <BarChartOutlined style="font-size: 48px; color: #d9d9d9;" />
            <p style="color: #999; margin-top: 16px;">图表数据加载中...</p>
          </div>
        </a-card>

        <!-- 最近活动 -->
        <a-card title="最近活动" class="activity-card" :bordered="false" style="margin-top: 24px;">
          <template #extra>
            <a href="#" style="color: #1890ff;">查看全部</a>
          </template>
          <a-list :data-source="recentActivities" size="small">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #avatar>
                    <a-avatar :style="{ backgroundColor: item.color }">
                      <component :is="item.icon" />
                    </a-avatar>
                  </template>
                  <template #title>{{ item.title }}</template>
                  <template #description>{{ item.description }}</template>
                </a-list-item-meta>
                <div class="activity-time">{{ item.time }}</div>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>

      <!-- 右侧内容 -->
      <a-col :xs="24" :lg="8">
        <!-- 快速操作 -->
        <a-card title="快速操作" class="quick-actions-card" :bordered="false">
          <div class="quick-actions-grid">
            <div
              class="quick-action-item"
              v-for="action in quickActions"
              :key="action.id"
              @click="handleActionClick(action)"
            >
              <div class="action-icon" :style="{ backgroundColor: action.color }">
                <component :is="action.icon" />
              </div>
              <span class="action-label">{{ action.label }}</span>
            </div>
          </div>
        </a-card>

        <!-- 系统信息 -->
        <a-card title="系统信息" class="system-info-card" :bordered="false" style="margin-top: 24px;">
          <div class="system-info-list">
            <div class="info-item" v-for="info in systemInfo" :key="info.label">
              <span class="info-label">{{ info.label }}</span>
              <span class="info-value">{{ info.value }}</span>
            </div>
          </div>
        </a-card>

        <!-- 通知公告 -->
        <a-card title="通知公告" class="notice-card" :bordered="false" style="margin-top: 24px;">
          <template #extra>
            <a href="#" style="color: #1890ff;">更多</a>
          </template>
          <a-list :data-source="notices" size="small">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <a href="#" style="color: #262626;">{{ item.title }}</a>
                  </template>
                  <template #description>{{ item.date }}</template>
                </a-list-item-meta>
                <a-tag :color="item.type === 'important' ? 'red' : 'blue'" size="small">
                  {{ item.type === 'important' ? '重要' : '通知' }}
                </a-tag>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<style scoped>
/* 后台管理系统工作台样式 */
.dashboard-container {
  padding: 24px;
}

/* 工作台头部 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.header-info {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0;
}

.header-actions {
  flex-shrink: 0;
}

/* 统计卡片行 */
.stats-row {
  margin-bottom: 24px;
}

/* 统计卡片 */
.stat-card {
  border-radius: 6px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  transition: all 0.3s;
}

.stat-card:hover {
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #8c8c8c;
  margin-top: 4px;
}

.stat-trend {
  font-size: 12px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-trend.up {
  color: #52c41a;
}

.stat-trend.down {
  color: #ff4d4f;
}

/* 内容行 */
.content-row {
  margin-bottom: 24px;
}

/* 图表卡片 */
.chart-card {
  border-radius: 6px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.chart-placeholder {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border-radius: 4px;
}

/* 活动卡片 */
.activity-card {
  border-radius: 6px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.activity-time {
  font-size: 12px;
  color: #8c8c8c;
}

/* 快速操作卡片 */
.quick-actions-card {
  border-radius: 6px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.quick-action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
  cursor: pointer;
  transition: all 0.3s;
}

.quick-action-item:hover {
  background: #f0f7ff;
  border-color: #1890ff;
}

.action-icon {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
}

.action-label {
  font-size: 12px;
  color: #262626;
  text-align: center;
}

/* 系统信息卡片 */
.system-info-card {
  border-radius: 6px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.system-info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  color: #8c8c8c;
}

.info-value {
  font-size: 14px;
  color: #262626;
  font-weight: 500;
}

/* 通知公告卡片 */
.notice-card {
  border-radius: 6px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .dashboard-container {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .header-actions {
    align-self: stretch;
  }

  .quick-actions-grid {
    grid-template-columns: 1fr;
  }

  .content-row {
    flex-direction: column-reverse;
  }
}

/* 卡片通用样式 */
:deep(.ant-card) {
  border-radius: 6px;
}

:deep(.ant-card-head) {
  border-bottom: 1px solid #e8e8e8;
}

:deep(.ant-card-head-title) {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

:deep(.ant-list-item) {
  padding: 12px 0;
}

:deep(.ant-list-item-meta-title) {
  font-size: 14px;
  color: #262626;
}

:deep(.ant-list-item-meta-description) {
  font-size: 12px;
  color: #8c8c8c;
}

/* 平滑过渡 */
* {
  transition: all 0.3s ease;
}
</style>
