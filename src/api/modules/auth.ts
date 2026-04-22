import { request } from '@/api/request';
import type { User } from '@/types';

export const authApi = {
  login(data: { phone: string; password: string }) {
    return request.post<{ token: string; user: User }>('/auth/login', data);
  },

  loginByCode(data: { phone: string; code: string }) {
    return request.post<{ token: string; user: User }>('/auth/login/code', data);
  },

  register(data: { phone: string; password: string; code: string; nickname?: string; avatar?: string; gender?: number; birthday?: string }) {
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
  getUserInfo() {
    return request.get<User>('/user/info');
  },

  updateUserInfo(data: Partial<Pick<User, 'name' | 'avatar' | 'userEmail' | 'realName' | 'idCard' | 'phone'>> & { code?: string }) {
    return request.put<User>('/user/info', data);
  },

  changePassword(oldPassword: string, newPassword: string) {
    return request.put<void>('/user/password', { oldPassword, newPassword });
  },

  sendPhoneChangeCode(phone: string) {
    return request.post<{ code: string }>('/user/phone/code', { phone });
  },

  // 实名认证状态
  getCertStatus() {
    return request.get<{ certStatus: number }>('/user/cert/status');
  },

  // 提交实名认证
  submitCert(data: { realName: string; idCard: string }) {
    return request.post<User>('/user/cert', data);
  },

  // 学生认证状态
  getStudentCertStatus() {
    return request.get<{ certStatus: number; studentStatus: number; age: number; eligible: boolean }>('/user/student-cert/status');
  },

  // 提交学生认证
  submitStudentCert(studentCardUrl: string) {
    return request.post<User>('/user/student-cert', { studentCardUrl });
  },
};

export const areaApi = {
  getProvinces() {
    return request.get<{ list: { name: string; parent: null }[] }>('/area/provinces');
  },
  getCities(province: string) {
    const query = new URLSearchParams({ province }).toString();
    return request.get<{ list: { name: string; parent: string }[] }>(`/area/cities?${query}`);
  },
  getDistricts(province: string, city: string) {
    const query = new URLSearchParams({ province, city }).toString();
    return request.get<{ list: { name: string; parent: string }[] }>(`/area/districts?${query}`);
  },
};
