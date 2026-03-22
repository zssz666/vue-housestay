import { request } from '@/api/request';
import type { Landlord } from '@/types';

export const landlordApi = {
  // 房东申请入驻
  apply(data: {
    idCardFront: string;
    idCardBack: string;
    propertyCert: string;
  }) {
    return request.post<Landlord>('/landlord/apply', data);
  },

  // 获取当前用户房东信息
  getInfo() {
    return request.get<Landlord>('/landlord/info');
  }
};
