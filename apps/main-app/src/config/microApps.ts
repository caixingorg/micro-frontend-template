import type { MicroAppConfig } from '@enterprise/shared-types';

export const microApps: MicroAppConfig[] = [
  {
    name: 'react-micro-app',
    entry: process.env.NODE_ENV === 'development' 
      ? '//localhost:3001' 
      : '/react-micro-app',
    container: '#react-micro-app-container',
    activeRule: '/react-app',
    props: {
      routerBase: '/react-app',
    },
  },
  {
    name: 'vue3-micro-app',
    entry: process.env.NODE_ENV === 'development' 
      ? '//localhost:3002' 
      : '/vue3-micro-app',
    container: '#vue3-micro-app-container',
    activeRule: '/vue3-app',
    props: {
      routerBase: '/vue3-app',
    },
  },
];

export const microAppRoutes = [
  {
    path: '/react-app/*',
    name: 'React应用',
    microApp: 'react-micro-app',
    meta: {
      title: 'React微应用',
      icon: 'react',
    },
  },
  {
    path: '/vue3-app/*',
    name: 'Vue3应用',
    microApp: 'vue3-micro-app',
    meta: {
      title: 'Vue3微应用',
      icon: 'vue',
    },
  },
];
