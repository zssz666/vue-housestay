import { request } from '@/api/request';
import type { Order, ApiResponse, GuestInfo } from '@/types';

export const orderApi = {
  // Create order
  create(data: {
    homestayId: number;
    checkInDate: string;
    checkOutDate: string;
    guestCount: number;
    guests: GuestInfo[];
    contactPhone: string;
    couponId?: number;
  }) {
    return request.post<ApiResponse<Order>>('/order/create', data);
  },

  // Pay order
  pay(orderId: number, payMethod: 'alipay' | 'wechat' | 'credit_card') {
    return request.post<ApiResponse<{ payUrl: string }>>('/order/pay', { orderId, payMethod });
  },

  // Get order detail
  getDetail(orderId: number) {
    return request.get<ApiResponse<Order>>(`/order/${orderId}`);
  },

  // Get user orders
  getList(params: { status?: number; page: number; pageSize: number }) {
    return request.get<ApiResponse<{ list: Order[]; total: number }>>('/order/list', params);
  },

  // Cancel order
  cancel(orderId: number, reason: string) {
    return request.post<ApiResponse<void>>(`/order/${orderId}/cancel`, { reason });
  }
};
