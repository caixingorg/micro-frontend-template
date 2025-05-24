import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      vue(),
      qiankun('vue3-micro-app', {
        useDevMode: true
      })
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@shared': resolve(__dirname, '../../packages')
      }
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          // Ant Design 定制主题变量
          modifyVars: {
            'primary-color': '#667eea',
            'border-radius-base': '8px'
          }
        }
      }
    },
    server: {
      port: 8083,
      cors: true,
      origin: 'http://localhost:8083',
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    },
    build: {
      target: 'es2015',
      sourcemap: true,
      cssCodeSplit: false, // 禁用 CSS 代码分割以避免样式加载问题
      rollupOptions: {
        output: {
          manualChunks: {
            'ant-design-vue': ['ant-design-vue'],
            vue: ['vue', 'vue-router', 'pinia']
          }
        }
      }
    },
    optimizeDeps: {
      include: ['ant-design-vue', '@ant-design/icons-vue']
    }
  };
});
