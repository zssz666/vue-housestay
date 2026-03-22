import { request } from '@/api/request';

export const adminApi = {
  // 管理员登录
  login(username: string, password: string) {
    return request.post<{
      token: string;
      adminId: number;
      username: string;
      realName: string;
      role: number;
    }>('/admin/login', { username, password });
  },

  // 获取管理员信息
  getInfo() {
    return request.get<any>('/admin/info');
  }
};
