<template>
  <div class="user-management-page">
    <!-- 顶部筛选栏 -->
    <el-card shadow="never" class="filter-card">
      <!-- 角色切换标签 -->
      <div class="filter-row">
        <el-radio-group v-model="filterRole" class="role-tabs">
          <el-radio-button value="all">全部用户</el-radio-button>
          <el-radio-button value="user">普通用户</el-radio-button>
          <el-radio-button value="landlord">房东</el-radio-button>
        </el-radio-group>

        <div class="filter-right">
          <!-- 时间筛选 -->
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="注册开始"
            end-placeholder="注册结束"
            value-format="YYYY-MM-DD"
            size="default"
            style="width: 260px"
          />
        </div>
      </div>

      <div class="filter-row">
        <!-- 搜索框 -->
        <el-input
          v-model="searchKeyword"
          placeholder="搜索手机号/昵称/用户ID"
          prefix-icon="Search"
          clearable
          style="width: 280px"
          @keyup.enter="handleSearch"
        />

        <!-- 状态筛选 -->
        <el-select v-model="filterStatus" placeholder="账号状态" clearable style="width: 140px">
          <el-option label="全部状态" value="" />
          <el-option label="正常" value="normal">
            <span class="status-dot normal" />正常
          </el-option>
          <el-option label="已警告" value="warned">
            <span class="status-dot warned" />已警告
          </el-option>
          <el-option label="已限制" value="restricted">
            <span class="status-dot restricted" />已限制
          </el-option>
          <el-option label="已封禁" value="banned">
            <span class="status-dot banned" />已封禁
          </el-option>
        </el-select>

        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </el-card>

    <!-- 批量操作栏 -->
    <div v-if="selectedUsers.length > 0" class="batch-action-bar">
      <span class="selected-count">已选择 {{ selectedUsers.length }} 项</span>
      <el-button size="small" @click="batchWarn" :disabled="!canBatchWarn">
        批量警告
      </el-button>
      <el-button size="small" @click="batchRestrict" :disabled="!canBatchRestrict">
        批量限制
      </el-button>
      <el-button size="small" @click="handleBatchExport">
        批量导出
      </el-button>
      <el-button size="small" link @click="clearSelection">取消选择</el-button>
    </div>

    <!-- 用户列表 -->
    <el-card shadow="never" class="table-card">
      <el-table
        ref="tableRef"
        :data="filteredUserList"
        @selection-change="handleSelectionChange"
        v-loading="loading"
        row-class-name="user-row"
      >
        <el-table-column type="selection" width="55" fixed />

        <!-- 用户信息 -->
        <el-table-column label="用户信息" min-width="180" fixed>
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="40" :src="row.avatar">
                {{ row.nickname.charAt(0) }}
              </el-avatar>
              <div class="user-info">
                <span class="nickname">{{ row.nickname }}</span>
                <span class="user-id">ID: {{ row.id }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 角色 -->
        <el-table-column label="角色" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.role === 'landlord'" type="warning" effect="dark">
              <el-icon><Shop /></el-icon>
              房东
            </el-tag>
            <el-tag v-else type="primary">普通用户</el-tag>
          </template>
        </el-table-column>

        <!-- 联系方式 -->
        <el-table-column label="联系方式" width="180">
          <template #default="{ row }">
            <div class="contact-info">
              <div class="phone">{{ maskPhone(row.phone) }}</div>
              <div v-if="row.email" class="email">{{ row.email }}</div>
            </div>
          </template>
        </el-table-column>

        <!-- 账号状态 -->
        <el-table-column label="账号状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 房东专属：资质状态 -->
        <el-table-column
          v-if="filterRole !== 'user'"
          label="资质状态"
          width="100"
        >
          <template #default="{ row }">
            <template v-if="row.role === 'landlord'">
              <el-tag :type="getQualifyTagType(row.qualifyStatus)" size="small">
                {{ getQualifyText(row.qualifyStatus) }}
              </el-tag>
            </template>
          </template>
        </el-table-column>

        <!-- 关键指标 -->
        <el-table-column label="关键指标" min-width="200">
          <template #default="{ row }">
            <template v-if="row.role === 'user'">
              <span class="stat-item">
                <span class="stat-label">订单</span>
                <span class="stat-value">{{ row.stats.orderCount }}</span>
              </span>
              <span class="stat-item">
                <span class="stat-label">投诉</span>
                <span class="stat-value" :class="{ danger: row.stats.complaintCount > 0 }">
                  {{ row.stats.complaintCount }}
                </span>
              </span>
              <span class="stat-item">
                <span class="stat-label">注册</span>
                <span class="stat-value">{{ formatDate(row.registerTime) }}</span>
              </span>
            </template>
            <template v-else-if="row.role === 'landlord'">
              <span class="stat-item">
                <span class="stat-label">房源</span>
                <span class="stat-value">{{ row.stats.homestayCount }}</span>
              </span>
              <span class="stat-item">
                <span class="stat-label">订单</span>
                <span class="stat-value">{{ row.stats.orderCount }}</span>
              </span>
              <span class="stat-item">
                <span class="stat-label">被投诉</span>
                <span class="stat-value" :class="{ danger: row.stats.complaintCount > 0 }">
                  {{ row.stats.complaintCount }}
                </span>
              </span>
              <span class="stat-item">
                <span class="stat-label">信用</span>
                <span class="stat-value" :class="{ danger: (row.stats.avgRating || 0) < 4 }">
                  {{ (row.stats.avgRating || 0).toFixed(1) }}
                </span>
              </span>
            </template>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openDetail(row)">
              查看详情
            </el-button>
            <el-dropdown trigger="click" @command="(cmd: any) => handleCommand(cmd, row)">
              <el-button type="primary" link size="small">
                更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="warn" :disabled="row.status !== 'normal'">
                    <el-icon><Warning /></el-icon>发送警告
                  </el-dropdown-item>
                  <el-dropdown-item command="restrict" :disabled="row.status === 'banned'">
                    <el-icon><Lock /></el-icon>限制功能
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="row.status !== 'normal' && row.status !== 'banned'"
                    command="unrestrict"
                  >
                    <el-icon><Unlock /></el-icon>解除限制
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="row.status === 'banned'"
                    command="unban"
                  >
                    <el-icon><CircleCheck /></el-icon>解除封禁
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="row.status !== 'banned'"
                    command="ban"
                    divided
                    style="color: #f5222d"
                  >
                    <el-icon><CircleClose /></el-icon>封禁账号
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalCount"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 用户详情抽屉 -->
    <UserDetailDrawer
      v-model="detailDrawerVisible"
      :user="currentUser"
      @punish="handlePunish"
    />

    <!-- 警告弹窗 -->
    <el-dialog v-model="warnDialogVisible" title="发送警告" width="500px">
      <el-form :model="warnForm" label-position="top">
        <el-form-item label="警告原因" required>
          <el-radio-group v-model="warnForm.reason">
            <el-radio value="violation_content">发布违规内容</el-radio>
            <el-radio value="malicious_complaint">恶意投诉</el-radio>
            <el-radio value="harassment">骚扰他人</el-radio>
            <el-radio value="other">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="警告说明">
          <el-input
            v-model="warnForm.description"
            type="textarea"
            :rows="3"
            placeholder="请详细说明警告原因..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="warnDialogVisible = false">取消</el-button>
        <el-button type="warning" @click="confirmWarn">确认发送</el-button>
      </template>
    </el-dialog>

    <!-- 限制功能弹窗 -->
    <el-dialog v-model="restrictDialogVisible" title="限制功能" width="550px">
      <el-form :model="restrictForm" label-position="top">
        <el-form-item label="限制范围" required>
          <el-checkbox-group v-model="restrictForm.scope">
            <el-checkbox v-if="currentUser?.role === 'user'" value="order">禁止下单</el-checkbox>
            <el-checkbox v-if="currentUser?.role === 'landlord'" value="publish">禁止发布房源</el-checkbox>
            <el-checkbox v-if="currentUser?.role === 'landlord'" value="withdraw">禁止提现</el-checkbox>
            <el-checkbox value="comment">禁止评论</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="限制时长" required>
          <el-radio-group v-model="restrictForm.duration">
            <el-radio :value="7">7天</el-radio>
            <el-radio :value="30">30天</el-radio>
            <el-radio :value="0">永久</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="限制原因" required>
          <el-input
            v-model="restrictForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请说明限制原因..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="restrictDialogVisible = false">取消</el-button>
        <el-button type="warning" @click="confirmRestrict">确认限制</el-button>
      </template>
    </el-dialog>

    <!-- 封禁账号弹窗 -->
    <el-dialog v-model="banDialogVisible" title="封禁账号" width="550px" class="ban-dialog">
      <div class="ban-warning">
        <el-alert type="error" :closable="false" show-icon>
          <template #title>
            封禁后该账号将无法登录，是否确认？
          </template>
        </el-alert>
      </div>
      <el-form :model="banForm" label-position="top">
        <el-form-item label="封禁原因" required>
          <el-radio-group v-model="banForm.reason">
            <el-radio value="fraud">欺诈行为</el-radio>
            <el-radio value="serious_violation">严重违规（黄赌毒等）</el-radio>
            <el-radio value="multiple_breach">多次违约</el-radio>
            <el-radio value="fake_identity">身份信息虚假</el-radio>
            <el-radio value="other">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="详细说明" required>
          <el-input
            v-model="banForm.description"
            type="textarea"
            :rows="4"
            placeholder="请详细说明封禁原因，用于后续申诉核查..."
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="banForm.unbanRelated">
            同时封禁关联账号（同设备/同IP注册的其他账号）
          </el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="banDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmBan">确认封禁</el-button>
      </template>
    </el-dialog>

    <!-- 解除处罚弹窗 -->
    <el-dialog v-model="unpunishDialogVisible" title="解除处罚" width="500px">
      <el-form :model="unpunishForm" label-position="top">
        <el-form-item label="当前状态">
          <el-tag :type="getStatusTagType(currentUser?.status || 'normal')">
            {{ getStatusText(currentUser?.status || 'normal') }}
          </el-tag>
        </el-form-item>
        <el-form-item label="解除原因" required>
          <el-input
            v-model="unpunishForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请说明解除处罚的原因..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="unpunishDialogVisible = false">取消</el-button>
        <el-button type="success" @click="confirmUnpunish">确认解除</el-button>
      </template>
    </el-dialog>

    <!-- 批量警告弹窗 -->
    <el-dialog v-model="batchWarnDialogVisible" title="批量警告" width="500px">
      <p>即将对 {{ selectedUsers.length }} 个账号发送警告。</p>
      <el-form :model="batchWarnForm" label-position="top" style="margin-top: 16px">
        <el-form-item label="警告原因" required>
          <el-radio-group v-model="batchWarnForm.reason">
            <el-radio value="violation_content">发布违规内容</el-radio>
            <el-radio value="malicious_complaint">恶意投诉</el-radio>
            <el-radio value="other">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="警告说明">
          <el-input
            v-model="batchWarnForm.description"
            type="textarea"
            :rows="3"
            placeholder="请详细说明警告原因..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchWarnDialogVisible = false">取消</el-button>
        <el-button type="warning" @click="confirmBatchWarn">确认批量警告</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { Search, Shop, Warning, Lock, Unlock, CircleCheck, CircleClose, ArrowDown } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type {
  UserDetail,
  UserRole,
  UserStatus,
  PunishAction,
  PunishReason,
  RestrictScope,
  RestrictDuration
} from '@/types';

// 引入详情抽屉组件
import UserDetailDrawer from './components/UserDetailDrawer.vue';

// 状态
const loading = ref(false);
const filterRole = ref<UserRole | 'all'>('all');
const filterStatus = ref<UserStatus | ''>('');
const searchKeyword = ref('');
const dateRange = ref<[string, string] | null>(null);
const selectedUsers = ref<UserDetail[]>([]);
const currentUser = ref<UserDetail | null>(null);

// 分页
const currentPage = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);

