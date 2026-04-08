import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';
import type { ApiResponse } from '@/types';

// Create Axios instance
const service: AxiosInstance = axios.create({
  baseURL: '/api', // Mock or Real API
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data as ApiResponse<any>;

    // If the custom code is not 200, it is judged as an error.
    if (res.code !== 200) {
      const errorMessage = res.message || '请求失败';
      console.log('API错误 - code:', res.code, 'message:', errorMessage)

      // 401: Token expired or not logged in - 只有在已登录状态下token过期才刷新
      // 登录失败时不应该刷新页面
      if (res.code === 401) {
        const userStore = useUserStore();
        if (userStore.isLoggedIn) {
          // 只有已登录用户的token过期时才刷新
          userStore.logout();
          location.reload();
        }
        // 登录失败时返回错误，不刷新页面
      }

      // 返回一个带有错误消息的 rejected promise
      const error = new Error(errorMessage);
      (error as any).responseData = res;
      return Promise.reject(error);
    } else {
      return res.data; // Return the data part directly
    }
  },
  (error) => {
    console.error('请求错误:', error);

    let message = '网络错误，请稍后重试';

    // 处理 HTTP 错误响应
    if (error.response) {
      const resData = error.response.data;
      if (resData && resData.message) {
        message = resData.message;
      } else if (error.response.status === 401) {
        message = '登录已过期，请重新登录';
      } else if (error.response.status === 403) {
        message = '没有权限';
      } else if (error.response.status === 404) {
        message = '请求的资源不存在';
      } else if (error.response.status >= 500) {
        message = '服务器错误，请稍后重试';
      }
    } else if (error.request) {
      message = '网络连接失败，请检查网络';
    } else if (error.message) {
      message = error.message;
    }

    ElMessage.error(message);

    // 创建一个新的错误对象，保留原始信息
    const customError = new Error(message);
    (customError as any).originalError = error;
    return Promise.reject(customError);
  }
);

// Generic Request Methods
export const request = {
  get<T>(url: string, params?: any): Promise<T> {
    return service.get(url, { params });
  },
  post<T>(url: string, data?: any): Promise<T> {
    return service.post(url, data);
  },
  put<T>(url: string, data?: any): Promise<T> {
    return service.put(url, data);
  },
  del<T>(url: string, params?: any): Promise<T> {
    return service.delete(url, { params });
  },
  // delete 是 JavaScript 保留字，使用 del 作为方法名，此处提供别名以兼容某些调用场景
  delete<T>(url: string, params?: any): Promise<T> {
    return service.delete(url, { params });
  }
};

export default service;
