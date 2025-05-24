export interface MicroAppProps {
  container?: HTMLElement;
  routerBase?: string;
  componentProps?: Record<string, any>;
  setGlobalState?: (state: Record<string, any>) => void;
  onGlobalStateChange?: (callback: (state: Record<string, any>, prev: Record<string, any>) => void) => void;
  navigateToUrl?: (url: string) => void;
}

export interface MicroAppLifecycle {
  bootstrap: () => Promise<void>;
  mount: (props: MicroAppProps) => Promise<void>;
  unmount: (props?: MicroAppProps) => Promise<void>;
  update?: (props: MicroAppProps) => Promise<void>;
}
