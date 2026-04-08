import Mock from 'mockjs';
import { homestays, orders, reviews, users } from './data';
import type { Homestay, Order, Review, User } from '@/types';

// Re-export 所有 Mock 数据，供其他模块直接使用
export { homestays, orders, reviews, users } from './data';

// 设置全局延迟 50-100ms，模拟网络延迟
Mock.setup({
  timeout: '50-100',
});

// ============ 辅助函数 ============

const generateOrderNo = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORDER${dateStr}${random}`;
};

// ============ 认证相关 Mock ============

Mock.mock(/\/api\/auth\/login/, 'post', (options: any) => {
  const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
  const { phone, password } = body;

  // 演示账号：13800138000 / 123456
  if (phone === '13800138000' && password === '123456') {
    return {
      code: 200,
      data: {
        token: 'mock_token_guest_' + Date.now(),
        user: users[0],
      },
      message: '登录成功',
      timestamp: Date.now(),
    };
  }

  // 房东账号：13900139000 / 123456
  if (phone === '13900139000' && password === '123456') {
    return {
      code: 200,
      data: {
        token: 'mock_token_host_' + Date.now(),
        user: users[1],
      },
      message: '登录成功',
      timestamp: Date.now(),
    };
  }

  // 管理员账号：13700137000 / admin123
  if (phone === '13700137000' && password === '123') {
    return {
      code: 200,
      data: {
        token: 'mock_token_admin_' + Date.now(),
        user: users[2],
      },
      message: '登录成功',
      timestamp: Date.now(),
    };
  }

  return {
    code: 401,
    data: null,
    message: '手机号或密码错误',
    timestamp: Date.now(),
  };
});

Mock.mock(/\/api\/auth\/logout/, 'post', () => ({
  code: 200,
  data: null,
  message: '退出成功',
  timestamp: Date.now(),
}));

Mock.mock(/\/api\/auth\/me/, 'get', () => ({
  code: 200,
  data: users[0],
  message: 'success',
  timestamp: Date.now(),
}));

// ============ 验证码登录 Mock（新增：支持 /api/auth/login/code） ============
// 快捷测试账号：任意手机号 + 验证码 999999（或 123456）直接登录成功
Mock.mock('/api/auth/login/code', 'post', (options: any) => {
  const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
  const { phone, code } = body;

  // 允许以下快捷登录（无需真实验证码）
  const validCodes = ['999999', '123456', '666666', '888888'];
  // 构建完整用户对象，避免 undefined
  const guestUser: User = { userId: 1, phone: '13800138000', username: 'guest001', email: 'guest@example.com', nickname: 'Guest User', avatar: '/avatar.jpg', role: 'guest' as const, status: 1 as const, createdAt: '2023-01-01 12:00:00' };
  const hostUser: User = { userId: 2, phone: '13900139000', username: 'host001', email: 'host@example.com', nickname: 'Verified Host', avatar: '/avatar.jpg', role: 'host' as const, status: 1 as const, createdAt: '2023-02-01 10:00:00' };
  const adminUser: User = { userId: 3, phone: '13700137000', username: 'admin001', email: 'admin@example.com', nickname: 'Admin User', avatar: '/avatar.jpg', role: 'admin' as const, status: 1 as const, createdAt: '2023-03-01 09:00:00' };
  const testPhones: Record<string, { user: User; tokenPrefix: string }> = {
    // 普通用户
    '13800138000': { user: guestUser, tokenPrefix: 'mock_token_guest_' },
    // 房东
    '13900139000': { user: hostUser, tokenPrefix: 'mock_token_host_' },
    // 管理员
    '13700137000': { user: adminUser, tokenPrefix: 'mock_token_admin_' },
    // 额外测试：超级管理员（角色 admin）
    '13800000001': { user: { ...adminUser, userId: 100, phone: '13800000001', nickname: '超级管理员', role: 'admin' }, tokenPrefix: 'mock_admin_' },
    // 额外测试：运营（角色 ops）
    '13800000002': { user: { ...adminUser, userId: 101, phone: '13800000002', nickname: '运营专员', role: 'ops' }, tokenPrefix: 'mock_ops_' },
    // 额外测试：财务（角色 finance）
    '13800000003': { user: { ...adminUser, userId: 102, phone: '13800000003', nickname: '财务专员', role: 'finance' }, tokenPrefix: 'mock_finance_' },
  };

  // 判断是否是测试手机号（已配置的角色）或任意手机号+有效验证码
  if (testPhones[phone]) {
    const entry = testPhones[phone];
    return {
      code: 200,
      data: {
        token: entry.tokenPrefix + Date.now(),
        user: entry.user,
      },
      message: '登录成功',
      timestamp: Date.now(),
    };
  }

  // 其他手机号：验证码为有效测试码时也放行（角色统一为 guest）
  if (validCodes.includes(code)) {
    return {
      code: 200,
      data: {
        token: 'mock_token_guest_' + Date.now(),
        user: { ...guestUser, userId: Math.floor(Math.random() * 10000) + 1000, phone, nickname: '用户' + phone.slice(-4) },
      },
      message: '登录成功',
      timestamp: Date.now(),
    };
  }

  return {
    code: 401,
    data: null,
    message: '验证码错误或已失效',
    timestamp: Date.now(),
  };
});

// 验证码发送 Mock（已存在，直接返回成功）
Mock.mock('/api/auth/code', 'post', () => ({
  code: 200,
  data: { code: '123456' },
  message: '验证码已发送',
  timestamp: Date.now(),
}));

Mock.mock(/\/api\/auth\/register/, 'post', (options: any) => {
  const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
  const newUser: User = {
    userId: Math.floor(Math.random() * 10000),
    phone: body.phone,
    nickname: body.nickname || '新用户',
    username: body.phone,
    avatar: 'https://i.pravatar.cc/150?u=' + Date.now(),
    role: 'guest',
    status: 1,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  };
  return {
    code: 200,
    data: {
      token: 'mock_token_' + Date.now(),
      user: newUser,
    },
    message: '注册成功',
    timestamp: Date.now(),
  };
});

// ============ 用户相关 Mock ============

Mock.mock(/\/api\/user\/info/, 'get', () => ({
  code: 200,
  data: users[0],
  message: 'success',
  timestamp: Date.now(),
}));

Mock.mock(/\/api\/user\/info/, 'put', (options: any) => {
  const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
  const updatedUser = { ...users[0], ...body };
  return {
    code: 200,
    data: updatedUser,
    message: '更新成功',
    timestamp: Date.now(),
  };
});

Mock.mock(/\/api\/user\/password/, 'put', () => ({
  code: 200,
  data: null,
  message: '密码修改成功',
  timestamp: Date.now(),
}));

// ============ 房源相关 Mock ============

Mock.mock(/\/api\/homestay\/list/, 'get', (options: any) => {
  const params = (options as any).params || {};
  const page = parseInt(params.page) || 1;
  const size = parseInt(params.pageSize) || 10;
  const start = (page - 1) * size;
  const end = start + size;
  const list = homestays.filter(h => h.auditStatus === 1 && h.status === 1).slice(start, end);

  return {
    code: 200,
    data: {
      list,
      total: homestays.length,
    },
    message: 'success',
    timestamp: Date.now(),
  };
});

Mock.mock(/\/api\/homestay\/search/, 'get', (options: any) => {
  const params = (options as any).params || {};
  let filtered = [...homestays].filter(h => h.auditStatus === 1 && h.status === 1);

  if (params.cityCode) {
    filtered = filtered.filter(h => h.cityCode === params.cityCode);
  }
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(h =>
      h.title.toLowerCase().includes(kw) ||
      h.description.toLowerCase().includes(kw) ||
      h.address.toLowerCase().includes(kw)
    );
  }
  if (params.minPrice) {
    filtered = filtered.filter(h => h.price >= parseInt(params.minPrice));
  }
  if (params.maxPrice) {
    filtered = filtered.filter(h => h.price <= parseInt(params.maxPrice));
  }
  if (params.facilities && params.facilities.length > 0) {
    const facilities = Array.isArray(params.facilities) ? params.facilities : [params.facilities];
    filtered = filtered.filter(h =>
      facilities.some((f: string) => h.facilities.includes(f))
    );
  }

  const page = parseInt(params.page) || 1;
  const pageSize = parseInt(params.pageSize) || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    code: 200,
    data: {
      list: filtered.slice(start, end),
      total: filtered.length,
    },
    message: 'success',
    timestamp: Date.now(),
  };
});

Mock.mock(/\/api\/homestay\/detail\/\d+/, 'get', (options: any) => {
  const id = parseInt(options.url.match(/\/api\/homestay\/detail\/(\d+)/)?.[1] || '0');
  const homestay = homestays.find(h => h.homestayId === id);
  if (homestay) {
    return {
      code: 200,
      data: homestay,
      message: 'success',
      timestamp: Date.now(),
    };
  }
  return {
    code: 404,
    data: null,
    message: '房源不存在',
    timestamp: Date.now(),
  };
});

Mock.mock(/\/api\/homestay\/my-list/, 'get', () => ({
  code: 200,
  data: homestays.filter(h => h.landlordId === 2),
  message: 'success',
  timestamp: Date.now(),
}));

Mock.mock(/\/api\/homestay\/create/, 'post', (options: any) => {
  const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
  const newHomestay: Homestay = {
    homestayId: Math.floor(Math.random() * 10000) + 1000,
    landlordId: 2,
    ...body,
    rating: 0,
    reviewCount: 0,
    auditStatus: 0,
    status: 1,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  };
  return {
    code: 200,
    data: newHomestay,
    message: '创建成功，等待审核',
    timestamp: Date.now(),
  };
});

Mock.mock(/\/api\/homestay\/update/, 'put', (options: any) => {
  const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
  return {
    code: 200,
    data: body,
    message: '更新成功',
    timestamp: Date.now(),
  };
});

Mock.mock(/\/api\/homestay\/delete\/\d+/, 'delete', () => ({
  code: 200,
  data: null,
  message: '删除成功',
  timestamp: Date.now(),
}));

Mock.mock(/\/api\/homestay\/status\/\d+/, 'put', () => ({
  code: 200,
  data: null,
  message: '状态更新成功',
  timestamp: Date.now(),
}));

Mock.mock(/\/api\/homestay\/\d+\/calendar/, 'get', (options: any) => {
  const today = new Date();
  const calendar = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    calendar.push({
      calendarId: i + 1,
      homestayId: parseInt(options.url.match(/\/api\/homestay\/(\d+)\/calendar/)?.[1] || '0'),
      date: date.toISOString().slice(0, 10),
      price: Math.floor(Math.random() * 200) + 300,
      status: Math.random() > 0.8 ? 1 : 0,
    });
  }
  return {
    code: 200,
    data: calendar,
    message: 'success',
    timestamp: Date.now(),
  };
});

Mock.mock(/\/api\/homestay\/city\/\w+/, 'get', (options: any) => {
  const cityCode = options.url.match(/\/api\/homestay\/city\/(\w+)/)?.[1];
  const filtered = homestays.filter(h => h.cityCode === cityCode && h.auditStatus === 1 && h.status === 1);
  return {
    code: 200,
    data: {
      list: filtered,
      total: filtered.length,
    },
    message: 'success',
    timestamp: Date.now(),
  };
});

// ============ 订单相关 Mock ============

Mock.mock(/\/api\/order\/create/, 'post', (options: any) => {
  const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
  const homestay = homestays.find(h => h.homestayId === body.homestayId);
  if (!homestay) {
    return {
      code: 400,
      data: null,
      message: '房源不存在',
      timestamp: Date.now(),
    };
  }

  const newOrder: Order = {
    orderId: Math.floor(Math.random() * 10000) + 1000,
    orderNo: generateOrderNo(),
    userId: 1,
    homestayId: body.homestayId,
    homestayInfo: homestay,
    checkInDate: body.checkInDate,
    checkOutDate: body.checkOutDate,
    guests: body.guests || [],
    contactPhone: body.contactPhone || '',
    totalAmount: homestay.price * Math.ceil(
      (new Date(body.checkOutDate).getTime() - new Date(body.checkInDate).getTime()) / (1000 * 3600 * 24)
    ),
    depositAmount: 0,
    discountAmount: 0,
    status: 0,
    payStatus: 0,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  };

  orders.unshift(newOrder);

  return {
    code: 200,
    data: newOrder,
    message: '订单创建成功',
    timestamp: Date.now(),
  };
});

Mock.mock(/\/api\/order\/detail\/\d+/, 'get', (options: any) => {
  const id = parseInt(options.url.match(/\/api\/order\/detail\/(\d+)/)?.[1] || '0');
  const order = orders.find(o => o.orderId === id);
  if (order) {
    return {
      code: 200,
      data: order,
      message: 'success',
      timestamp: Date.now(),
    };
  }
  return {
    code: 404,
    data: null,
    message: '订单不存在',
    timestamp: Date.now(),
  };
});

Mock.mock(/\/api\/order\/my-list/, 'get', () => ({
  code: 200,
  data: {
    list: orders,
    total: orders.length,
  },
  message: 'success',
  timestamp: Date.now(),
}));

Mock.mock(/\/api\/order\/landlord-list/, 'get', () => ({
  code: 200,
  data: {
    list: orders.filter(o => o.homestayInfo?.landlordId === 2),
    total: orders.filter(o => o.homestayInfo?.landlordId === 2).length,
  },
  message: 'success',
  timestamp: Date.now(),
}));

Mock.mock(/\/api\/order\/cancel\/\d+/, 'post', (options: any) => {
  const id = parseInt(options.url.match(/\/api\/order\/cancel\/(\d+)/)?.[1] || '0');
  const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
  const order = orders.find(o => o.orderId === id);
  if (order) {
    order.status = 5;
    order.cancelReason = body.reason;
  }
  return {
    code: 200,
    data: null,
    message: '订单已取消',
    timestamp: Date.now(),
  };
});

Mock.mock(/\/api\/order\/pay\/\d+/, 'post', (options: any) => {
  const id = parseInt(options.url.match(/\/api\/order\/pay\/(\d+)/)?.[1] || '0');
  const order = orders.find(o => o.orderId === id);
  if (order) {
    order.payStatus = 2;
    order.status = 1;
    order.payTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
  }
  return {
    code: 200,
    data: null,
    message: '支付成功',
    timestamp: Date.now(),
  };
});

Mock.mock(/\/api\/order\/confirm\/\d+/, 'post', (options: any) => {
  const id = parseInt(options.url.match(/\/api\/order\/confirm\/(\d+)/)?.[1] || '0');
  const order = orders.find(o => o.orderId === id);
  if (order) {
    order.status = 2;
  }
  return {
    code: 200,
    data: null,
    message: '订单已确认',
    timestamp: Date.now(),
  };
});

Mock.mock(/\/api\/order\/check-in\/\d+/, 'post', (options: any) => {
  const id = parseInt(options.url.match(/\/api\/order\/check-in\/(\d+)/)?.[1] || '0');
  const order = orders.find(o => o.orderId === id);
  if (order) {
    order.status = 3;
  }
  return {
    code: 200,
    data: null,
    message: '入住成功',
    timestamp: Date.now(),
  };
});

Mock.mock(/\/api\/order\/check-out\/\d+/, 'post', (options: any) => {
  const id = parseInt(options.url.match(/\/api\/order\/check-out\/(\d+)/)?.[1] || '0');
  const order = orders.find(o => o.orderId === id);
  if (order) {
    order.status = 4;
  }
  return {
    code: 200,
    data: null,
    message: '退房成功',
    timestamp: Date.now(),
  };
});

// ============ 评价相关 Mock ============

Mock.mock(/\/api\/review\/homestay\/\d+/, 'get', (options: any) => {
  const id = parseInt(options.url.match(/\/api\/review\/homestay\/(\d+)/)?.[1] || '0');
  const filtered = reviews.filter(r => r.homestayId === id && r.auditStatus === 1);
  return {
    code: 200,
    data: {
      list: filtered,
      total: filtered.length,
    },
    message: 'success',
    timestamp: Date.now(),
  };
});

Mock.mock(/\/api\/review$/, 'post', (options: any) => {
  const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
  const newReview: Review = {
    reviewId: Math.floor(Math.random() * 10000) + 100,
    orderId: body.orderId,
    userId: 1,
    homestayId: body.homestayId,
    rating: body.rating,
    content: body.content,
    images: body.images || [],
    auditStatus: 1,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    user: users[0],
  };
  reviews.unshift(newReview);
  return {
    code: 200,
    data: newReview,
    message: '评价成功',
    timestamp: Date.now(),
  };
});

Mock.mock(/\/api\/review\/my/, 'get', () => ({
  code: 200,
  data: {
    list: reviews.filter(r => r.userId === 1),
    total: reviews.filter(r => r.userId === 1).length,
  },
  message: 'success',
  timestamp: Date.now(),
}));

// ============ 收藏相关 Mock ============

Mock.mock(/\/api\/favorite\/list/, 'get', () => ({
  code: 200,
  data: {
    list: [homestays[0], homestays[2], homestays[4]],
    total: 3,
  },
  message: 'success',
  timestamp: Date.now(),
}));

Mock.mock(/\/api\/favorite$/, 'post', () => ({
  code: 200,
  data: null,
  message: '收藏成功',
  timestamp: Date.now(),
}));

Mock.mock(/\/api\/favorite\/\d+/, 'delete', () => ({
  code: 200,
  data: null,
  message: '取消收藏成功',
  timestamp: Date.now(),
}));

Mock.mock(/\/api\/favorite\/check\/\d+/, 'get', () => ({
  code: 200,
  data: { favorited: Math.random() > 0.5 },
  message: 'success',
  timestamp: Date.now(),
}));

// ============ 房东相关 Mock ============

Mock.mock(/\/api\/landlord\/info/, 'get', () => ({
  code: 200,
  data: {
    landlordId: 1,
    userId: 2,
    idCardFront: 'https://picsum.photos/400/300?random=10',
    idCardBack: 'https://picsum.photos/400/300?random=11',
    propertyCert: 'https://picsum.photos/400/300?random=12',
    auditStatus: 1,
    createdAt: '2023-01-01 10:00:00',
  },
  message: 'success',
  timestamp: Date.now(),
}));

Mock.mock(/\/api\/landlord\/apply/, 'post', () => ({
  code: 200,
  data: {
    landlordId: Math.floor(Math.random() * 10000),
    auditStatus: 0,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  },
  message: '申请已提交，等待审核',
  timestamp: Date.now(),
}));

// ============ 管理员相关 Mock ============

Mock.mock(/\/api\/admin\/login/, 'post', (options: any) => {
  const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
  if (body.username === 'admin' && body.password === 'admin123') {
    return {
      code: 200,
      data: {
        token: 'mock_admin_token_' + Date.now(),
        adminId: 1,
        username: 'admin',
        realName: '超级管理员',
        role: 1,
      },
      message: '登录成功',
      timestamp: Date.now(),
    };
  }
  return {
    code: 401,
    data: null,
    message: '用户名或密码错误',
    timestamp: Date.now(),
  };
});

Mock.mock(/\/api\/admin\/info/, 'get', () => ({
  code: 200,
  data: {
    adminId: 1,
    username: 'admin',
    realName: '超级管理员',
    role: 1,
  },
  message: 'success',
  timestamp: Date.now(),
}));

// ============ 移动端特有 API ============

Mock.mock(/\/api\/banner\/list/, 'get', () => ({
  code: 200,
  data: [
    {
      id: 1,
      image: 'https://picsum.photos/750/400?random=1',
      title: '成都太古里·云端全景落地窗江景房',
      link: '/detail/101',
    },
    {
      id: 2,
      image: 'https://picsum.photos/750/400?random=2',
      title: '大理古城·苍山洱海观景别院',
      link: '/detail/201',
    },
    {
      id: 3,
      image: 'https://picsum.photos/750/400?random=3',
      title: '杭州西湖·隐居山水间',
      link: '/detail/301',
    },
  ],
  message: 'success',
  timestamp: Date.now(),
}));

Mock.mock(/\/api\/category\/list/, 'get', () => ({
  code: 200,
  data: [
    { id: 1, name: '特色民宿', icon: 'el-icon-house', image: 'https://picsum.photos/100/100?random=21' },
    { id: 2, name: '海景房', icon: 'el-icon-sunrise', image: 'https://picsum.photos/100/100?random=22' },
    { id: 3, name: '古镇古宅', icon: 'el-icon-office-building', image: 'https://picsum.photos/100/100?random=23' },
    { id: 4, name: '亲子友好', icon: 'el-icon-user', image: 'https://picsum.photos/100/100?random=24' },
    { id: 5, name: '宠物友好', icon: 'el-icon-pets', image: 'https://picsum.photos/100/100?random=25' },
    { id: 6, name: '商务出行', icon: 'el-icon-briefcase', image: 'https://picsum.photos/100/100?random=26' },
  ],
  message: 'success',
  timestamp: Date.now(),
}));

// 移动端订单相关
Mock.mock(/\/api\/order\/my-list/, 'get', () => ({
  code: 200,
  data: orders,
  message: 'success',
  timestamp: Date.now(),
}));

// 移动端客人管理
Mock.mock(/\/api\/guest\/list/, 'get', () => ({
  code: 200,
  data: [
    { id: 1, name: '张三', idCard: '510101199001011234', phone: '13800138000', relation: '本人' },
    { id: 2, name: '李四', idCard: '510101199002022345', phone: '13900139000', relation: '朋友' },
  ],
  message: 'success',
  timestamp: Date.now(),
}));

Mock.mock(/\/api\/guest\/add/, 'post', (options: any) => {
  const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
  return {
    code: 200,
    data: { id: Math.floor(Math.random() * 100), ...body },
    message: '添加成功',
    timestamp: Date.now(),
  };
});

Mock.mock(/\/api\/guest\/update/, 'put', () => ({
  code: 200,
  data: null,
  message: '更新成功',
  timestamp: Date.now(),
}));

Mock.mock(/\/api\/guest\/\d+/, 'delete', () => ({
  code: 200,
  data: null,
  message: '删除成功',
  timestamp: Date.now(),
}));

// 移动端发票
Mock.mock(/\/api\/invoice\/my-list/, 'get', () => ({
  code: 200,
  data: [],
  message: 'success',
  timestamp: Date.now(),
}));

Mock.mock(/\/api\/invoice\/apply/, 'post', () => ({
  code: 200,
  data: null,
  message: '发票申请已提交',
  timestamp: Date.now(),
}));

// 移动端收藏
Mock.mock(/\/api\/favorite\/my-list/, 'get', () => ({
  code: 200,
  data: [homestays[0], homestays[2], homestays[4]],
  message: 'success',
  timestamp: Date.now(),
}));

console.log('[Mock] Mock 服务已启动，所有 API 请求将被拦截并返回模拟数据');

// ==================== 消息中心 Mock ====================

// 会话列表
const conversationList = [
  {
    id: 'conv_001',
    user: { id: 3, name: '李明', avatar: '/toux1.png', phone: '13912345678', isOnline: true },
    homestayId: 101,
    homestayTitle: '成都太古里·云端全景落地窗江景房',
    orderId: 1001,
    lastMessage: { content: '请问WiFi密码是多少？', type: 'text', timestamp: '2026-03-24T14:30:00', sender: 'user' },
    unreadCount: 2,
    type: 'consult',
    updatedAt: '2026-03-24T14:30:00',
    createdAt: '2026-03-24T09:00:00',
  },
  {
    id: 'conv_002',
    user: { id: 4, name: '王芳', avatar: '/toux2.jpg', phone: '13698765432', isOnline: false },
    homestayId: 201,
    homestayTitle: '大理古城·苍山洱海观景别院',
    orderId: 1002,
    lastMessage: { content: '退房时间是几点？', type: 'text', timestamp: '2026-03-24T11:20:00', sender: 'user' },
    unreadCount: 1,
    type: 'consult',
    updatedAt: '2026-03-24T11:20:00',
    createdAt: '2026-03-23T16:00:00',
  },
  {
    id: 'conv_003',
    user: { id: 5, name: '赵伟', avatar: '/toux3.jpg', phone: '15823456789', isOnline: true },
    homestayId: 301,
    homestayTitle: '杭州西湖·隐居山水间',
    orderId: 1003,
    lastMessage: { content: '投诉：房间卫生太差，要求全额退款', type: 'text', timestamp: '2026-03-23T20:00:00', sender: 'user' },
    unreadCount: 3,
    type: 'complaint',
    complaintInfo: {
      complaintId: 1,
      orderId: 1003,
      status: 'processing',
      reason: '房间卫生太差，要求全额退款',
      evidenceImages: [
        '/cha1.png',
        '/cha2.png',
      ],
      refundAmount: 1960,
      deadline: '2026-03-25T10:30:00',
    },
    updatedAt: '2026-03-23T20:00:00',
    createdAt: '2026-03-23T19:00:00',
  },
  {
    id: 'conv_004',
    user: { id: 6, name: '陈静', avatar: '/toux4.jpeg', phone: '13734567890', isOnline: false },
    homestayId: 401,
    homestayTitle: '厦门鼓浪屿·百年别墅',
    orderId: 1004,
    lastMessage: { content: '好的，谢谢您！', type: 'text', timestamp: '2026-03-22T15:45:00', sender: 'host' },
    unreadCount: 0,
    type: 'consult',
    updatedAt: '2026-03-22T15:45:00',
    createdAt: '2026-03-20T10:00:00',
  },
  {
    id: 'conv_005',
    user: { id: 7, name: '刘洋', avatar: '/toux5.jpeg', phone: '13545678901', isOnline: true },
    homestayId: 102,
    homestayTitle: '成都宽窄巷子·复古小院',
    orderId: 1005,
    lastMessage: { content: '可以加一张婴儿床吗？', type: 'text', timestamp: '2026-03-24T09:10:00', sender: 'user' },
    unreadCount: 1,
    type: 'consult',
    updatedAt: '2026-03-24T09:10:00',
    createdAt: '2026-03-24T09:10:00',
  },
];

const messageMap: Record<string, any[]> = {
  conv_001: [
    { id: 'msg_001_1', conversationId: 'conv_001', sender: 'user', type: 'text', content: '您好，请问这个房间4月1日还有吗？', timestamp: '2026-03-24T09:00:00', isRead: true, status: 'sent' },
    { id: 'msg_001_2', conversationId: 'conv_001', sender: 'host', type: 'text', content: '您好！4月1日还有房的，欢迎预订哦~', timestamp: '2026-03-24T09:15:00', isRead: true, status: 'sent' },
    { id: 'msg_001_3', conversationId: 'conv_001', sender: 'user', type: 'text', content: '好的，我看一下，订两晚，大概下午几点可以入住？', timestamp: '2026-03-24T10:20:00', isRead: true, status: 'sent' },
    { id: 'msg_001_4', conversationId: 'conv_001', sender: 'host', type: 'text', content: '下午2点后可以入住，退房时间是中午12点之前', timestamp: '2026-03-24T10:35:00', isRead: true, status: 'sent' },
    { id: 'msg_001_5', conversationId: 'conv_001', sender: 'user', type: 'card', content: '', timestamp: '2026-03-24T10:40:00', isRead: true, status: 'sent', cardData: { homestayId: 101, title: '成都太古里·云端全景落地窗江景房', price: 458, coverImage: 'https://picsum.photos/seed/101/800/600', checkIn: '2026-04-01', checkOut: '2026-04-03' } },
    { id: 'msg_001_6', conversationId: 'conv_001', sender: 'user', type: 'text', content: '请问WiFi密码是多少？', timestamp: '2026-03-24T14:30:00', isRead: false, status: 'sent' },
  ],
  conv_002: [
    { id: 'msg_002_1', conversationId: 'conv_002', sender: 'user', type: 'text', content: '房东您好，明天就要入住了，想确认一下', timestamp: '2026-03-23T16:00:00', isRead: true, status: 'sent' },
    { id: 'msg_002_2', conversationId: 'conv_002', sender: 'host', type: 'text', content: '您好！欢迎入住，大理古城欢迎您的到来！地址：云南省大理白族自治州大理市大理古城博爱路58号', timestamp: '2026-03-23T16:20:00', isRead: true, status: 'sent' },
    { id: 'msg_002_3', conversationId: 'conv_002', sender: 'user', type: 'text', content: '退房时间是几点？', timestamp: '2026-03-24T11:20:00', isRead: false, status: 'sent' },
  ],
  conv_003: [
    { id: 'msg_003_1', conversationId: 'conv_003', sender: 'user', type: 'text', content: '房东您好，我昨天入住了，发现房间卫生太差，枕头和床单都很脏', timestamp: '2026-03-23T19:00:00', isRead: true, status: 'sent' },
    { id: 'msg_003_2', conversationId: 'conv_003', sender: 'host', type: 'text', content: '您好，非常抱歉给您带来不好的体验，我们会立即安排清洁人员处理', timestamp: '2026-03-23T19:30:00', isRead: true, status: 'sent' },
    { id: 'msg_003_3', conversationId: 'conv_003', sender: 'user', type: 'text', content: '我拍了照片，这是证据', timestamp: '2026-03-23T19:35:00', isRead: true, status: 'sent' },
    { id: 'msg_003_4', conversationId: 'conv_003', sender: 'user', type: 'image', content: '', imageUrl: 'https://picsum.photos/seed/clean1/400/300', timestamp: '2026-03-23T19:36:00', isRead: true, status: 'sent' },
    { id: 'msg_003_5', conversationId: 'conv_003', sender: 'user', type: 'image', content: '', imageUrl: 'https://picsum.photos/seed/clean2/400/300', timestamp: '2026-03-23T19:37:00', isRead: true, status: 'sent' },
    { id: 'msg_003_6', conversationId: 'conv_003', sender: 'user', type: 'text', content: '投诉：房间卫生太差，要求全额退款', timestamp: '2026-03-23T20:00:00', isRead: false, status: 'sent' },
    { id: 'msg_003_7', conversationId: 'conv_003', sender: 'system', type: 'system', content: '投诉已提交，平台将在24小时内介入处理', timestamp: '2026-03-23T20:00:01', isRead: true, status: 'sent' },
  ],
  conv_004: [
    { id: 'msg_004_1', conversationId: 'conv_004', sender: 'user', type: 'text', content: '感谢房东的热情接待，房间很棒！', timestamp: '2026-03-22T15:40:00', isRead: true, status: 'sent' },
    { id: 'msg_004_2', conversationId: 'conv_004', sender: 'host', type: 'text', content: '好的，谢谢您！', timestamp: '2026-03-22T15:45:00', isRead: true, status: 'sent' },
  ],
  conv_005: [
    { id: 'msg_005_1', conversationId: 'conv_005', sender: 'user', type: 'text', content: '可以加一张婴儿床吗？', timestamp: '2026-03-24T09:10:00', isRead: false, status: 'sent' },
  ],
};

// 系统通知
const systemNotifications = [
  { id: 1, type: 'order', title: '新订单通知', content: '您有一笔新订单，订单号 ORDER20260324001，用户张三已支付，请尽快确认', relatedId: 1006, isRead: false, createdAt: '2026-03-24T08:30:00' },
  { id: 2, type: 'review', title: '新评论通知', content: '用户王五对"成都太古里·云端全景落地窗江景房"发表了5星好评', relatedId: 101, isRead: false, createdAt: '2026-03-23T20:15:00' },
  { id: 3, type: 'audit', title: '审核通过通知', content: '您提交的新房源"成都九眼桥·轻奢河景公寓"已审核通过，已上线销售', relatedId: 104, isRead: true, createdAt: '2026-03-22T10:00:00' },
  { id: 4, type: 'finance', title: '提现到账通知', content: '您于2026-03-20申请的提现 ¥8,000 已到账，请查收', relatedId: undefined, isRead: true, createdAt: '2026-03-20T11:30:00' },
  { id: 5, type: 'system', title: '系统维护通知', content: '平台将于2026-03-25 02:00-04:00进行系统维护，届时部分功能可能暂时无法使用', relatedId: undefined, isRead: true, createdAt: '2026-03-24T12:00:00' },
];

// 会话列表 API
Mock.mock('/api/host/conversations', 'get', () => ({
  code: 200,
  data: conversationList,
  message: 'success',
  timestamp: Date.now(),
}));

// 会话消息列表 API（必须在「单会话详情」之前注册，且详情路由不能匹配 .../messages）
Mock.mock(/\/api\/host\/conversations\/([^/]+)\/messages/, 'get', (options: any) => {
  const id = options.url.match(/\/api\/host\/conversations\/(.+)\/messages/)?.[1];
  const msgs = messageMap[id] || [];
  return { code: 200, data: msgs, message: 'success', timestamp: Date.now() };
});

// 单个会话详情 API（仅匹配 /api/host/conversations/:id，不含 /messages）
Mock.mock(/\/api\/host\/conversations\/([^/]+)$/, 'get', (options: any) => {
  const id = options.url.match(/\/api\/host\/conversations\/([^/?]+)/)?.[1];
  const conv = conversationList.find(c => c.id === id);
  if (!conv) return { code: 404, data: null, message: '会话不存在', timestamp: Date.now() };
  return { code: 200, data: conv, message: 'success', timestamp: Date.now() };
});

// 发送消息 API
Mock.mock('/api/host/messages/send', 'post', (options: any) => {
  const body = JSON.parse(options.body);
  const newMsg = {
    id: `msg_${Date.now()}`,
    conversationId: body.conversationId,
    sender: 'host',
    type: body.type || 'text',
    content: body.content || '',
    imageUrl: body.imageUrl || '',
    timestamp: new Date().toISOString(),
    isRead: false,
    status: 'sent',
  };
  // 追加到消息列表
  if (!messageMap[body.conversationId]) messageMap[body.conversationId] = [];
  const msgs = messageMap[body.conversationId]!;
  msgs.push(newMsg);
  // 更新会话最后消息
  const conv = conversationList.find(c => c.id === body.conversationId);
  if (conv) {
    conv.lastMessage = { content: body.type === 'image' ? '[图片]' : body.content, type: body.type || 'text', timestamp: newMsg.timestamp, sender: 'host' };
    conv.updatedAt = newMsg.timestamp;
  }
  return { code: 200, data: newMsg, message: '发送成功', timestamp: Date.now() };
});

// 标记已读 API
Mock.mock('/api/host/conversations/read', 'post', (options: any) => {
  const body = JSON.parse(options.body);
  const conv = conversationList.find(c => c.id === body.conversationId);
  if (conv) conv.unreadCount = 0;
  const msgs = messageMap[body.conversationId];
  if (msgs) msgs.forEach(m => { m.isRead = true; });
  return { code: 200, data: null, message: '已读', timestamp: Date.now() };
});

// 撤回消息 API
Mock.mock('/api/host/messages/recall', 'post', (options: any) => {
  const body = JSON.parse(options.body);
  const msgs = messageMap[body.conversationId] || [];
  const msg = msgs.find(m => m.id === body.messageId);
  if (msg) {
    msg.status = 'recalled';
    msg.isRecalled = true;
    msg.recalledAt = new Date().toISOString();
  }
  return { code: 200, data: null, message: '已撤回', timestamp: Date.now() };
});

// 系统通知列表 API
Mock.mock('/api/host/notifications', 'get', () => ({
  code: 200,
  data: systemNotifications,
  message: 'success',
  timestamp: Date.now(),
}));
