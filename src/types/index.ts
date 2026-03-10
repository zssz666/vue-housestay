// 对应论文第4章数据库设计 (表4.1-4.11)

// Table 4.1: User
export interface User {
  userId: number;
  phone: string;
  password?: string; // Optional as we might not return it in all cases, but usually backend handles this. In frontend type it might be present in form data.
  nickname: string;
  email?: string;
  idCard?: string;
  realName?: string;
  avatar: string;
  status: 0 | 1; // 0: disabled, 1: active
  role: 'guest' | 'host' | 'admin';
  createdAt: string;
}

// Table 4.3: Landlord
export interface Landlord {
  landlordId: number;
  userId: number;
  idCardFront: string;
  idCardBack: string;
  propertyCert: string; // 房产证
  auditStatus: 0 | 1 | 2; // 0: pending, 1: approved, 2: rejected
  auditReason?: string;
  createdAt: string;
}

// Table 4.4: Homestay
export interface Homestay {
  homestayId: number;
  landlordId: number;
  title: string;
  description: string;
  address: string;
  cityCode: string;
  location: {
    lat: number;
    lng: number;
  };
  price: number;
  area: number; // square meters
  roomCount: number;
  maxGuests: number;
  facilities: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  auditStatus: 0 | 1 | 2; // 0: pending, 1: approved, 2: rejected
  status: 0 | 1; // 0: offline, 1: online
  createdAt: string;
}

// Table 4.5: Calendar
export interface Calendar {
  calendarId: number;
  homestayId: number;
  date: string; // YYYY-MM-DD
  price: number;
  status: 0 | 1 | 2; // 0: available, 1: booked, 2: blocked
  orderId?: number;
}

export interface GuestInfo {
  name: string;
  idCard: string;
  phone: string;
}

// Table 4.7: Order
export interface Order {
  orderId: number;
  orderNo: string;
  userId: number;
  homestayId: number;
  homestayInfo: Homestay; // Snapshot of homestay data
  checkInDate: string;
  checkOutDate: string;
  guests: GuestInfo[];
  contactPhone: string;
  totalAmount: number;
  depositAmount: number;
  discountAmount: number;
  status: 0 | 1 | 2 | 3 | 4 | 5; 
  // 0: pending payment, 1: paid/awaiting confirm, 2: confirmed/awaiting check-in, 
  // 3: checked-in, 4: completed, 5: cancelled
  payStatus: 0 | 1 | 2 | 3; // 0: unpaid, 1: paying, 2: paid, 3: refunded
  cancelReason?: string;
  createdAt: string;
  payTime?: string;
}

// Table 4.10: Review
export interface Review {
  reviewId: number;
  orderId: number;
  userId: number;
  homestayId: number;
  rating: number; // 1-5
  content: string;
  images?: string[];
  replyContent?: string;
  replyTime?: string;
  auditStatus: 0 | 1 | 2; // 0: pending, 1: approved, 2: rejected
  createdAt: string;
  user?: User; // Frontend convenience to show reviewer info
}

// API Response Wrapper
export interface ApiResponse<T> {
  code: number; // 200 for success
  data: T;
  message: string;
  timestamp: number;
}
