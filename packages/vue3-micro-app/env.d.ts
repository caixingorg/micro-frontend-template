/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface Window {
  __POWERED_BY_QIANKUN__?: boolean;
  __INJECTED_PUBLIC_PATH_BY_QIANKUN__?: string;
}

declare module 'virtual:*' {
  const result: any;
  export default result;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}
