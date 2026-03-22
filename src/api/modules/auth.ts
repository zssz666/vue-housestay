import { request } from '@/api/request';
import type { User } from '@/types';

export const authApi = {
  login(data: Pick<User, 'phone' | 'password'>) {
    return request.post<{ token: string; user: User }>('/auth/login', data);
  },

  loginByCode(data: { phone: string; code: string }) {
    return request.post<{ token: string; user: User }>('/auth/login/code', data);
  },

  register(data: Pick<User, 'phone' | 'password' | 'nickname'>) {
    return request.post<{ token: string; user: User }>('/auth/register', data);
  },

  logout() {
    return request.post<void>('/auth/logout');
  },

  getUserInfo() {
    return request.get<User>('/auth/me');
  },

  sendVerifyCode(phone: string) {
    return request.post<{ code: string }>('/auth/code', { phone });
  }
};

export const userApi = {
  // 获取用户信息
  getUserInfo() {
    return request.get<User>('/user/info');
  },

  // 更新用户信息
  updateUserInfo(data: Partial<Pick<User, 'nickname' | 'avatar' | 'email' | 'realName' | 'idCard' | 'phone'> & { code?: string }>) {
    return request.put<User>('/user/info', data);
  },

  // 修改密码
  changePassword(oldPassword: string, newPassword: string) {
    return request.put<void>('/user/password', { oldPassword, newPassword });
  },

  // 发送换绑手机号验证码
  sendPhoneChangeCode(phone: string) {
    return request.post<{ code: string }>('/user/phone/code', { phone });
  }
};
