import { ENV } from './env';

export interface MicroAppConfig {
  name: string;
  entry: string;
  container: string;
  activeRule: string;
  props?: Record<string, any>;
}

const env = ENV[process.env.NODE_ENV as keyof typeof ENV || 'development'];

export const microApps: MicroAppConfig[] = [
  {
    name: 'react-micro-app',
    entry: env.REACT_MICRO_APP,
    container: '#micro-app-container',
    activeRule: '/react-app',
    props: {
      routerBase: '/react-app',
    },
  },
  {
    name: 'vue3-micro-app',
    entry: env.VUE3_MICRO_APP,
    container: '#micro-app-container',
    activeRule: '/vue3-app',
    props: {
      routerBase: '/vue3-app',
    },
  },
  {
    name: 'vue2-micro-app',
    entry: env.VUE2_MICRO_APP,
    container: '#micro-app-container',
    activeRule: '/vue2-app',
    props: {
      routerBase: '/vue2-app',
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
  {
    path: '/vue2-app/*',
    name: 'Vue2应用',
    microApp: 'vue2-micro-app',
    meta: {
      title: 'Vue2微应用',
      icon: 'vue',
    },
  },
];
