<template>
  <div class="features">
    <a-card title="Vue3 微应用功能特性" style="margin-bottom: 24px;">
      <p>这是一个基于 Vue3 + Vite + TypeScript + Ant Design Vue + Pinia 构建的微前端应用示例。</p>
    </a-card>

    <a-row :gutter="[16, 16]">
      <a-col :span="8" v-for="feature in features" :key="feature.title">
        <a-card :title="feature.title" hoverable>
          <template #extra>
            <component :is="feature.icon" style="color: #1890ff;" />
          </template>
          <p>{{ feature.description }}</p>
          <a-tag :color="feature.color">{{ feature.tag }}</a-tag>
        </a-card>
      </a-col>
    </a-row>

    <a-card title="计数器示例" style="margin-top: 24px;">
      <div style="text-align: center;">
        <h3>{{ counter }}</h3>
        <a-space>
          <a-button @click="decrement" type="primary" danger>
            <template #icon><MinusOutlined /></template>
            减少
          </a-button>
          <a-button @click="increment" type="primary">
            <template #icon><PlusOutlined /></template>
            增加
          </a-button>
          <a-button @click="reset">
            <template #icon><ReloadOutlined /></template>
            重置
          </a-button>
        </a-space>
      </div>
    </a-card>

    <a-card title="快速导航" style="margin-top: 24px;">
      <a-space>
        <a-button @click="$router.push('/')">
          <template #icon><HomeOutlined /></template>
          首页
        </a-button>
        <a-button @click="$router.push('/about')">
          <template #icon><InfoCircleOutlined /></template>
          关于
        </a-button>
      </a-space>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCounterStore } from '@/stores/counter'
import {
  RocketOutlined,
  CodeOutlined,
  LayoutOutlined,
  DatabaseOutlined,
  ApiOutlined,
  BuildOutlined,
  MinusOutlined,
  PlusOutlined,
  ReloadOutlined,
  HomeOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons-vue'

const counterStore = useCounterStore()
const counter = ref(0)

const features = [
  {
    title: '微前端架构',
    description: '基于 qiankun 框架，支持独立开发、部署和运行',
    icon: RocketOutlined,
    color: 'blue',
    tag: 'qiankun',
  },
  {
    title: 'Vue3 + Vite',
    description: '最新的 Vue3 框架配合 Vite 构建工具，开发体验极佳',
    icon: CodeOutlined,
    color: 'green',
    tag: 'Vue3',
  },
  {
    title: 'TypeScript',
    description: '完整的 TypeScript 类型支持，提供更好的开发体验',
    icon: LayoutOutlined,
    color: 'purple',
    tag: 'TypeScript',
  },
  {
    title: 'Ant Design Vue',
    description: '企业级 UI 设计语言和组件库',
    icon: DatabaseOutlined,
    color: 'orange',
    tag: 'Antd',
  },
  {
    title: 'Pinia 状态管理',
    description: 'Vue3 官方推荐的状态管理库，简单易用',
    icon: ApiOutlined,
    color: 'red',
    tag: 'Pinia',
  },
  {
    title: 'Vite 构建',
    description: '极速的构建工具，支持热更新和模块联邦',
    icon: BuildOutlined,
    color: 'cyan',
    tag: 'Vite',
  },
]

const increment = () => {
  counter.value++
  counterStore.increment()
}

const decrement = () => {
  counter.value--
  counterStore.decrement()
}

const reset = () => {
  counter.value = 0
  counterStore.reset()
}
</script>

<style scoped>
.features {
  padding: 20px;
}

.ant-card {
  border-radius: 8px;
}

.ant-tag {
  margin-top: 8px;
}
</style>
