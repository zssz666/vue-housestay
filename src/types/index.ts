//数据库表结构

// Table: users
export interface User {
  userId: number;
  phone: string;
  password?: string;
  name?: string;
  userEmail?: string;
  idCard?: string;
  realName?: string;
  studentStatus?: number;
  studentCard?: string;
  avatar?: string;
  userStatus?: number;
  createTime?: string;
  gender?: number;
  birthday?: string;
}

// Table: landlord
export interface Landlord {
  landlordId: number;
  adminId?: number;
  phone?: string;
  password?: string;
  landlordName?: string;
  landlordAvatar?: string;
  landlordIntroduce?: string;
  landlordTags?: number;
  landlordRealname?: string;
  landlordIdcard?: string;
  idCardFront?: string;
  idCardBack?: string;
  auditStatus?: number;
  auditReason?: string;
  landlordStatus?: number;
  landlordUptime?: string;
}
