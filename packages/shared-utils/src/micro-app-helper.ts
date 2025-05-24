import type { MicroAppProps } from '@/shared-types/micro-app';

export function getMountContainer(props: MicroAppProps): HTMLElement {
  return props.container
    ? props.container.querySelector('#root') || props.container
    : document.getElementById('root') || document.body;
}

export function getPublicPath(): string {
  if (window.__POWERED_BY_QIANKUN__) {
    return window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
  }
  return '/';
}

export function isMicroApp(): boolean {
  return !!window.__POWERED_BY_QIANKUN__;
}

export function handleMicroAppError(appName: string, error: Error, info?: string): void {
  console.error(`[${appName} Error]`, error, info);
  window.dispatchEvent(
    new CustomEvent('micro-app-error', {
      detail: {
        appName,
        error,
        info,
      },
    })
  );
}

// React专用的工具函数
export function wrapReactLifecycle(options: {
  root: any;
  render: (container: HTMLElement, props?: MicroAppProps) => void;
  appName: string;
}) {
  const { root, render, appName } = options;

  return {
    async bootstrap() {
      console.log(`[${appName}] bootstrapped`);
    },
    
    async mount(props: MicroAppProps) {
      console.log(`[${appName}] mount`, props);
      const container = getMountContainer(props);
      render(container, props);
    },

    async unmount() {
      console.log(`[${appName}] unmount`);
      if (root) {
        root.unmount();
      }
    },

    async update(props: MicroAppProps) {
      console.log(`[${appName}] update`, props);
      const container = getMountContainer(props);
      render(container, props);
    }
  };
}

// Vue专用的工具函数
export function wrapVueLifecycle(options: {
  createApp: (props?: MicroAppProps) => any;
  appName: string;
}) {
  const { createApp, appName } = options;
  let app: any;

  return {
    async bootstrap() {
      console.log(`[${appName}] bootstrapped`);
    },

    async mount(props: MicroAppProps) {
      console.log(`[${appName}] mount`, props);
      app = createApp(props);
    },

    async unmount() {
      console.log(`[${appName}] unmount`);
      app?.unmount();
    },

    async update(props: MicroAppProps) {
      console.log(`[${appName}] update`, props);
      if (app?._instance?.proxy) {
        Object.assign(app._instance.proxy, props.componentProps);
      }
    }
  };
}
