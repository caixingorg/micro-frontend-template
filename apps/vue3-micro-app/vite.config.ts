import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import qiankun from 'vite-plugin-qiankun'

const packageName = 'vue3-micro-app'

// 参考官方文档: https://github.com/tengmaoqing/vite-plugin-qiankun
// useDevMode 开启时与热更新插件冲突,使用变量切换
const useDevMode = true

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      vue(),
      // 官方推荐: useDevMode开启时与热更新插件冲突，需要条件性加载
      ...(useDevMode ? [] : [vueDevTools()]),
      // 这里的 'vue3-micro-app' 是子应用名，主应用注册时AppName需保持一致
      qiankun(packageName, {
        useDevMode
      }),
    ],
    // 官方推荐: 生产环境需要指定运行域名作为base
    base: mode === 'production' ? 'http://localhost:3003/' : '/',
    // vite-plugin-qiankun会自动处理开发环境配置
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@shared': fileURLToPath(new URL('../../packages', import.meta.url))
      },
    },
    server: {
      port: 3003,
      host: '0.0.0.0',
      cors: {
        origin: '*',
        credentials: false,
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
        'Access-Control-Allow-Credentials': 'false',
      },
    },
    // vite-plugin-qiankun会自动处理build配置和UMD格式
    define: {
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    }
  }
})
