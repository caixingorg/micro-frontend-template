<template>
  <div>
    <h1>Vue 3 Micro App</h1>
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/page1">Page 1</router-link> |
      <router-link to="/page2">Page 2</router-link>
      <router-link to="/jumpTest">jumpTest</router-link>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>