// 弹窗状态
const detailDrawerVisible = ref(false);
const warnDialogVisible = ref(false);
const restrictDialogVisible = ref(false);
const banDialogVisible = ref(false);
const unpunishDialogVisible = ref(false);
const batchWarnDialogVisible = ref(false);

// 表单数据
const warnForm = reactive({
  reason: '' as PunishReason | '',
  description: ''
});

const restrictForm = reactive({
  scope: [] as RestrictScope[],
  duration: 7 as RestrictDuration,
  reason: ''
});

const banForm = reactive({
  reason: '' as PunishReason | '',
  description: '',
  unbanRelated: false
});

const unpunishForm = reactive({
  reason: ''
});

const batchWarnForm = reactive({
  reason: '' as PunishReason | '',
  description: ''
});

// 模拟用户数据
const userList = ref<UserDetail[]>([
  {
    id: 101,
    nickname: '张三',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhangSan',
    phone: '13812345678',
    email: 'zhangsan@example.com',
    role: 'user',
    status: 'normal',
    registerTime: '2024-01-15',
    stats: { orderCount: 12, complaintCount: 0, totalSpent: 5800, cancelRate: 0.05, avgRating: 4.8 },
    violations: [],
    loginRecords: [
      { id: 1, time: '2025-03-20 10:30', ip: '192.168.1.100', device: 'iPhone 15 Pro', location: '四川成都' },
      { id: 2, time: '2025-03-19 15:20', ip: '192.168.1.100', device: 'Windows Chrome', location: '四川成都' }
    ],
    statusHistory: []
  },
  {
    id: 102,
    nickname: '李四',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiSi',
    phone: '13987654321',
    email: 'lisi@example.com',
    role: 'user',
    status: 'warned',
    registerTime: '2024-03-20',
    stats: { orderCount: 5, complaintCount: 2, totalSpent: 2500, cancelRate: 0.2, avgRating: 3.5 },
    violations: [
      { id: 1, time: '2025-03-10 14:00', type: 'warning', reason: '恶意投诉', description: '多次恶意投诉房东', operator: 'admin_001' }
    ],
    loginRecords: [],
    statusHistory: [
      { id: 1, time: '2025-03-10 14:00', fromStatus: 'normal', toStatus: 'warned', reason: '恶意投诉', operator: 'admin_001' }
    ]
  },
  {
    id: 201,
    nickname: '王强房东',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WangQiang',
    phone: '13722223333',
    email: 'wangqiang@example.com',
    role: 'landlord',
    status: 'normal',
    registerTime: '2023-06-10',
    qualifyStatus: 'qualified',
    businessStatus: 'open',
    stats: {
      homestayCount: 3,
      orderCount: 156,
      complaintCount: 0,
      totalRevenue: 280000,
      completionRate: 0.98,
      avgRating: 4.9,
      positiveRate: 0.95
    },
    violations: [],
    loginRecords: [],
    statusHistory: [],
    homestays: [
      { id: 1001, title: '市中心豪华公寓', status: 1 },
      { id: 1002, title: '近郊花园别墅', status: 1 },
      { id: 1003, title: '景区特色民宿', status: 0 }
    ]
  },
  {
    id: 202,
    nickname: '刘芳民宿',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiuFang',
    phone: '13655556666',
    email: 'liufang@example.com',
    role: 'landlord',
    status: 'restricted',
    registerTime: '2023-08-15',
    qualifyStatus: 'qualified',
    businessStatus: 'open',
    stats: {
      homestayCount: 2,
      orderCount: 89,
      complaintCount: 3,
      totalRevenue: 156000,
      completionRate: 0.95,
      avgRating: 4.6,
      positiveRate: 0.88
    },
    violations: [
      { id: 1, time: '2025-02-20 10:00', type: 'restrict', reason: '房源信息虚假', description: '房源描述与实际不符', operator: 'admin_001', duration: 30, expireTime: '2025-03-22' }
    ],
    loginRecords: [],
    statusHistory: [
      { id: 1, time: '2025-02-20 10:00', fromStatus: 'normal', toStatus: 'restricted', reason: '房源信息虚假', operator: 'admin_001' }
    ],
    homestays: [
      { id: 2001, title: '海边度假小屋', status: 1 }
    ]
  },
  {
    id: 203,
    nickname: '陈大明',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ChenDaMing',
    phone: '13599998888',
    email: 'chendaming@example.com',
    role: 'landlord',
    status: 'banned',
    registerTime: '2023-05-01',
    qualifyStatus: 'rejected',
    businessStatus: 'closed',
    stats: {
      homestayCount: 0,
      orderCount: 45,
      complaintCount: 8,
      totalRevenue: 0,
      completionRate: 0.8,
      avgRating: 2.1,
      positiveRate: 0.4
    },
    violations: [
      { id: 1, time: '2025-01-15 09:00', type: 'warning', reason: '服务态度差', operator: 'admin_001' },
      { id: 2, time: '2025-02-01 11:00', type: 'restrict', reason: '多次违规', operator: 'admin_001', duration: 7 },
      { id: 3, time: '2025-03-01 14:00', type: 'ban', reason: '欺诈行为', description: '骗取房客押金', operator: 'admin_super' }
    ],
    loginRecords: [],
    statusHistory: []
  },
  {
    id: 103,
    nickname: '赵小梅',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhaoXiaoMei',
    phone: '18811112222',
    role: 'user',
    status: 'normal',
    registerTime: '2024-06-20',
    stats: { orderCount: 8, complaintCount: 0, totalSpent: 4200, cancelRate: 0, avgRating: 5.0 },
    violations: [],
    loginRecords: [],
    statusHistory: []
  }
]);

