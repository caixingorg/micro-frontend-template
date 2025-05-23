import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

const packageName = require('./package.json').name;

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, '../../packages'),
    },
  },
  define: {
    __VUE_PROD_DEVTOOLS__: false,
  },
  server: {
    port: 3002,
    cors: true,
    origin: 'http://localhost:3002',
  },
  build: {
    lib: {
      entry: './src/main.ts',
      name: packageName,
      formats: ['umd'],
      fileName: () => `${packageName}.js`,
    },
    rollupOptions: {
      external: ['vue', 'vue-router', 'pinia'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          pinia: 'Pinia',
        },
      },
    },
  },
});
