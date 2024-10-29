<!-- src/components/JumpTest.vue -->
<template>
    <div>
      <h1>Vue3 应用跳转测试页面</h1>
      <p>
        <button @click="jumpToMain">跳转到主应用</button>
        <button @click="jumpToReact">跳转到 React 应用</button>
      </p>
    </div>
  </template>
  
  <script>
//   import { Space, Button } from 'ant-design-vue';
  
  export default {
    components: {
    //   AButton: Button,
    //   Space,
    },
    inject: ['navigateToUrl'], // 注入从主应用传递的函数
    methods: {
      jumpToMain() {
        window.history.pushState({}, '', '/jump');
      },
      jumpToReact() {
        window.history.pushState({}, '', '/react-app/jumpTest');
      }
    }
  }
  </script>