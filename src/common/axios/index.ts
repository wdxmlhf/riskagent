import { message } from 'antd';
import { CustomRequestConfig, ApiResponse } from './types';

// 模拟axios的请求配置接口
export interface FetchRequestConfig extends RequestInit {
  timeout?: number;
  baseURL?: string;
  params?: Record<string, any>;
}

// 全局配置
const defaultConfig: FetchRequestConfig = {
  timeout: 600000,
  //baseURL: 'https://crc-manager.staging.kuaishou.com',
  baseURL: 'https://crc-manager.corp.kuaishou.com',
  headers: {
    'Content-Type': 'application/json',
   // 'trace-context': '{"laneId":"STAGING.risk_agent"}',
    //'trace-context': '{"laneId":"PRT.risk_agent"}',
  },
};

// 安全的URL参数序列化函数
const serializeParams = (params: any): string => {
  if (!params) return '';
  
  try {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    
    return searchParams.toString();
  } catch (error) {
    console.warn('参数序列化错误:', error);
    return '';
  }
};

// 构建完整URL
const buildUrl = (url: string, params?: Record<string, any>, baseURL?: string): string => {
  let fullUrl = url;
  
  // 如果URL已经是完整的HTTP/HTTPS URL，直接使用
  if (url.startsWith('http://') || url.startsWith('https://')) {
    fullUrl = url;
  } else if (baseURL) {
    // 处理baseURL和相对路径的拼接
    const cleanBaseURL = baseURL.replace(/\/$/, ''); // 移除末尾的斜杠
    const cleanUrl = url.replace(/^\//, ''); // 移除开头的斜杠
    fullUrl = `${cleanBaseURL}/${cleanUrl}`;
  }
  
  // 添加查询参数
  if (params && Object.keys(params).length > 0) {
    const paramString = serializeParams(params);
    if (paramString) {
      const separator = fullUrl.includes('?') ? '&' : '?';
      fullUrl = `${fullUrl}${separator}${paramString}`;
    }
  }
  
  return fullUrl;
};

// 处理超时
const createTimeoutPromise = (timeout: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`请求超时: ${timeout}ms`));
    }, timeout);
  });
};

// 通用请求函数
const request = async <T>(url: string, config: FetchRequestConfig = {}): Promise<T> => {
  const mergedConfig = { ...defaultConfig, ...config };
  const { timeout = 10000, params, baseURL, ...fetchConfig } = mergedConfig;
  
  try {
    // 构建URL
    const fullUrl = buildUrl(url, params, baseURL);
    
    // 添加认证token
    const token = localStorage.getItem('token');
    if (token && fetchConfig.headers) {
      (fetchConfig.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
    
    // 发起请求（带超时）
    const fetchPromise = fetch(fullUrl, fetchConfig);
    const timeoutPromise = createTimeoutPromise(timeout);
    
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    
    // 检查响应状态
    if (!response.ok) {
      let errorMessage = `请求失败: ${response.status}`;
      
      switch (response.status) {
        case 400:
          errorMessage = '请求错误';
          break;
        case 401:
          errorMessage = '未授权，请重新登录';
          break;
        case 403:
          errorMessage = '拒绝访问';
          break;
        case 404:
          errorMessage = '请求的资源不存在';
          break;
        case 500:
          errorMessage = '服务器错误';
          break;
      }
      
      message.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    // 解析响应数据
    const data = await response.json();
    
    // 处理自定义响应格式
    if (data && typeof data === 'object' && 'code' in data) {
      const apiRes = data as ApiResponse;
      
      // 根据业务状态码处理
      if (apiRes.code !== 0 && apiRes.code !== 200) {
        const errorMessage = apiRes.message || '请求失败';
        message.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      // 返回数据部分
      return apiRes.data;
    }
    
    // 如果不是自定义格式，则直接返回数据
    return data;
    
  } catch (error: any) {
    console.error('Request error:', error);
    
    if (error.name === 'AbortError') {
      message.error('请求被取消');
    } else if (error.message?.includes('超时')) {
      message.error('网络请求超时，请检查您的网络连接');
    } else if (!error.message?.includes('请求失败')) {
      message.error('网络错误，请检查您的网络连接');
    }
    
    throw error;
  }
};

// 封装GET请求
export const get = <T>(url: string, params?: any, config?: CustomRequestConfig): Promise<T> => {
  return request<T>(url, {
    method: 'GET',
    params,
    ...config,
  });
};

// 封装POST请求
export const post = <T>(url: string, data?: any, config?: CustomRequestConfig): Promise<T> => {
  return request<T>(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    ...config,
  });
};

// 封装PUT请求
export const put = <T>(url: string, data?: any, config?: CustomRequestConfig): Promise<T> => {
  return request<T>(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
    ...config,
  });
};

// 封装DELETE请求
export const del = <T>(url: string, config?: CustomRequestConfig): Promise<T> => {
  return request<T>(url, {
    method: 'DELETE',
    ...config,
  });
};

// 模拟axios的create方法
export const create = (config: FetchRequestConfig) => {
  const instance = {
    get: <T>(url: string, requestConfig?: FetchRequestConfig) => 
      get<T>(url, requestConfig?.params, { ...config, ...requestConfig }),
    post: <T>(url: string, data?: any, requestConfig?: FetchRequestConfig) => 
      post<T>(url, data, { ...config, ...requestConfig }),
    put: <T>(url: string, data?: any, requestConfig?: FetchRequestConfig) => 
      put<T>(url, data, { ...config, ...requestConfig }),
    delete: <T>(url: string, requestConfig?: FetchRequestConfig) => 
      del<T>(url, { ...config, ...requestConfig }),
  };
  
  return instance;
};

// 导出类型定义
export * from './types';

// 模拟axios默认导出
const http = create(defaultConfig);
export default http;