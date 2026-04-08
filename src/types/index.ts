//数据库表结构

// Table 4.1: User
export interface User {
  userId: number;
  phone: string;
  username?: string;
  password?: string; // Optional as we might not return it in all cases, but usually backend handles this. In frontend type it might be present in form data.
  nickname: string;
  email?: string;
  idCard?: string;
  realName?: string;
  avatar: string;
  status: 0 | 1; // 0: disabled, 1: active
  role: 'guest' | 'host' | 'admin' | 'ops' | 'finance';
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

// ==================== 消息中心类型 ====================

export type MessageSender = 'user' | 'host' | 'system';
export type MessageType = 'text' | 'image' | 'card' | 'system' | 'withdraw' | 'refund';
export type MessageStatus = 'sending' | 'sent' | 'failed' | 'recalled';
export type ConversationType = 'consult' | 'complaint' | 'system';
export type ComplaintStatus = 'pending' | 'processing' | 'resolved' | 'escalated' | 'rejected';

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: MessageSender;
  type: MessageType;
  content: string;
  imageUrl?: string;
  timestamp: string; // ISO date string
  isRead: boolean;
  status: MessageStatus;
  isRecalled?: boolean;
  recalledAt?: string;
  // 引用回复
  quotedContent?: string;
  // 房源卡片消息
  cardData?: {
    homestayId: number;
    title: string;
    price: number;
    coverImage: string;
    checkIn?: string;
    checkOut?: string;
  };
}

export interface ComplaintInfo {
  complaintId: number;
  orderId: number;
  status: ComplaintStatus;
  reason: string;
  evidenceImages: string[];
  refundAmount?: number;
  platformNote?: string;
  deadline?: string; // 处理截止时间
}

export interface Conversation {
  id: string;
  user: {
    id: number;
    name: string;
    avatar: string;
    phone: string;
    isOnline: boolean;
  };
  homestayId: number;
  homestayTitle: string;
  orderId?: number;
  lastMessage: {
    content: string;
    type: MessageType;
    timestamp: string;
    sender: MessageSender;
  };
  unreadCount: number;
  type: ConversationType;
  complaintInfo?: ComplaintInfo;
  updatedAt: string;
  createdAt: string;
}

// 系统通知
export interface SystemNotification {
  id: number;
  type: 'order' | 'review' | 'audit' | 'finance' | 'system';
  title: string;
  content: string;
  relatedId?: number;
  isRead: boolean;
  createdAt: string;
}

// ==================== 审核中心类型 ====================

export type AuditType = 'landlord' | 'homestay' | 'withdrawal';
export type AuditStatus = 0 | 1 | 2; // 0: pending, 1: approved, 2: rejected
export type AuditAction = 'submit' | 'approve' | 'reject';

// 审核历史记录
export interface AuditHistory {
  id: number;
  auditId: string;
  action: AuditAction;
  operator: string;
  reason?: string;
  remark?: string;
  time: string;
}

// 审核基础信息
export interface AuditBase {
  id: string;
  type: AuditType;
  status: AuditStatus;
  submitTime: string;
}

// 房东资质审核详情
export interface LandlordAuditDetail extends AuditBase {
  type: 'landlord';
  applicant: {
    id: number;
    name: string;
    avatar: string;
    phone: string;
    idCardName: string;
    idCardNumber: string;
    idCardExpireDate: string;
    registerTime: string;
  };
  idCardFront: string;
  idCardBack: string;
  handHoldIdCard: string;
  propertyCert: string[];
  riskInfo?: {
    phoneRegistered: boolean;
    relatedAccounts?: string[];
    riskLevel: 'normal' | 'warning' | 'danger';
    riskDesc?: string;
  };
}

// 房源审核详情
export interface HomestayAuditDetail extends AuditBase {
  type: 'homestay';
  landlord: {
    id: number;
    name: string;
    phone: string;
  };
  homestay: {
    id: number;
    title: string;
    price: number;
    areaPrice: number; // 同区域均价
    images: string[];
    address: string;
    roomType: string;
    area: number;
    roomCount: number;
    bedType: string;
    maxGuests: number;
    facilities: string[];
    description: string;
  };
  violations?: {
    sensitiveWords: { word: string; count: number; position: number }[];
    abnormalImages: { index: number; reason: string }[];
    priceAbnormal: boolean;
  };
  previousVersion?: {
    title: string;
    price: number;
    images: string[];
    description: string;
  };
  publishType?: 'immediate' | 'scheduled';
  scheduledTime?: string;
}

// 提现审核详情
export interface WithdrawalAuditDetail extends AuditBase {
  type: 'withdrawal';
  withdrawal: {
    id: string;
    amount: number;
    fee: number;
    actualAmount: number;
    bankName: string;
    bankIcon?: string;
    cardNumber: string;
    cardHolder: string;
    realNameMatch: boolean;
  };
  account: {
    balance: number;
    guaranteeBalance: number;
    creditScore: number;
    activeComplaints: number;
  };
  recentWithdrawals: {
    time: string;
    amount: number;
    status: 'approved' | 'rejected';
  }[];
  withdrawalCount7Days: number;
}

// 联合类型
export type AuditDetail = LandlordAuditDetail | HomestayAuditDetail | WithdrawalAuditDetail;

// 审核操作参数
export interface AuditActionParams {
  id: string;
  action: 'approve' | 'reject';
  remark?: string;
  reason?: string;
  publishType?: 'immediate' | 'scheduled';
  scheduledTime?: string;
}

