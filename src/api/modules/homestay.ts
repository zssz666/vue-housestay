import { request } from '@/api/request';
import type { Homestay, ApiResponse, Calendar } from '@/types';

export const homestayApi = {
  // Search homestays
  search(params: {
    cityCode?: string;
    keyword?: string;
    startDate?: string;
    endDate?: string;
    minPrice?: number;
    maxPrice?: number;
    facilities?: string[];
    page?: number;
    pageSize?: number;
  }) {
    return request.get<ApiResponse<{ list: Homestay[]; total: number }>>('/homestay/search', params);
  },

  // Get homestay detail
  getDetail(homestayId: number) {
    return request.get<ApiResponse<Homestay>>(`/homestay/${homestayId}`);
  },

  // Get calendar/availability
  getCalendar(homestayId: number, month: string) {
    return request.get<ApiResponse<Calendar[]>>(`/homestay/${homestayId}/calendar`, { month });
  },

  // Create homestay (for host)
  create(data: Omit<Homestay, 'homestayId' | 'auditStatus' | 'status' | 'createdAt'>) {
    return request.post<ApiResponse<Homestay>>('/homestay', data);
  }
};
