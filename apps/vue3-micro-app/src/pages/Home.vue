<template>
  <div>
    <a-card style="margin-bottom: 24px">
      <div style="text-align: center">
        <a-typography-title :level="2">
          欢迎使用 Vue3 微应用
        </a-typography-title>
        <a-typography-paragraph>
          这是一个基于 Vue3 + TypeScript + Ant Design Vue + Pinia 构建的微前端应用示例。
          它展示了如何在 qiankun 框架中集成 Vue3 应用。
        </a-typography-paragraph>
      </div>
      
      <a-row :gutter="[16, 16]">
        <a-col :span="6" v-for="(feature, index) in features" :key="index">
          <a-card
            hoverable
            style="text-align: center; height: 200px"
            :body-style="{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              height: '100%'
            }"
            @click="navigateTo(feature.path)"
          >
            <a-space direction="vertical" size="middle">
              <component :is="feature.icon" style="font-size: 24px" :style="{ color: feature.color }" />
              <a-typography-title :level="4" style="margin: 0">
                {{ feature.title }}
              </a-typography-title>
              <a-typography-paragraph style="margin: 0; color: #666">
                {{ feature.description }}
              </a-typography-paragraph>
            </a-space>
          </a-card>
        </a-col>
      </a-row>
    </a-card>

    <a-row :gutter="16">
      <a-col :span="12">
        <a-card title="技术栈">
          <a-space direction="vertical" style="width: 100%">
            <div>✅ Vue 3</div>
            <div>✅ TypeScript</div>
            <div>✅ Ant Design Vue</div>
            <div>✅ Vue Router</div>
            <div>✅ Pinia</div>
            <div>✅ Vite</div>
          </a-space>
        </a-card>
      </a-col>
      
      <a-col :span="12">
        <a-card title="特性">
          <a-space direction="vertical" style="width: 100%">
            <div>🚀 快速开发</div>
            <div>📦 组合式API</div>
            <div>🎨 响应式设计</div>
            <div>🔒 类型安全</div>
            <div>⚡ 极速构建</div>
            <div>🔥 热更新</div>
          </a-space>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import {
  ShoppingOutlined,
  OrderedListOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons-vue';

const router = useRouter();

const features = [
  {
    title: '产品管理',
    description: '管理产品信息和库存',
    icon: ShoppingOutlined,
    color: '#1890ff',
    path: '/products',
  },
  {
    title: '订单管理',
    description: '处理订单和发货',
    icon: OrderedListOutlined,
    color: '#52c41a',
    path: '/orders',
  },
  {
    title: '数据分析',
    description: '分析销售数据',
    icon: BarChartOutlined,
    color: '#faad14',
    path: '/analytics',
  },
  {
    title: '系统设置',
    description: '配置应用参数',
    icon: SettingOutlined,
    color: '#f5222d',
    path: '/settings',
  },
];

const navigateTo = (path: string) => {
  router.push(path);
};
</script>
