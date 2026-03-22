import { request } from '@/api/request';
import type { Order } from '@/types';

export const orderApi = {
  // 创建订单
  create(data: {
    homestayId: number;
    checkInDate: string;
    checkOutDate: string;
  }) {
    return request.post<Order>('/order/create', data);
  },

  // 获取订单详情
  getDetail(orderId: number) {
    return request.get<Order>(`/order/detail/${orderId}`);
  },

  // 获取我的订单列表
  myList(page = 1, size = 10) {
    return request.get<{ list: Order[]; total: number }>('/order/my-list', { page, size });
  },

  // 获取房东订单列表
  landlordList(page = 1, size = 10) {
    return request.get<{ list: Order[]; total: number }>('/order/landlord-list', { page, size });
  },

  // 取消订单
  cancel(orderId: number, reason: string) {
    return request.post<void>(`/order/cancel/${orderId}`, { reason });
  },

  // 支付订单
  pay(orderId: number) {
    return request.post<void>(`/order/pay/${orderId}`);
  },

  // 确认订单(房东)
  confirm(orderId: number) {
    return request.post<void>(`/order/confirm/${orderId}`);
  },

  // 入住
  checkIn(orderId: number) {
    return request.post<void>(`/order/check-in/${orderId}`);
  },

  // 退房
  checkOut(orderId: number) {
    return request.post<void>(`/order/check-out/${orderId}`);
  }
};
