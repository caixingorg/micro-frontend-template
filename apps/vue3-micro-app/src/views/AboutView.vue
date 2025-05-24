<template>
  <div class="about-container">
    <!-- 应用信息卡片 -->
    <a-card class="info-card" :bordered="false">
      <template #title>
        <div class="card-title">
          <InfoCircleOutlined />
          关于 Vue3 微应用
        </div>
      </template>
      <a-descriptions :column="{ xs: 1, sm: 2, lg: 3 }" bordered size="large">
        <a-descriptions-item label="应用名称">
          <a-tag color="blue" class="info-tag">Vue3 微应用</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="版本">
          <a-tag color="green" class="info-tag">1.0.0</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="框架">
          <a-tag color="purple" class="info-tag">Vue 3.5 + Vite</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="UI 组件库">
          <a-tag color="cyan" class="info-tag">Ant Design Vue 4.x</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="状态管理">
          <a-tag color="orange" class="info-tag">Pinia</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="路由">
          <a-tag color="red" class="info-tag">Vue Router 4.x</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="构建工具">
          <a-tag color="volcano" class="info-tag">Vite 6.x</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="微前端框架">
          <a-tag color="magenta" class="info-tag">qiankun</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="开发语言">
          <a-tag color="geekblue" class="info-tag">TypeScript</a-tag>
        </a-descriptions-item>
      </a-descriptions>
    </a-card>

    <!-- 技术特性 -->
    <a-card class="features-card" :bordered="false">
      <template #title>
        <div class="card-title">
          <BuildOutlined />
          技术特性
        </div>
      </template>
      <a-row :gutter="[24, 24]">
        <a-col :xs="24" :md="12" v-for="feature in features" :key="feature.title">
          <div class="feature-item">
            <div class="feature-icon" :style="{ background: `linear-gradient(135deg, ${feature.color}, ${feature.color}dd)` }">
              <component :is="feature.icon" />
            </div>
            <div class="feature-content">
              <h3 class="feature-title">{{ feature.title }}</h3>
              <p class="feature-description">{{ feature.description }}</p>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- 环境信息 -->
    <a-card class="env-card" :bordered="false">
      <template #title>
        <div class="card-title">
          <ApiOutlined />
          开发环境信息
        </div>
      </template>
      <a-row :gutter="[32, 32]">
        <a-col :xs="24" :sm="8">
          <div class="stat-item">
            <a-statistic
              title="Node.js 版本"
              :value="nodeVersion"
              :value-style="{ color: '#52c41a', fontSize: '24px', fontWeight: 'bold' }"
            />
          </div>
        </a-col>
        <a-col :xs="24" :sm="8">
          <div class="stat-item">
            <a-statistic
              title="浏览器"
              :value="browserInfo"
              :value-style="{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }"
            />
          </div>
        </a-col>
        <a-col :xs="24" :sm="8">
          <div class="stat-item">
            <a-statistic
              title="运行模式"
              value="开发模式"
              :value-style="{ color: '#fa8c16', fontSize: '24px', fontWeight: 'bold' }"
            />
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- 操作按钮 -->
    <div class="action-section">
      <a-space size="large">
        <a-button @click="$router.go(-1)" size="large" shape="round">
          <template #icon><ArrowLeftOutlined /></template>
          返回上页
        </a-button>
        <a-button @click="$router.push('/')" type="primary" size="large" shape="round">
          <template #icon><HomeOutlined /></template>
          返回首页
        </a-button>
        <a-button @click="$router.push('/features')" size="large" shape="round">
          <template #icon><AppstoreOutlined /></template>
          功能特性
        </a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  RocketOutlined,
  CodeOutlined,
  LayoutOutlined,
  DatabaseOutlined,
  ApiOutlined,
  BuildOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
} from '@ant-design/icons-vue'

const features = [
  {
    icon: RocketOutlined,
    title: '微前端架构',
    description: '基于 qiankun 框架，支持独立开发、部署和运行',
    color: '#1890ff',
  },
  {
    icon: CodeOutlined,
    title: 'Vue3 + Composition API',
    description: '使用最新的 Vue3 框架和 Composition API，提供更好的开发体验',
    color: '#4fc08d',
  },
  {
    icon: LayoutOutlined,
    title: 'TypeScript 支持',
    description: '完整的 TypeScript 类型支持，提供更好的开发体验和代码质量',
    color: '#3178c6',
  },
  {
    icon: DatabaseOutlined,
    title: 'Pinia 状态管理',
    description: 'Vue3 官方推荐的状态管理库，简单易用',
    color: '#ffd93d',
  },
  {
    icon: ApiOutlined,
    title: 'Vue Router 4',
    description: '最新的 Vue Router，支持 Composition API 和更好的 TypeScript 支持',
    color: '#52c41a',
  },
  {
    icon: BuildOutlined,
    title: 'Vite 构建',
    description: '极速的构建工具，支持热更新和模块联邦',
    color: '#646cff',
  },
]

const nodeVersion = computed(() => {
  return  'Unknown'
})

const browserInfo = computed(() => {
  const userAgent = navigator.userAgent
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Edge')) return 'Edge'
  return 'Unknown'
})
</script>

<style scoped>
/* 主容器 */
.about-container {
  max-width: 100%;
  margin: 0 auto;
}

/* 卡片通用样式 */
.info-card,
.features-card,
.env-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 32px;
  transition: all 0.3s ease;
}

.info-card:hover,
.features-card:hover,
.env-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

/* 卡片标题 */
.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.card-title .anticon {
  font-size: 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 信息标签 */
.info-tag {
  font-weight: 600;
  font-size: 14px;
  padding: 4px 12px;
  border-radius: 8px;
}

/* 特性项目 */
.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.feature-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.8);
}

.feature-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.feature-content {
  flex: 1;
}

.feature-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.feature-description {
  margin: 0;
  color: #5a5a5a;
  line-height: 1.6;
  font-size: 14px;
}

/* 统计项目 */
.stat-item {
  text-align: center;
  padding: 24px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.8);
}

/* 操作区域 */
.action-section {
  text-align: center;
  padding: 32px 0;
}

.action-section .ant-btn {
  min-width: 120px;
  height: 48px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.action-section .ant-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-title {
    font-size: 18px;
  }

  .feature-item {
    flex-direction: column;
    text-align: center;
  }

  .feature-icon {
    align-self: center;
  }

  .action-section .ant-space {
    flex-direction: column;
    width: 100%;
  }

  .action-section .ant-btn {
    width: 100%;
    margin-bottom: 12px;
  }
}

/* 全局样式覆盖 */
:deep(.ant-descriptions-item-label) {
  font-weight: 600;
  color: #2c3e50;
  background: rgba(250, 250, 250, 0.8);
}

:deep(.ant-descriptions-item-content) {
  background: rgba(255, 255, 255, 0.8);
}

:deep(.ant-statistic-title) {
  color: #8c8c8c;
  font-weight: 500;
  margin-bottom: 8px;
}

:deep(.ant-card-head-title) {
  padding: 0;
}
</style>
