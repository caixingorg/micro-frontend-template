<template>
  <div>
    <a-card title="关于 Vue2 微应用">
      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="应用名称">
          {{ appTitle }}
        </a-descriptions-item>
        <a-descriptions-item label="版本">
          {{ appVersion }}
        </a-descriptions-item>
        <a-descriptions-item label="框架">
          Vue 2.7 + TypeScript
        </a-descriptions-item>
        <a-descriptions-item label="UI 组件库">
          Ant Design Vue 1.7.8
        </a-descriptions-item>
        <a-descriptions-item label="状态管理">
          Vuex 3.6.2
        </a-descriptions-item>
        <a-descriptions-item label="路由">
          Vue Router 3.6.5
        </a-descriptions-item>
        <a-descriptions-item label="构建工具">
          Webpack 5
        </a-descriptions-item>
        <a-descriptions-item label="微前端框架">
          qiankun
        </a-descriptions-item>
      </a-descriptions>
    </a-card>

    <a-card title="功能特性" style="margin-top: 24px;">
      <a-list
        :dataSource="features"
        renderItem="item"
      >
        <template slot="renderItem" slot-scope="item">
          <a-list-item>
            <a-list-item-meta>
              <template slot="avatar">
                <a-icon :type="item.icon" style="color: #1890ff;" />
              </template>
              <template slot="title">
                {{ item.title }}
              </template>
              <template slot="description">
                {{ item.description }}
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
    </a-card>

    <a-card title="开发信息" style="margin-top: 24px;">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-statistic title="当前主题" value="light" />
        </a-col>
        <a-col :span="12">
          <a-statistic title="运行状态" value="正常" />
        </a-col>
      </a-row>
    </a-card>

    <div style="margin-top: 24px; text-align: center;">
      <a-button @click="$router.go(-1)" icon="arrow-left">返回</a-button>
      <a-button @click="$router.push('/')" icon="home" style="margin-left: 8px;">首页</a-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'About',
  data() {
    return {
      appTitle: 'Vue2 微应用',
      appVersion: '1.0.0',
      features: [
        {
          icon: 'rocket',
          title: '微前端架构',
          description: '基于 qiankun 框架，支持独立开发、部署和运行',
        },
        {
          icon: 'code',
          title: 'TypeScript 支持',
          description: '完整的 TypeScript 类型支持，提供更好的开发体验',
        },
        {
          icon: 'layout',
          title: 'Ant Design Vue',
          description: '企业级 UI 设计语言和组件库',
        },
        {
          icon: 'database',
          title: 'Vuex 状态管理',
          description: '集中式状态管理，支持模块化和插件',
        },
        {
          icon: 'api',
          title: '路由管理',
          description: 'Vue Router 支持，包含路由守卫和动态路由',
        },
        {
          icon: 'build',
          title: 'Webpack 构建',
          description: '现代化构建工具，支持热更新和代码分割',
        },
      ],
    };
  },
};
</script>

<style scoped>
.ant-statistic {
  text-align: center;
}
</style>
