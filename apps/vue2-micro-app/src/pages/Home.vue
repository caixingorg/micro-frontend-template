<template>
  <div>
    <a-card style="margin-bottom: 24px;">
      <div style="text-align: center;">
        <h2>欢迎使用 Vue2 微应用</h2>
        <p>
          这是一个基于 Vue2 + TypeScript + Ant Design Vue + Vuex 构建的微前端应用示例。
          它展示了如何在 qiankun 框架中集成 Vue2 应用。
        </p>
      </div>
    </a-card>

    <a-row :gutter="[16, 16]">
      <a-col :span="8">
        <a-card title="技术栈" hoverable>
          <a-tag color="green">Vue 2.7</a-tag>
          <a-tag color="blue">TypeScript</a-tag>
          <a-tag color="orange">Webpack</a-tag>
          <a-tag color="purple">Ant Design Vue</a-tag>
          <a-tag color="red">Vuex</a-tag>
        </a-card>
      </a-col>

      <a-col :span="8">
        <a-card title="计数器示例" hoverable>
          <div style="text-align: center;">
            <h3>{{ counter }}</h3>
            <a-button-group>
              <a-button @click="decrement" icon="minus">减少</a-button>
              <a-button @click="increment" icon="plus" type="primary">增加</a-button>
            </a-button-group>
          </div>
        </a-card>
      </a-col>

      <a-col :span="8">
        <a-card title="应用信息" hoverable>
          <p><strong>应用名称:</strong> Vue2 微应用</p>
          <p><strong>版本:</strong> 1.0.0</p>
          <p><strong>状态:</strong> 运行中</p>
        </a-card>
      </a-col>
    </a-row>

    <a-card title="快速导航" style="margin-top: 24px;">
      <a-space>
        <a-button @click="goToAbout" icon="info-circle">关于页面</a-button>
        <a-button @click="goToSettings" icon="setting">设置页面</a-button>
        <a-button @click="resetCounter" icon="reload">重置计数器</a-button>
      </a-space>
    </a-card>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      counter: 0,
    };
  },
  methods: {
    increment() {
      this.counter++;
    },
    decrement() {
      this.counter--;
    },
    resetCounter() {
      this.counter = 0;
    },
    goToAbout() {
      this.$router.push('/about');
    },
    goToSettings() {
      this.$router.push('/settings');
    },
  },
};
</script>

<style scoped>
.ant-card {
  border-radius: 8px;
}

.ant-tag {
  margin-bottom: 8px;
}
</style>
