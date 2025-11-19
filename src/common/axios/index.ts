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
  baseURL: '', // 使用相对路径或mock数据
  headers: {
    'Content-Type': 'application/json',
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

// Mock数据拦截器
const mockData: Record<string, any> = {
  '/rest/risk/control/manager/dataPlatform/agentList': {
    status: 0,
    msg: 'success',
    data: {
      list: [],
      total: 0
    }
  },
  '/rest/risk/control/manager/dataPlatform/hotAgentList': {
    status: 0,
    msg: 'success',
    data: [
      {
        agentCode: 'traffic_analysis',
        agentName: '流量分析',
        agentCategory: '风险感知Agent',
        agentBelong: 'AI部门',
        agentIcon: '',
        agentManager: 'system',
        agentUser: 'system',
        agentDescription: '专业的流量质量case排查助手，帮助您快速定位流量异常',
        agentPrompt: '流量分析助手',
        createTime: Date.now(),
        status: 1
      },
      {
        agentCode: 'data_finder',
        agentName: '找数据',
        agentCategory: '数据Agent',
        agentBelong: 'AI部门',
        agentIcon: '',
        agentManager: 'system',
        agentUser: 'system',
        agentDescription: '帮助您快速找到需要的数据表和指标',
        agentPrompt: '数据查询助手',
        createTime: Date.now(),
        status: 1
      },
      {
        agentCode: 'analysis_assistant',
        agentName: '分析助手',
        agentCategory: '风险归因Agent',
        agentBelong: 'AI部门',
        agentIcon: '',
        agentManager: 'system',
        agentUser: 'system',
        agentDescription: '智能分析助手，提供专业的数据分析服务',
        agentPrompt: '分析助手',
        createTime: Date.now(),
        status: 1
      }
    ],
    requestId: 'mock-request-id'
  },
  '/rest/risk/control/manager/dataPlatform/frequentlyAgentList': {
    status: 0,
    msg: 'success',
    data: [],
    requestId: 'mock-request-id'
  }
};

// 通用请求函数
const request = async <T>(url: string, config: FetchRequestConfig = {}): Promise<T> => {
  const mergedConfig = { ...defaultConfig, ...config };
  const { timeout = 10000, params, baseURL, ...fetchConfig } = mergedConfig;

  // Mock数据拦截
  if (mockData[url]) {
    console.log('[Mock] 拦截请求:', url);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockData[url] as T);
      }, 300); // 模拟网络延迟
    });
  }

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