// 计算属性
const filteredUserList = computed(() => {
  let result = userList.value;

  // 角色筛选
  if (filterRole.value !== 'all') {
    result = result.filter(u => u.role === filterRole.value);
  }

  // 状态筛选
  if (filterStatus.value) {
    result = result.filter(u => u.status === filterStatus.value);
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(u =>
      u.nickname.toLowerCase().includes(keyword) ||
      u.phone.includes(keyword) ||
      String(u.id).includes(keyword)
    );
  }

  // 时间范围筛选
  if (dateRange.value) {
    const [start, end] = dateRange.value;
    result = result.filter(u => u.registerTime >= start && u.registerTime <= end);
  }

  totalCount.value = result.length;
  return result;
});

const canBatchWarn = computed(() => {
  return selectedUsers.value.every(u => u.status === 'normal');
});

const canBatchRestrict = computed(() => {
  return selectedUsers.value.some(u => u.status !== 'banned');
});

// 方法
function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

function formatDate(date: string): string {
  return date.slice(5); // MM-DD格式
}

function getStatusTagType(status: UserStatus) {
  const map: Record<UserStatus, string> = {
    normal: 'success',
    warned: 'warning',
    restricted: '',
    banned: 'danger'
  };
  return map[status];
}

function getStatusText(status: UserStatus) {
  const map: Record<UserStatus, string> = {
    normal: '正常',
    warned: '已警告',
    restricted: '已限制',
    banned: '已封禁'
  };
  return map[status];
}

