import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiResponse } from '@enterprise/shared-types';

export interface HttpConfig extends AxiosRequestConfig {
  skipErrorHandler?: boolean;
  skipAuth?: boolean;
}

export class HttpClient {
  private instance: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string, config?: AxiosRequestConfig) {
    this.baseURL = baseURL;
    this.instance = axios.create({
      baseURL,
      timeout: 10000,
      ...config,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        const httpConfig = config as HttpConfig;

        // 添加认证头
        if (!httpConfig.skipAuth) {
          const token = this.getAuthToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        // 添加请求ID用于追踪
        config.headers['X-Request-ID'] = this.generateRequestId();

        console.log(`[HTTP] ${config.method?.toUpperCase()} ${config.url}`, config);
        return config;
      },
      (error) => {
        console.error('[HTTP] Request error:', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        console.log(`[HTTP] Response:`, response);

        // 统一处理业务错误
        if (response.data && !response.data.success) {
          const error = new Error(response.data.message || 'Request failed');
          (error as any).code = response.data.code;
          throw error;
        }

        return response;
      },
      (error) => {
        console.error('[HTTP] Response error:', error);

        const httpConfig = error.config as HttpConfig;
        if (!httpConfig?.skipErrorHandler) {
          this.handleError(error);
        }

        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    // 从localStorage或其他地方获取token
    return localStorage.getItem('auth_token');
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleError(error: any) {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // 未授权，跳转到登录页
          this.handleUnauthorized();
          break;
        case 403:
          // 禁止访问
          console.error('Access forbidden');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error(`HTTP Error ${status}:`, data?.message || error.message);
      }
    } else if (error.request) {
      console.error('Network error:', error.message);
    } else {
      console.error('Request setup error:', error.message);
    }
  }

  private handleUnauthorized() {
    // 清除token
    localStorage.removeItem('auth_token');

    // 发送全局事件
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));

    // 跳转到登录页（如果不在微应用环境中）
    if (!(window as any).__POWERED_BY_QIANKUN__) {
      window.location.href = '/login';
    }
  }

  // GET请求
  async get<T = any>(url: string, config?: HttpConfig): Promise<T> {
    const response = await this.instance.get<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  // POST请求
  async post<T = any>(url: string, data?: any, config?: HttpConfig): Promise<T> {
    const response = await this.instance.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  // PUT请求
  async put<T = any>(url: string, data?: any, config?: HttpConfig): Promise<T> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  // DELETE请求
  async delete<T = any>(url: string, config?: HttpConfig): Promise<T> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  // PATCH请求
  async patch<T = any>(url: string, data?: any, config?: HttpConfig): Promise<T> {
    const response = await this.instance.patch<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  // 上传文件
  async upload<T = any>(
    url: string,
    file: File,
    config?: HttpConfig & { onProgress?: (progress: number) => void }
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.instance.post<ApiResponse<T>>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
      onUploadProgress: (progressEvent) => {
        if (config?.onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          config.onProgress(progress);
        }
      },
    });

    return response.data.data;
  }

  // 下载文件
  async download(url: string, filename?: string, config?: HttpConfig): Promise<void> {
    const response = await this.instance.get(url, {
      ...config,
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  // 获取原始axios实例
  getInstance(): AxiosInstance {
    return this.instance;
  }
}

// 获取API基础URL的函数
function getApiBaseUrl(): string {
  // 在浏览器环境中，process.env可能未定义
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }

  // 从window对象获取配置（如果有的话）
  if (typeof window !== 'undefined' && (window as any).__APP_CONFIG__?.apiBaseUrl) {
    return (window as any).__APP_CONFIG__.apiBaseUrl;
  }

  // 默认值
  return '/api';
}

// 创建默认HTTP客户端实例
export const httpClient = new HttpClient(getApiBaseUrl());
