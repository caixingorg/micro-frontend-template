<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { ConfigProvider } from 'ant-design-vue'
import {
  HomeOutlined,
  InfoCircleOutlined,
  AppstoreOutlined,
  BellOutlined,
  UserOutlined,
  DownOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons-vue'

const router = useRouter()

// 获取面包屑标题
const getBreadcrumbTitle = () => {
  const routeName = router.currentRoute.value.name as string
  const titleMap: Record<string, string> = {
    'about': '系统信息',
    'features': '功能模块'
  }
  return titleMap[routeName] || '未知页面'
}

// Ant Design Vue 配置
const antdConfig = {
  prefixCls: 'vue3-micro-antd',
  theme: {
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 6,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }
  }
}
</script>

<template>
  <div id="vue3-app" class="vue3-micro-app">
    <!-- 使用ConfigProvider为Ant Design组件添加前缀，避免样式冲突 -->
    <ConfigProvider :prefix-cls="antdConfig.prefixCls" :theme="antdConfig.theme">
      <!-- 简化的子应用布局，避免与主应用冲突 -->
      <div class="micro-app-container">
        <!-- 子应用头部 -->
        <div class="micro-app-header">
          <div class="app-info">
            <div class="app-logo">
              <AppstoreOutlined style="font-size: 20px; color: #1890ff;" />
            </div>
            <span class="app-title">Vue3 微应用</span>
          </div>

          <a-menu
            mode="horizontal"
            :selected-keys="[router.currentRoute.value.name as string]"
            class="micro-app-menu"
          >
            <a-menu-item key="home" @click="router.push('/')">
              <template #icon><HomeOutlined /></template>
              工作台
            </a-menu-item>
            <a-menu-item key="about" @click="router.push('/about')">
              <template #icon><InfoCircleOutlined /></template>
              系统信息
            </a-menu-item>
            <a-menu-item key="features" @click="router.push('/features')">
              <template #icon><AppstoreOutlined /></template>
              功能模块
            </a-menu-item>
          </a-menu>
        </div>

        <!-- 面包屑导航 -->
        <div class="micro-app-breadcrumb">
          <a-breadcrumb>
            <a-breadcrumb-item>
              <HomeOutlined />
              Vue3应用
            </a-breadcrumb-item>
            <a-breadcrumb-item v-if="router.currentRoute.value.name !== 'home'">
              {{ getBreadcrumbTitle() }}
            </a-breadcrumb-item>
          </a-breadcrumb>
        </div>

        <!-- 页面内容 -->
        <div class="micro-app-content">
          <RouterView />
        </div>
      </div>
    </ConfigProvider>
  </div>
</template>

<style scoped>
/* Vue3 微应用样式 - 避免与主应用冲突 */
.vue3-micro-app {
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  /* 重置可能冲突的样式 */
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.micro-app-container {
  width: 100%;
  height: 100%;
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 子应用头部 */
.micro-app-header {
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
}

.app-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-title {
  font-size: 16px;
  font-weight: 600;
  color: #1890ff;
  margin: 0;
}

.micro-app-menu {
  background: transparent;
  border-bottom: none;
  line-height: 60px;
  flex: 1;
  margin-left: 20px;
}

.micro-app-menu :deep(.ant-menu-item) {
  margin: 0 2px;
  padding: 0 16px;
  border-radius: 4px;
  transition: all 0.3s;
}

.micro-app-menu :deep(.ant-menu-item:hover) {
  background: #f0f7ff;
  color: #1890ff;
}

.micro-app-menu :deep(.ant-menu-item-selected) {
  background: #e6f7ff;
  color: #1890ff;
  font-weight: 500;
}

/* 面包屑导航 */
.micro-app-breadcrumb {
  padding: 12px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e8e8e8;
}

/* 内容区域 */
.micro-app-content {
  padding: 20px;
  background: #fff;
  min-height: 400px;
  overflow: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .micro-app-header {
    flex-direction: column;
    padding: 8px 16px;
    min-height: auto;
  }

  .micro-app-menu {
    margin-left: 0;
    margin-top: 8px;
  }

  .micro-app-content {
    padding: 16px;
  }
}

/* 平滑过渡动画 */
.vue3-micro-app * {
  transition: all 0.3s ease;
}
</style>
