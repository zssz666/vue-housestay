import { request } from '@/api/request';
import type { Homestay, Calendar } from '@/types';

export const homestayApi = {
  // 创建房源
  create(data: Partial<Homestay>) {
    return request.post<Homestay>('/homestay/create', data);
  },

  // 更新房源
  update(data: Partial<Homestay>) {
    return request.put<Homestay>('/homestay/update', data);
  },

  // 删除房源
  delete(homestayId: number) {
    return request.delete<void>(`/homestay/delete/${homestayId}`);
  },

  // 获取房源详情
  getDetail(homestayId: number) {
    return request.get<Homestay>(`/homestay/detail/${homestayId}`);
  },

  // 获取房源列表
  list(page = 1, size = 10) {
    return request.get<{ list: Homestay[]; total: number }>('/homestay/list', { page, size });
  },

  // 获取我的房源列表
  myList() {
    return request.get<Homestay[]>('/homestay/my-list');
  },

  // 按城市查询
  getByCity(cityCode: string, page = 1, size = 10) {
    return request.get<{ list: Homestay[]; total: number }>(`/homestay/city/${cityCode}`, { page, size });
  },

  // 更新房源状态
  updateStatus(homestayId: number, status: number) {
    return request.put<void>(`/homestay/status/${homestayId}`, { status });
  },

  // 获取日历/可用性
  getCalendar(homestayId: number, month: string) {
    return request.get<Calendar[]>(`/homestay/${homestayId}/calendar`, { month });
  },

  // 搜索房源（首页和搜索页）
  search(params: {
    page?: number;
    pageSize?: number;
    cityCode?: string;
    keyword?: string;
    minPrice?: number;
    maxPrice?: number;
    facilities?: string[];
    status?: number;
  }) {
    return request.get<{ list: Homestay[]; total: number }>('/homestay/search', params);
  }
};
