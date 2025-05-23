// 组件导出
export { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
export { Loading, PageLoading, FullscreenLoading } from './components/Loading/Loading';
export { MicroAppWrapper } from './components/MicroAppWrapper/MicroAppWrapper';

// Hooks导出
export { useMicroApp } from './hooks/useMicroApp';

// 类型导出
export type { LoadingProps } from './components/Loading/Loading';
export type { MicroAppWrapperProps } from './components/MicroAppWrapper/MicroAppWrapper';
export type { UseMicroAppOptions, UseMicroAppReturn } from './hooks/useMicroApp';

// 重新导出共享类型
export type * from '@enterprise/shared-types';
