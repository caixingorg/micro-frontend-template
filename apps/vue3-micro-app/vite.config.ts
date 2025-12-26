import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import qiankun from 'vite-plugin-qiankun'

const packageName = 'vue3-micro-app'

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd())
  const useDevMode = mode === 'development'

  return {
    base: env.VITE_PUBLIC_PATH, // 动态使用环境变量
    plugins: [
      vue(),
      ...(useDevMode ? [] : [vueDevTools()]),
      qiankun(packageName, {
        useDevMode
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@shared': fileURLToPath(new URL('../../packages', import.meta.url))
      },
    },
    server: {
      port: Number(env.VITE_PORT) || 3003,
      host: '0.0.0.0',
      origin: env.VITE_PUBLIC_PATH, // 确保资源请求不跨域
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['X-Requested-With', 'content-type', 'Authorization'],
        credentials: true
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    build: {
      target: 'esnext',
      minify: false,
      cssCodeSplit: false,
    },
    define: {
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    }
  }
})
