import { request } from '@/api/request';
import type { Homestay } from '@/types';

export const favoriteApi = {
  // 获取收藏列表
  getList(page = 1, pageSize = 10) {
    return request.get<{ list: Homestay[]; total: number }>('/favorite/list', { page, pageSize });
  },

  // 添加收藏
  add(homestayId: number) {
    return request.post<void>('/favorite', { homestayId });
  },

  // 取消收藏
  remove(homestayId: number) {
    return request.delete<void>(`/favorite/${homestayId}`);
  },

  // 检查是否收藏
  check(homestayId: number) {
    return request.get<{ favorited: boolean }>(`/favorite/check/${homestayId}`);
  }
};
