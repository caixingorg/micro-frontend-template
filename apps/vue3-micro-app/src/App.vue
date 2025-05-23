<template>
  <a-config-provider :locale="zhCN">
    <div class="vue3-micro-app">
      <router-view />
    </div>
  </a-config-provider>
</template>

<script setup lang="ts">
import { ConfigProvider as AConfigProvider } from 'ant-design-vue';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
</script>

<style scoped>
.vue3-micro-app {
  padding: 20px;
  min-height: 100vh;
}
</style>
