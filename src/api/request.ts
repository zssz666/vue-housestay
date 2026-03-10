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
      ElMessage.error(res.message || 'Error');

      // 401: Token expired or not logged in
      if (res.code === 401) {
        const userStore = useUserStore();
        userStore.logout();
        location.reload();
      }
      return Promise.reject(new Error(res.message || 'Error'));
    } else {
      return res.data; // Return the data part directly
    }
  },
  (error) => {
    console.error('err' + error); // for debug
    let message = error.message;
    if (error.response && error.response.data) {
        message = error.response.data.message || message;
    }
    ElMessage.error(message);
    return Promise.reject(error);
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
  }
};

export default service;
