import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

import Home from '@/pages/Home.vue';
import Products from '@/pages/Products.vue';
import Orders from '@/pages/Orders.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/products',
    name: 'Products',
    component: Products,
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders,
  },
];

export function createAppRouter(base = '/vue3-app') {
  return createRouter({
    history: createWebHistory(base),
    routes,
  });
}
