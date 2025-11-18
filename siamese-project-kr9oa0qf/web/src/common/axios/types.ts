// 自定义请求配置接口
export interface CustomRequestConfig extends RequestInit {
  timeout?: number;
  baseURL?: string;
  params?: Record<string, any>;
}

// API响应数据结构
export interface ApiResponse<T = any> {
  code: number;
  message?: string;
  data: T;
}