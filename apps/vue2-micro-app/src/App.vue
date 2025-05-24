<template>
  <div id="vue2-app">
    <div style="padding: 20px;">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'App',
  mounted() {
    console.log('Vue2 App mounted');
  },
});
</script>

<style>
#vue2-app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100%;
}

* {
  box-sizing: border-box;
}
</style>
