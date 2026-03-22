import { request } from '@/api/request';
import type { Review } from '@/types';

export const reviewApi = {
  // 获取房源评论
  getByHomestay(homestayId: number, page = 1, pageSize = 10) {
    return request.get<{ list: Review[]; total: number }>(`/review/homestay/${homestayId}`, { page, pageSize });
  },

  // 提交评论
  create(data: { orderId: number; homestayId: number; rating: number; content: string; images?: string[] }) {
    return request.post<Review>('/review', data);
  },

  // 获取我的评论
  getMyReviews(page = 1, pageSize = 10) {
    return request.get<{ list: Review[]; total: number }>('/review/my', { page, pageSize });
  }
};
