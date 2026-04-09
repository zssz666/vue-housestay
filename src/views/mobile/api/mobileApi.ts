import request from '@/api/request';
import type { ApiResponse, Homestay, Order, Review } from '@/types';
import type {
  MobileSearchParams,
  MobileGuest,
  MobileInvoice,
  MobileBanner,
  MobileCategory,
} from '../types';

// ========== Banner & Category ==========
export function getBanners(): Promise<ApiResponse<MobileBanner[]>> {
  return request.get('/banner/list', { type: 'mobile' });
}

export function getCategories(): Promise<ApiResponse<MobileCategory[]>> {
  return request.get('/category/list');
}

// ========== Homestay ==========
export function getHomestayList(params: MobileSearchParams): Promise<{ list: Homestay[]; total: number }> {
  return request.get('/homestay/list', params);
}

export function getHomestayDetail(id: number): Promise<ApiResponse<Homestay>> {
  return request.get(`/homestay/${id}`);
}

export function getHomestayCalendar(
  id: number,
  yearMonth: string
): Promise<ApiResponse<{ date: string; price: number; status: number }[]>> {
  return request.get(`/homestay/${id}/calendar`, { yearMonth });
}

// ========== Order ==========
export function createOrder(data: {
  homestayId: number;
  checkInDate: string;
  checkOutDate: string;
  guestNames: string[];
  contactPhone: string;
  totalAmount: number;
  remark?: string;
}): Promise<ApiResponse<{ orderId: number; orderNo: string }>> {
  return request.post('/order/create', data);
}

export function getMyOrders(params?: {
  status?: number;
  page?: number;
  size?: number;
}): Promise<ApiResponse<Order[]>> {
  return request.get('/order/my-list', params);
}

export function getOrderDetail(orderId: number): Promise<ApiResponse<Order>> {
  return request.get(`/order/${orderId}`);
}

export function cancelOrder(orderId: number, reason: string): Promise<ApiResponse<void>> {
  return request.post(`/order/${orderId}/cancel`, { reason });
}

export function payOrder(orderId: number): Promise<ApiResponse<{ payUrl: string }>> {
  return request.post(`/order/${orderId}/pay`);
}

export function confirmOrder(orderId: number): Promise<ApiResponse<void>> {
  return request.post(`/order/${orderId}/confirm`);
}

export function checkIn(orderId: number): Promise<ApiResponse<void>> {
  return request.post(`/order/${orderId}/check-in`);
}

export function checkOut(orderId: number): Promise<ApiResponse<void>> {
  return request.post(`/order/${orderId}/check-out`);
}

// ========== Review ==========
export function getHomestayReviews(
  homestayId: number,
  page = 1,
  size = 10
): Promise<ApiResponse<Review[]>> {
  return request.get(`/review/homestay/${homestayId}`, { page, size });
}

export function createReview(data: {
  orderId: number;
  homestayId: number;
  rating: number;
  content: string;
  images?: string[];
}): Promise<ApiResponse<void>> {
  return request.post('/review/create', data);
}

// ========== Guest (同行人) ==========
export function getGuestList(): Promise<ApiResponse<MobileGuest[]>> {
  return request.get('/guest/list');
}

export function addGuest(data: MobileGuest): Promise<ApiResponse<MobileGuest>> {
  return request.post('/guest/add', data);
}

export function updateGuest(data: MobileGuest): Promise<ApiResponse<void>> {
  return request.put('/guest/update', data);
}

export function deleteGuest(id: number): Promise<ApiResponse<void>> {
  return request.del(`/guest/${id}`);
}

// ========== Invoice ==========
export function getInvoiceList(): Promise<ApiResponse<MobileInvoice[]>> {
  return request.get('/invoice/my-list');
}

export function applyInvoice(data: {
  orderId: number;
  title: string;
  taxNo?: string;
}): Promise<ApiResponse<void>> {
  return request.post('/invoice/apply', data);
}

// ========== Favorite ==========
export function getFavoriteList(): Promise<ApiResponse<Homestay[]>> {
  return request.get('/favorite/my-list');
}

export function addFavorite(homestayId: number): Promise<ApiResponse<void>> {
  return request.post('/favorite/add', { homestayId });
}

export function removeFavorite(homestayId: number): Promise<ApiResponse<void>> {
  return request.del(`/favorite/${homestayId}`);
}

export function checkFavorite(homestayId: number): Promise<ApiResponse<boolean>> {
  return request.get(`/favorite/check/${homestayId}`);
}
