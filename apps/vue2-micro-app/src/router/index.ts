import Vue from 'vue';
import VueRouter from 'vue-router';

import Home from '@/pages/Home.vue';
import About from '@/pages/About.vue';
import Settings from '@/pages/Settings.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页',
    },
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: {
      title: '关于',
    },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: {
      title: '设置',
    },
  },
];

export function createRouter(base?: string) {
  const router = new VueRouter({
    mode: 'history',
    base: base || '/',
    routes,
  });

  router.beforeEach((to, from, next) => {
    // 设置页面标题
    if (to.meta && to.meta.title) {
      document.title = `${to.meta.title} - Vue2微应用`;
    }
    next();
  });

  return router;
}