function getQualifyTagType(status: string) {
  const map: Record<string, string> = {
    qualified: 'success',
    pending: 'warning',
    unqualified: 'info',
    rejected: 'danger'
  };
  return map[status] || 'info';
}

function getQualifyText(status: string) {
  const map: Record<string, string> = {
    qualified: '已认证',
    pending: '认证中',
    unqualified: '未认证',
    rejected: '认证失败'
  };
  return map[status] || status;
}

function handleSearch() {
  currentPage.value = 1;
}

function handleReset() {
  filterRole.value = 'all';
  filterStatus.value = '';
  searchKeyword.value = '';
  dateRange.value = null;
  currentPage.value = 1;
}

function handleSelectionChange(selection: UserDetail[]) {
  selectedUsers.value = selection;
}

function clearSelection() {
  selectedUsers.value = [];
}

function handlePageChange(page: number) {
  currentPage.value = page;
}

function handleSizeChange(size: number) {
  pageSize.value = size;
  currentPage.value = 1;
}

function openDetail(user: UserDetail) {
  currentUser.value = user;
  detailDrawerVisible.value = true;
}

function handleCommand(command: string, user: UserDetail) {
  currentUser.value = user;
  switch (command) {
    case 'warn':
      warnForm.reason = '';
      warnForm.description = '';
      warnDialogVisible.value = true;
      break;
    case 'restrict':
      restrictForm.scope = [];
      restrictForm.duration = 7;
      restrictForm.reason = '';
      restrictDialogVisible.value = true;
      break;
    case 'ban':
      banForm.reason = '';
      banForm.description = '';
      banForm.unbanRelated = false;
      banDialogVisible.value = true;
      break;
    case 'unrestrict':
    case 'unban':
      unpunishForm.reason = '';
      unpunishDialogVisible.value = true;
      break;
  }
}