// ==================== 纠纷仲裁类型 ====================

export type DisputeStatus = 'pending' | 'processing' | 'resolved';
export type DisputeType = 'refund' | 'facilities' | 'service' | 'other';
export type VerdictResult = 'full_refund' | 'partial_refund' | 'coupon' | 'reject' | 'refund_to_host' | 'compromise';
export type LiabilityType = 'landlord' | 'user' | 'both' | 'none';

// 纠纷当事人
export interface DisputeParty {
  id: number;
  name: string;
  avatar: string;
  phone: string;
  creditScore: number;
  complaintCount: number;
}

// 订单快照
export interface OrderSnapshot {
  orderId: string;
  homestayTitle: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  claimAmount: number;
}

// 证据材料
export interface Evidence {
  userImages: string[];
  landlordImages: string[];
  userDesc: string;
  landlordDesc?: string;
}

// 时间线记录
export interface TimelineRecord {
  id: number;
  time: string;
  type: 'complaint' | 'response' | 'admin_note' | 'escalate';
  actor: 'user' | 'landlord' | 'admin';
  content: string;
  images?: string[];
}

// 裁决结果
export interface Verdict {
  result: VerdictResult;
  amount?: number;
  liability: LiabilityType;
  reason: string;
  platformShare?: number;
  landlordShare?: number;
  executedAt?: string;
  executedBy?: string;
}

// 沟通记录
export interface ChatRecord {
  id: string;
  sender: 'user' | 'landlord';
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
}

// 订单履约记录
export interface FulfillmentRecord {
  checkInTime: string;
  checkOutTime: string;
  checkInPhotos?: string[];
  checkOutPhotos?: string[];
  refundHistory?: { time: string; amount: number }[];
}

// 平台备注
export interface AdminNote {
  id: number;
  operator: string;
  time: string;
  content: string;
}

// 纠纷详情
export interface DisputeDetail {
  id: string;
  orderId: string;
  status: DisputeStatus;
  type: DisputeType;
  user: DisputeParty;
  landlord: DisputeParty;
  order: OrderSnapshot;
  evidence: Evidence;
  timeline: TimelineRecord[];
  verdict?: Verdict;
  chatRecords?: ChatRecord[];
  fulfillment?: FulfillmentRecord;
  adminNotes?: AdminNote[];
}

// 裁决表单
export interface VerdictForm {
  result: VerdictResult;
  amount: number;
  liability: LiabilityType[];
  reason: string;
}

// ==================== 用户管理类型 ====================

export type UserRole = 'user' | 'landlord';
export type UserStatus = 'normal' | 'warned' | 'restricted' | 'banned';
export type LandlordQualifyStatus = 'qualified' | 'pending' | 'unqualified' | 'rejected';
export type LandlordBusinessStatus = 'open' | 'closed';
export type PunishAction = 'warn' | 'restrict' | 'unrestrict' | 'ban' | 'unban';
export type PunishReason = 'violation_content' | 'malicious_complaint' | 'harassment' | 'fraud' | 'serious_violation' | 'multiple_breach' | 'fake_identity' | 'other';
export type RestrictScope = 'order' | 'publish' | 'withdraw' | 'comment';
export type RestrictDuration = 7 | 30 | 0; // 0表示永久

// 用户基础信息
export interface UserBase {
  id: number;
  nickname: string;
  avatar: string;
  phone: string;
  email?: string;
  realName?: string;
  idCard?: string;
  role: UserRole;
  status: UserStatus;
  registerTime: string;
}

// 用户统计数据
export interface UserStats {
  orderCount: number;
  complaintCount: number;
  totalSpent?: number;
  cancelRate?: number;
  avgRating?: number;
}

// 房东统计数据
export interface LandlordStats extends UserStats {
  homestayCount: number;
  totalRevenue: number;
  completionRate: number;
  positiveRate: number;
}

// 违规记录
export interface ViolationRecord {
  id: number;
  time: string;
  type: 'warning' | 'restrict' | 'ban';
  reason: string;
  description?: string;
  operator: string;
  duration?: number; // 限制天数，0表示永久，未定义表示警告/封禁
  expireTime?: string;
  resolved?: boolean;
  resolveTime?: string;
  resolveReason?: string;
}

// 登录日志
export interface LoginRecord {
  id: number;
  time: string;
  ip: string;
  device: string;
  location: string;
}

// 状态变更历史
export interface StatusChangeRecord {
  id: number;
  time: string;
  fromStatus: UserStatus;
  toStatus: UserStatus;
  reason: string;
  operator: string;
}

// 用户详情
export interface UserDetail extends UserBase {
  stats: UserStats | LandlordStats;
  violations: ViolationRecord[];
  loginRecords: LoginRecord[];
  statusHistory: StatusChangeRecord[];
  // 房东专属
  qualifyStatus?: LandlordQualifyStatus;
  businessStatus?: LandlordBusinessStatus;
  homestays?: { id: number; title: string; status: number }[];
}

// 处罚操作请求
export interface PunishParams {
  userId: number;
  action: PunishAction;
  scope?: RestrictScope[];
  duration?: RestrictDuration;
  reason: PunishReason;
  description?: string;
  unbanRelated?: boolean; // 封禁时是否封禁关联账号
}

// 批量操作请求
export interface BatchPunishParams extends PunishParams {
  userIds: number[];
}
