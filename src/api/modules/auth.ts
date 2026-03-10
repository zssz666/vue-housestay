import { request } from '@/api/request';
import type { User, ApiResponse } from '@/types';

export const authApi = {
  login(data: Pick<User, 'phone' | 'password'>) {
    return request.post<ApiResponse<{ token: string; user: User }>>('/auth/login', data);
  },
  
  register(data: Pick<User, 'phone' | 'password' | 'nickname'>) {
    return request.post<ApiResponse<{ token: string; user: User }>>('/auth/register', data);
  },

  logout() {
    return request.post<ApiResponse<void>>('/auth/logout');
  },

  getUserInfo() {
    return request.get<ApiResponse<User>>('/auth/me');
  },

  sendVerifyCode(phone: string) {
    return request.post<ApiResponse<{ code: string }>>('/auth/code', { phone });
  }
};