function confirmWarn() {
  if (!warnForm.reason) {
    ElMessage.warning('请选择警告原因');
    return;
  }
  ElMessage.success(`已向 ${currentUser.value?.nickname} 发送警告`);
  warnDialogVisible.value = false;
}

function confirmRestrict() {
  if (restrictForm.scope.length === 0) {
    ElMessage.warning('请选择限制范围');
    return;
  }
  if (!restrictForm.reason) {
    ElMessage.warning('请填写限制原因');
    return;
  }
  const durationText = restrictForm.duration === 0 ? '永久' : `${restrictForm.duration}天`;
  ElMessage.success(`已限制 ${currentUser.value?.nickname} 的相关功能（${durationText}）`);
  restrictDialogVisible.value = false;
}

function confirmBan() {
  if (!banForm.reason) {
    ElMessage.warning('请选择封禁原因');
    return;
  }
  if (!banForm.description) {
    ElMessage.warning('请填写详细说明');
    return;
  }
  ElMessageBox.confirm(
    `确定封禁账号"${currentUser.value?.nickname}"吗？封禁后该账号将无法登录。`,
    '确认封禁',
    { type: 'error', confirmButtonText: '确认封禁' }
  ).then(() => {
    ElMessage.success(`已封禁账号 ${currentUser.value?.nickname}`);
    banDialogVisible.value = false;
  }).catch(() => {});
}

