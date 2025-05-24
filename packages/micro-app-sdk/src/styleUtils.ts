/**
 * 样式容器工具函数
 * 解决qiankun沙箱环境中Ant Design CSS-in-JS样式注入问题
 */

import { isQiankunEnvironment } from './utils';

/**
 * 检查是否在qiankun环境中 (从utils导入，避免重复定义)
 */

/**
 * 确保样式容器存在
 * 解决 "Cannot set properties of null (setting 'appendChild')" 错误
 */
export function ensureStyleContainer(): void {
  if (!isQiankunEnvironment()) {
    return;
  }

  try {
    // 确保head标签存在
    if (!document.head) {
      const head = document.createElement('head');
      document.documentElement.insertBefore(head, document.body);
    }

    // 创建Ant Design样式容器
    let antdContainer = document.getElementById('antd-style-container');
    if (!antdContainer) {
      antdContainer = document.createElement('div');
      antdContainer.id = 'antd-style-container';
      antdContainer.style.display = 'none';
      document.head.appendChild(antdContainer);
      console.log('[StyleUtils] Created Ant Design style container');
    }

    // 创建通用样式容器
    let generalContainer = document.getElementById('micro-app-style-container');
    if (!generalContainer) {
      generalContainer = document.createElement('div');
      generalContainer.id = 'micro-app-style-container';
      generalContainer.style.display = 'none';
      document.head.appendChild(generalContainer);
      console.log('[StyleUtils] Created general style container');
    }

    // 确保body标签存在
    if (!document.body) {
      const body = document.createElement('body');
      document.documentElement.appendChild(body);
    }

  } catch (error) {
    console.error('[StyleUtils] Error creating style containers:', error);
  }
}

/**
 * 获取样式容器
 * 优先返回专用容器，fallback到head或body
 */
export function getStyleContainer(): Element {
  // 优先使用Ant Design专用容器
  let container = document.getElementById('antd-style-container');
  if (container) {
    return container;
  }

  // 其次使用通用样式容器
  container = document.getElementById('micro-app-style-container');
  if (container) {
    return container;
  }

  // fallback到head
  if (document.head) {
    return document.head;
  }

  // 最后fallback到body
  return document.body || document.documentElement;
}

/**
 * 修复Ant Design的getContainer函数
 * 确保在qiankun环境中正确获取容器
 */
export function getPopupContainer(triggerNode?: Element | null): Element {
  if (isQiankunEnvironment()) {
    // 在qiankun环境中，优先使用触发节点的父容器
    if (triggerNode?.parentElement) {
      return triggerNode.parentElement;
    }

    // 如果没有触发节点，使用样式容器
    const styleContainer = getStyleContainer();
    if (styleContainer !== document.head) {
      return styleContainer;
    }
  }

  // 默认返回body
  return document.body || document.documentElement;
}

/**
 * 初始化样式环境
 * 在微应用启动时调用
 */
export function initStyleEnvironment(): void {
  if (!isQiankunEnvironment()) {
    return;
  }

  console.log('[StyleUtils] Initializing style environment for qiankun');

  // 确保样式容器存在
  ensureStyleContainer();

  // 监听DOM变化，确保容器不被意外删除
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        // 检查样式容器是否还存在
        const antdContainer = document.getElementById('antd-style-container');
        const generalContainer = document.getElementById('micro-app-style-container');

        if (!antdContainer || !generalContainer) {
          console.log('[StyleUtils] Style container missing, recreating...');
          ensureStyleContainer();
        }
      }
    });
  });

  // 监听head和body的变化
  if (document.head) {
    observer.observe(document.head, { childList: true });
  }
  if (document.body) {
    observer.observe(document.body, { childList: true });
  }

  console.log('[StyleUtils] Style environment initialized');
}

/**
 * 清理样式环境
 * 在微应用卸载时调用
 */
export function cleanupStyleEnvironment(): void {
  if (!isQiankunEnvironment()) {
    return;
  }

  try {
    // 移除样式容器
    const antdContainer = document.getElementById('antd-style-container');
    if (antdContainer) {
      antdContainer.remove();
    }

    const generalContainer = document.getElementById('micro-app-style-container');
    if (generalContainer) {
      generalContainer.remove();
    }

    console.log('[StyleUtils] Style environment cleaned up');
  } catch (error) {
    console.error('[StyleUtils] Error cleaning up style environment:', error);
  }
}

/**
 * 创建安全的样式注入函数
 * 包装原生的样式注入，添加错误处理
 */
export function safeStyleInject(styleContent: string, id?: string): void {
  try {
    const container = getStyleContainer();

    let styleElement = id ? document.getElementById(id) as HTMLStyleElement : null;

    if (!styleElement) {
      styleElement = document.createElement('style');
      if (id) {
        styleElement.id = id;
      }
      styleElement.type = 'text/css';
    }

    styleElement.textContent = styleContent;

    if (!styleElement.parentNode) {
      container.appendChild(styleElement);
    }

    console.log('[StyleUtils] Style injected successfully');
  } catch (error) {
    console.error('[StyleUtils] Error injecting style:', error);
  }
}
