import { request } from '@/api/request';
import axios from 'axios';
import { useUserStore } from '@/stores/user';
import type { Landlord } from '@/types';

export const uploadApi = {
  uploadImage(file: File, folder = 'avatar') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    const userStore = useUserStore();
    return axios.post('/api/upload/image', formData, {
      headers: {
        Authorization: userStore.token ? `Bearer ${userStore.token}` : ''
      }
    }).then(res => {
      const data = res.data as { code: number; data: { url: string }; message?: string };
      if (data.code !== 200) throw new Error(data.message || '上传失败');
      return data.data as { url: string };
    });
  }
};

export const landlordApi = {
  // 房东注册入驻（无需登录）
  register(data: {
    phone: string;
    password: string;
    landlordName: string;
    realName: string;
    idCard: string;
    idCardFront: string;
    idCardBack: string;
    landlordAvatar: string;
    landlordIntroduce: string;
    city: string;
    houseType: number;
  }) {
    return request.post<any>('/landlord/register', data);
  },

  // 获取当前房东信息
  getInfo() {
    return request.get<Landlord>('/landlord/info');
  },

  // 更新房东资料
  updateProfile(data: { landlordAvatar?: string; landlordIntroduce?: string; landlordName?: string }) {
    return request.put<Landlord>('/landlord/profile', data);
  }
};