function confirmUnpunish() {
  if (!unpunishForm.reason) {
    ElMessage.warning('请填写解除原因');
    return;
  }
  ElMessage.success(`已解除对 ${currentUser.value?.nickname} 的处罚`);
  unpunishDialogVisible.value = false;
}

function handlePunish(params: any) {
  console.log('处罚操作:', params);
}

function batchWarn() {
  batchWarnForm.reason = '';
  batchWarnForm.description = '';
  batchWarnDialogVisible.value = true;
}

function confirmBatchWarn() {
  if (!batchWarnForm.reason) {
    ElMessage.warning('请选择警告原因');
    return;
  }
  ElMessage.success(`已向 ${selectedUsers.value.length} 个账号发送警告`);
  batchWarnDialogVisible.value = false;
}

function batchRestrict() {
  ElMessage.info('批量限制功能开发中');
}

function handleBatchExport() {
  ElMessage.success(`已导出 ${selectedUsers.value.length} 条用户数据`);
}

// 初始化
onMounted(() => {
  totalCount.value = userList.value.length;
});
</script>

<style scoped lang="scss">
.user-management-page {
  .filter-card {
    margin-bottom: 16px;

    .filter-row {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;

      &:not(:last-child) {
        margin-bottom: 16px;
      }
    }

    .filter-right {
      margin-left: auto;
    }
  }

  .batch-action-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: #e6f7ff;
    border: 1px solid #91d5ff;
    border-radius: 4px;
    margin-bottom: 16px;

    .selected-count {
      color: #1890ff;
      font-weight: 500;
    }
  }

  .table-card {
    :deep(.el-table) {
      .user-row {
        &.warning-row {
          background-color: #fffbe6;
        }

        &.danger-row {
          background-color: #fff1f0;
        }
      }
    }
  }

  .user-cell {
    display: flex;
    align-items: center;
    gap: 12px;

    .user-info {
      display: flex;
      flex-direction: column;

      .nickname {
        font-weight: 500;
        color: #262626;
      }

      .user-id {
        font-size: 12px;
        color: #8c8c8c;
      }
    }
  }

  .contact-info {
    .phone {
      color: #262626;
    }

    .email {
      font-size: 12px;
      color: #8c8c8c;
    }
  }

  .stat-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-right: 12px;

    .stat-label {
      font-size: 12px;
      color: #8c8c8c;
    }

    .stat-value {
      font-size: 13px;
      color: #262626;
      font-weight: 500;

      &.danger {
        color: #f5222d;
      }
    }
  }

  .pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;

  &.normal {
    background: #52c41a;
  }

  &.warned {
    background: #faad14;
  }

  &.restricted {
    background: #fa8c16;
  }

  &.banned {
    background: #f5222d;
  }
}

.ban-dialog {
  :deep(.el-dialog__body) {
    .ban-warning {
      margin-bottom: 20px;
    }
  }
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;

  .el-icon {
    margin-right: 4px;
  }
}
</style>
