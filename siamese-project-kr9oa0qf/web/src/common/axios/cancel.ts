// 使用AbortController替代axios的CancelToken
const pendingMap = new Map<string, AbortController>();

/**
 * 生成请求的唯一标识
 * @param url 请求URL
 * @param method 请求方法
 * @returns 请求的唯一标识
 */
export const generateRequestKey = (url: string, method: string = 'GET'): string => {
  try {
    return `${method.toUpperCase()}|${url}`;
  } catch (error) {
    console.warn('generateRequestKey error:', error);
    return `request_${Date.now()}`;
  }
};

/**
 * 添加请求到pendingMap中
 * @param url 请求URL
 * @param method 请求方法
 * @returns AbortController实例
 */
export const addPending = (url: string, method: string = 'GET'): AbortController => {
  try {
    const requestKey = generateRequestKey(url, method);
    
    // 取消已存在的相同请求
    if (pendingMap.has(requestKey)) {
      const controller = pendingMap.get(requestKey);
      if (controller) {
        controller.abort();
      }
      pendingMap.delete(requestKey);
    }
    
    // 创建新的控制器
    const controller = new AbortController();
    pendingMap.set(requestKey, controller);
    
    return controller;
  } catch (error) {
    console.warn('addPending error:', error);
    return new AbortController();
  }
};

/**
 * 从pendingMap中移除请求
 * @param url 请求URL
 * @param method 请求方法
 */
export const removePending = (url: string, method: string = 'GET'): void => {
  try {
    const requestKey = generateRequestKey(url, method);
    if (pendingMap.has(requestKey)) {
      pendingMap.delete(requestKey);
    }
  } catch (error) {
    console.warn('removePending error:', error);
  }
};

/**
 * 清空所有pending中的请求
 */
export const clearPending = (): void => {
  try {
    pendingMap.forEach((controller) => {
      if (controller) {
        controller.abort();
      }
    });
    pendingMap.clear();
  } catch (error) {
    console.warn('clearPending error:', error);
  }
};

/**
 * 创建用于React组件的请求取消Hook
 */
export const useCancelRequest = () => {
  return {
    cancelRequest: clearPending
  };
};