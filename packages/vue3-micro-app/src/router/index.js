import { createRouter, createWebHistory } from 'vue-router'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

const basename = qiankunWindow.__POWERED_BY_QIANKUN__ ? '/vue3-micro-app' : '/'
const routes = [
    {
      path: '/',
      name: 'Home',
      component: () => import('../components/Home.vue')
    },
    {
      path: '/page1',
      name: 'Page1',
      component: () => import('../components/Page1.vue')
    },
    {
      path: '/page2',
      name: 'Page2',
      component: () => import('../components/Page2.vue')
    },
    {
        path: '/jumpTest',
        name: 'JumpTest',
        component: () => import('../components/JumpTest.vue')
      }
  ]

const router = createRouter({
  history: createWebHistory(basename),
  routes
})

export default router