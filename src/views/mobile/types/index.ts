// 移动端专用类型定义（补充 PC 端 types/index.ts）
export interface MobileSearchParams {
  cityCode?: string;
  keyword?: string;
  checkIn?: string;
  checkOut?: string;
  guestCount?: number;
  minPrice?: number;
  maxPrice?: number;
  facilities?: string[];
  roomType?: string;
  page?: number;
  size?: number;
}

export interface MobileOrder {
  orderId: number;
  orderNo: string;
  userId: number;
  homestayId: number;
  homestayTitle: string;
  homestayCover: string;
  checkInDate: string;
  checkOutDate: string;
  guestNames: string[];
  contactPhone: string;
  totalAmount: number;
  depositAmount: number;
  discountAmount: number;
  status: MobileOrderStatus;
  payStatus: MobilePayStatus;
  cancelReason?: string;
  createdAt: string;
  payTime?: string;
}

export type MobileOrderStatus =
  | 0  // 待支付
  | 1  // 待确认
  | 2  // 待入住
  | 3  // 入住中
  | 4  // 已完成
  | 5; // 已取消

export type MobilePayStatus =
  | 0  // 未支付
  | 1  // 已支付
  | 2  // 已退款
  | 3; // 退款中

export interface MobileGuest {
  id?: number;
  name: string;
  idCard: string;
  phone: string;
}

export interface MobileInvoice {
  invoiceId: number;
  orderId: number;
  orderNo: string;
  title: string;
  taxNo?: string;
  amount: number;
  status: 0 | 1; // 0-待开 1-已开
  createdAt: string;
}

export interface MobileFavorite {
  favoriteId: number;
  homestayId: number;
  homestayTitle: string;
  homestayCover: string;
  price: number;
  rating: number;
}

export interface MobileBanner {
  id: number;
  image: string;
  link?: string;
  title: string;
}

export interface MobileCategory {
  id: string;
  name: string;
  icon: string;
}
