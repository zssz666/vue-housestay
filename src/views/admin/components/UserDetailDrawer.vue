<template>
  <el-drawer
    v-model="visible"
    direction="rtl"
    :size="550"
    :show-close="false"
    class="user-detail-drawer"
  >
    <!-- 顶部 -->
    <template #header>
      <div class="drawer-header">
        <span class="title">用户详情</span>
        <el-button :icon="Close" circle @click="handleClose" />
      </div>
    </template>

    <el-scrollbar v-if="user" class="drawer-body">
      <!-- 基本信息卡片 -->
      <div class="info-card">
        <div class="user-header">
          <el-avatar :size="80" :src="user.avatar">
            {{ user.nickname.charAt(0) }}
          </el-avatar>
          <div class="user-basic">
            <div class="nickname">{{ user.nickname }}</div>
            <div class="user-id">ID: {{ user.id }}</div>
            <el-tag :type="getStatusTagType(user.status)" size="small">
              {{ getStatusText(user.status) }}
            </el-tag>
          </div>
        </div>

        <el-divider />

        <div class="info-grid">
          <div class="info-item">
            <span class="label">真实姓名</span>
            <span class="value">{{ user.realName || '未填写' }}</span>
          </div>
          <div class="info-item">
            <span class="label">身份证号</span>
            <span class="value">{{ maskIdCard(user.idCard) || '未填写' }}</span>
          </div>
          <div class="info-item">
            <span class="label">手机号</span>
            <span class="value">{{ maskPhone(user.phone) }}</span>
          </div>
          <div class="info-item">
            <span class="label">邮箱</span>
            <span class="value">{{ user.email || '未绑定' }}</span>
          </div>
          <div class="info-item">
            <span class="label">注册时间</span>
            <span class="value">{{ user.registerTime }}</span>
          </div>
          <div class="info-item">
            <span class="label">用户角色</span>
            <span class="value">
              <el-tag v-if="user.role === 'landlord'" type="warning" size="small">房东</el-tag>
              <el-tag v-else type="primary" size="small">普通用户</el-tag>
            </span>
          </div>
        </div>
      </div>

      <!-- 账号状态历史 -->
      <div class="info-card">
        <div class="card-title">账号状态变更历史</div>
        <el-timeline v-if="user.statusHistory.length > 0" class="status-timeline">
          <el-timeline-item
            v-for="item in user.statusHistory"
            :key="item.id"
            :timestamp="item.time"
            placement="top"
          >
            <div class="timeline-content">
              <span class="action">{{ formatStatusChange(item) }}</span>
              <span class="reason">{{ item.reason }}</span>
              <span class="operator">操作员：{{ item.operator }}</span>
            </div>
          </el-timeline-item>
        </el-timeline>
        <div v-else class="no-data">暂无状态变更记录</div>
      </div>

      <!-- 数据统计 -->
      <div class="info-card">
        <div class="card-title">数据统计</div>
        <template v-if="user.role === 'user'">
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="累计消费">
              ¥{{ userStats.totalSpent?.toLocaleString() || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="订单数">
              {{ userStats.orderCount || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="取消率">
              {{ ((userStats.cancelRate || 0) * 100).toFixed(0) }}%
            </el-descriptions-item>
            <el-descriptions-item label="平均评分">
              {{ userStats.avgRating?.toFixed(1) || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="被投诉次数" :label-style="{ color: '#f5222d' }">
              {{ userStats.complaintCount || 0 }}
            </el-descriptions-item>
          </el-descriptions>
        </template>
        <template v-else>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="营收总额">
              ¥{{ landlordStats.totalRevenue?.toLocaleString() || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="房源数">
              {{ landlordStats.homestayCount || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="订单完成率">
              {{ ((landlordStats.completionRate || 0) * 100).toFixed(0) }}%
            </el-descriptions-item>
            <el-descriptions-item label="好评率">
              {{ ((landlordStats.positiveRate || 0) * 100).toFixed(0) }}%
            </el-descriptions-item>
            <el-descriptions-item label="被投诉次数" :label-style="{ color: '#f5222d' }">
              {{ landlordStats.complaintCount || 0 }}
            </el-descriptions-item>
          </el-descriptions>

          <!-- 房东专属：房源列表 -->
          <div v-if="user.homestays?.length" class="homestay-list">
            <div class="section-title">我的房源</div>
            <div v-for="h in user.homestays" :key="h.id" class="homestay-item">
              <span class="homestay-title">{{ h.title }}</span>
              <el-tag :type="h.status === 1 ? 'success' : 'info'" size="small">
                {{ h.status === 1 ? '营业中' : '已下线' }}
              </el-tag>
            </div>
          </div>
        </template>
      </div>

      <!-- 违规记录 -->
      <div class="info-card">
        <div class="card-title">违规记录</div>
        <div v-if="user.violations.length > 0" class="violation-list">
          <div v-for="v in user.violations" :key="v.id" class="violation-item">
            <div class="violation-header">
              <el-tag :type="getViolationTagType(v.type)" size="small">
                {{ getViolationText(v.type) }}
              </el-tag>
              <span class="violation-time">{{ v.time }}</span>
            </div>
            <div class="violation-content">
              <div class="violation-reason">
                <span class="label">原因：</span>
                <span class="value">{{ v.reason }}</span>
              </div>
              <div v-if="v.description" class="violation-desc">
                <span class="label">说明：</span>
                <span class="value">{{ v.description }}</span>
              </div>
              <div v-if="v.duration !== undefined" class="violation-duration">
                <span class="label">限制时长：</span>
                <span class="value">{{ v.duration === 0 ? '永久' : `${v.duration}天` }}</span>
              </div>
              <div class="violation-operator">操作员：{{ v.operator }}</div>
            </div>
          </div>
        </div>
        <div v-else class="no-data">暂无违规记录</div>
      </div>

      <!-- 登录日志 -->
      <div class="info-card">
        <div class="card-title">近期登录记录</div>
        <el-table
          v-if="user.loginRecords.length > 0"
          :data="user.loginRecords"
          size="small"
          class="login-table"
        >
          <el-table-column prop="time" label="时间" width="140" />
          <el-table-column prop="ip" label="IP地址" width="130" />
          <el-table-column prop="device" label="设备" min-width="120" />
          <el-table-column prop="location" label="位置" width="100" />
        </el-table>
        <div v-else class="no-data">暂无登录记录</div>
      </div>
    </el-scrollbar>

    <!-- 底部操作 -->
    <div class="drawer-footer">
      <el-button @click="handleWarn" :disabled="user?.status !== 'normal'">发送警告</el-button>
      <el-button @click="handleRestrict" :disabled="user?.status === 'banned'">限制功能</el-button>
      <el-button
        v-if="user?.status !== 'normal'"
        type="success"
        @click="handleUnpunish"
      >
        解除处罚
      </el-button>
      <el-button
        v-if="user?.status !== 'banned'"
        type="danger"
        @click="handleBan"
      >
        封禁账号
      </el-button>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Close } from '@element-plus/icons-vue';
import type {
  UserDetail,
  UserStats,
  LandlordStats,
  UserStatus
} from '@/types';

const props = defineProps<{
  modelValue: boolean;
  user?: UserDetail | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'punish', params: { userId: number; action: string }): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const userStats = computed<UserStats>(() => {
  return props.user?.stats as UserStats || {
    orderCount: 0,
    complaintCount: 0,
    totalSpent: 0,
    cancelRate: 0,
    avgRating: 0
  };
});

const landlordStats = computed<LandlordStats>(() => {
  return props.user?.stats as LandlordStats || {
    orderCount: 0,
    complaintCount: 0,
    homestayCount: 0,
    totalRevenue: 0,
    completionRate: 0,
    avgRating: 0,
    positiveRate: 0
  };
});

function handleClose() {
  visible.value = false;
}

function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

function maskIdCard(idCard?: string): string {
  if (!idCard) return '';
  if (idCard.length === 18) {
    return idCard.slice(0, 3) + '***********' + idCard.slice(-4);
  }
  return idCard;
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

function getViolationTagType(type: string) {
  const map: Record<string, string> = {
    warning: 'warning',
    restrict: '',
    ban: 'danger'
  };
  return map[type] || 'info';
}

function getViolationText(type: string) {
  const map: Record<string, string> = {
    warning: '警告',
    restrict: '限制',
    ban: '封禁'
  };
  return map[type] || type;
}

function formatStatusChange(item: any) {
  const fromMap: Record<string, string> = {
    normal: '正常',
    warned: '已警告',
    restricted: '已限制',
    banned: '已封禁'
  };
  const toMap: Record<string, string> = {
    normal: '恢复正常',
    warned: '警告',
    restricted: '限制',
    banned: '封禁'
  };
  return `账号由 ${fromMap[item.fromStatus]} → ${toMap[item.toStatus]}`;
}

function handleWarn() {
  emit('punish', { userId: props.user?.id || 0, action: 'warn' });
}

function handleRestrict() {
  emit('punish', { userId: props.user?.id || 0, action: 'restrict' });
}

function handleUnpunish() {
  emit('punish', { userId: props.user?.id || 0, action: 'unrestrict' });
}

function handleBan() {
  emit('punish', { userId: props.user?.id || 0, action: 'ban' });
}
</script>

<style scoped lang="scss">
.user-detail-drawer {
  :deep(.el-drawer__header) {
    margin-bottom: 0;
    padding: 0;
  }
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 20px;
  border-bottom: 1px solid #f0f0f0;

  .title {
    font-size: 16px;
    font-weight: 600;
  }
}

.drawer-body {
  height: calc(100vh - 120px);
  padding: 16px;
}

.info-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #f0f0f0;

  .card-title {
    font-size: 15px;
    font-weight: 600;
    color: #262626;
    margin-bottom: 16px;
  }
}

.user-header {
  display: flex;
  gap: 16px;
  align-items: center;

  .user-basic {
    .nickname {
      font-size: 18px;
      font-weight: 600;
      color: #262626;
      margin-bottom: 4px;
    }

    .user-id {
      font-size: 13px;
      color: #8c8c8c;
      margin-bottom: 8px;
    }
  }
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  .info-item {
    .label {
      display: block;
      font-size: 12px;
      color: #8c8c8c;
      margin-bottom: 4px;
    }

    .value {
      font-size: 14px;
      color: #262626;
    }
  }
}

.status-timeline {
  :deep(.el-timeline-item__content) {
    .timeline-content {
      padding: 8px 12px;
      background: #fafafa;
      border-radius: 4px;

      .action {
        display: block;
        font-weight: 500;
        color: #262626;
      }

      .reason {
        display: block;
        font-size: 13px;
        color: #595959;
        margin: 4px 0;
      }

      .operator {
        display: block;
        font-size: 12px;
        color: #8c8c8c;
      }
    }
  }
}

.no-data {
  text-align: center;
  color: #8c8c8c;
  padding: 20px 0;
}

.homestay-list {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;

  .section-title {
    font-size: 14px;
    font-weight: 500;
    color: #595959;
    margin-bottom: 12px;
  }

  .homestay-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px dashed #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .homestay-title {
      font-size: 14px;
      color: #262626;
    }
  }
}

.violation-list {
  .violation-item {
    padding: 12px;
    background: #fafafa;
    border-radius: 6px;
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }

    .violation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .violation-time {
        font-size: 12px;
        color: #8c8c8c;
      }
    }

    .violation-content {
      .violation-reason,
      .violation-desc,
      .violation-duration {
        font-size: 13px;
        margin-bottom: 4px;

        .label {
          color: #8c8c8c;
        }

        .value {
          color: #262626;
        }
      }

      .violation-operator {
        font-size: 12px;
        color: #8c8c8c;
        margin-top: 8px;
      }
    }
  }
}

.login-table {
  :deep(.el-table__header-wrapper) {
    th {
      background: #fafafa;
    }
  }
}

.drawer-footer {
  height: 60px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-top: 1px solid #f0f0f0;
  background: #fff;

  .el-button {
    flex: 1;
  }
}
</style>
