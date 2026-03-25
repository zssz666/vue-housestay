<template>
  <div class="dispute-page">
    <!-- 顶部导航 -->
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" link @click="goBack">返回列表</el-button>
        <el-divider direction="vertical" />
        <span class="dispute-id">纠纷编号：{{ disputeDetail.id }}</span>
      </div>
      <div class="header-right">
        <el-tag :type="getStatusTagType(disputeDetail.status)" size="large">
          {{ getStatusText(disputeDetail.status) }}
        </el-tag>
      </div>
    </div>

    <!-- 已裁决状态：显示裁决结果卡片 -->
    <div v-if="disputeDetail.status === 'resolved'" class="verdict-result-card">
      <div class="verdict-header">
        <el-icon :size="32" :color="disputeDetail.verdict?.result === 'reject' ? '#f5222d' : '#52c41a'">
          <component :is="disputeDetail.verdict?.result === 'reject' ? 'CircleClose' : 'CircleCheck'" />
        </el-icon>
        <span class="verdict-title">裁决已完成</span>
        <span class="verdict-time">{{ disputeDetail.verdict?.executedAt }}</span>
      </div>
      <div class="verdict-content">
        <div class="result-amount">
          <span class="label">退款金额：</span>
          <span class="value">¥{{ disputeDetail.verdict?.amount || 0 }}</span>
        </div>
        <div class="result-liability">
          <span class="label">责任判定：</span>
          <el-tag :type="getLiabilityTagType(disputeDetail.verdict?.liability || 'none')">
            {{ getLiabilityText(disputeDetail.verdict?.liability || 'none') }}
          </el-tag>
        </div>
        <div class="result-reason">
          <span class="label">裁决理由：</span>
          <span class="reason-text">{{ disputeDetail.verdict?.reason }}</span>
        </div>
      </div>
      <div class="refund-status">
        <span>退款状态：</span>
        <el-tag type="success">已完成</el-tag>
        <span class="time">{{ disputeDetail.verdict?.executedAt }}</span>
      </div>
    </div>

    <!-- 三栏布局 -->
    <el-row :gutter="20" class="three-column-layout">
      <!-- 左侧：当事人信息 -->
      <el-col :span="6">
        <div class="left-panel">
          <!-- 用户卡片 -->
          <el-card shadow="never" class="party-card user-card">
            <template #header>
              <div class="card-header">
                <span>用户（投诉方）</span>
                <el-tag type="warning" size="small">投诉人</el-tag>
              </div>
            </template>
            <div class="party-info">
              <el-avatar :size="60" :src="disputeDetail.user.avatar">
                {{ disputeDetail.user.name.charAt(0) }}
              </el-avatar>
              <div class="party-detail">
                <div class="name">{{ disputeDetail.user.name }}</div>
                <div class="phone">{{ maskPhone(disputeDetail.user.phone) }}</div>
              </div>
            </div>
            <el-divider />
            <div class="party-stats">
              <div class="stat-item">
                <span class="label">信用分：</span>
                <el-rate v-model="disputeDetail.user.creditScore" disabled show-score size="small" />
              </div>
              <div class="stat-item">
                <span class="label">历史投诉：</span>
                <span class="value" :class="{ highlight: disputeDetail.user.complaintCount > 0 }">
                  {{ disputeDetail.user.complaintCount }}次
                </span>
              </div>
            </div>
          </el-card>

          <!-- 房东卡片 -->
          <el-card shadow="never" class="party-card landlord-card">
            <template #header>
              <div class="card-header">
                <span>房东（被投诉方）</span>
                <el-tag size="small">被投诉</el-tag>
              </div>
            </template>
            <div class="party-info">
              <el-avatar :size="60" :src="disputeDetail.landlord.avatar">
                {{ disputeDetail.landlord.name.charAt(0) }}
              </el-avatar>
              <div class="party-detail">
                <div class="name">{{ disputeDetail.landlord.name }}</div>
                <div class="phone">{{ maskPhone(disputeDetail.landlord.phone) }}</div>
              </div>
            </div>
            <el-divider />
            <div class="party-stats">
              <div class="stat-item">
                <span class="label">信用分：</span>
                <el-rate v-model="disputeDetail.landlord.creditScore" disabled show-score size="small" />
              </div>
              <div class="stat-item">
                <span class="label">被投诉：</span>
                <span class="value" :class="{ highlight: disputeDetail.landlord.complaintCount > 0 }">
                  {{ disputeDetail.landlord.complaintCount }}次
                </span>
              </div>
            </div>
          </el-card>

          <!-- 订单快照 -->
          <el-card shadow="never" class="order-snapshot">
            <template #header>订单快照</template>
            <div class="snapshot-item">
              <span class="label">订单号：</span>
              <span class="value">{{ disputeDetail.order.orderId }}</span>
            </div>
            <div class="snapshot-item">
              <span class="label">房源：</span>
              <span class="value">{{ disputeDetail.order.homestayTitle }}</span>
            </div>
            <div class="snapshot-item">
              <span class="label">入住：</span>
              <span class="value">{{ disputeDetail.order.checkInDate }}</span>
            </div>
            <div class="snapshot-item">
              <span class="label">退房：</span>
              <span class="value">{{ disputeDetail.order.checkOutDate }}</span>
            </div>
            <div class="snapshot-item">
              <span class="label">订单金额：</span>
              <span class="value">¥{{ disputeDetail.order.totalAmount }}</span>
            </div>
            <el-divider />
            <div class="snapshot-item dispute-amount">
              <span class="label">用户诉求金额：</span>
              <span class="value amount">¥{{ disputeDetail.order.claimAmount }}</span>
            </div>
            <div class="dispute-type">
              <el-tag :type="getTypeTagType(disputeDetail.type)" size="small">
                {{ getTypeText(disputeDetail.type) }}
              </el-tag>
            </div>
          </el-card>
        </div>
      </el-col>

      <!-- 中间：证据与沟通区 -->
      <el-col :span="12">
        <div class="center-panel">
          <el-card shadow="never">
            <el-tabs v-model="activeTab" class="evidence-tabs">
              <!-- Tab1：投诉详情 -->
              <el-tab-pane label="投诉详情" name="complaint">
                <div class="complaint-section">
                  <!-- 用户投诉 -->
                  <div class="evidence-block user-evidence">
                    <div class="evidence-header">
                      <el-avatar :size="40" :src="disputeDetail.user.avatar">
                        {{ disputeDetail.user.name.charAt(0) }}
                      </el-avatar>
                      <div class="evidence-meta">
                        <span class="actor">{{ disputeDetail.user.name }}（投诉方）</span>
                        <span class="time">{{ disputeDetail.timeline[0]?.time }}</span>
                      </div>
                    </div>
                    <div class="evidence-content">
                      <div class="evidence-label">投诉原因：</div>
                      <div class="evidence-text">{{ disputeDetail.evidence.userDesc }}</div>

                      <div class="evidence-label" v-if="disputeDetail.evidence.userImages.length">
                        证据图片：</div>
                      <div class="evidence-images">
                        <el-image
                          v-for="(img, index) in disputeDetail.evidence.userImages"
                          :key="index"
                          :src="img"
                          :preview-src-list="disputeDetail.evidence.userImages"
                          fit="cover"
                          class="evidence-img"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- 房东回应 -->
                  <div v-if="disputeDetail.evidence.landlordDesc" class="evidence-block landlord-evidence">
                    <div class="evidence-header">
                      <el-avatar :size="40" :src="disputeDetail.landlord.avatar">
                        {{ disputeDetail.landlord.name.charAt(0) }}
                      </el-avatar>
                      <div class="evidence-meta">
                        <span class="actor">{{ disputeDetail.landlord.name }}（被投诉方）</span>
                        <span class="time">{{ disputeDetail.timeline[1]?.time || '待回应' }}</span>
                      </div>
                    </div>
                    <div class="evidence-content">
                      <div class="evidence-label">回应内容：</div>
                      <div class="evidence-text">{{ disputeDetail.evidence.landlordDesc }}</div>

                      <div class="evidence-label" v-if="disputeDetail.evidence.landlordImages.length">
                        证据图片：</div>
                      <div class="evidence-images">
                        <el-image
                          v-for="(img, index) in disputeDetail.evidence.landlordImages"
                          :key="index"
                          :src="img"
                          :preview-src-list="disputeDetail.evidence.landlordImages"
                          fit="cover"
                          class="evidence-img"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>

              <!-- Tab2：沟通记录 -->
              <el-tab-pane label="沟通记录" name="chat">
                <div class="chat-filter">
                  <el-radio-group v-model="chatFilter" size="small">
                    <el-radio-button value="all">全部</el-radio-button>
                    <el-radio-button value="user">只看用户</el-radio-button>
                    <el-radio-button value="landlord">只看房东</el-radio-button>
                  </el-radio-group>
                </div>
                <div class="chat-records">
                  <div
                    v-for="record in filteredChatRecords"
                    :key="record.id"
                    class="chat-item"
                    :class="record.sender"
                  >
                    <el-avatar :size="36" :src="record.senderAvatar">
                      {{ record.senderName.charAt(0) }}
                    </el-avatar>
                    <div class="chat-content">
                      <div class="chat-meta">
                        <span class="sender-name">{{ record.senderName }}</span>
                        <span class="chat-time">{{ record.timestamp }}</span>
                      </div>
                      <div class="chat-message">{{ record.content }}</div>
                    </div>
                  </div>
                  <div v-if="filteredChatRecords.length === 0" class="no-records">
                    暂无沟通记录
                  </div>
                </div>
              </el-tab-pane>

              <!-- Tab3：订单履约 -->
              <el-tab-pane label="订单履约记录" name="fulfillment">
                <div class="fulfillment-section">
                  <el-descriptions :column="1" border>
                    <el-descriptions-item label="入住时间">
                      {{ disputeDetail.fulfillment?.checkInTime || '未记录' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="退房时间">
                      {{ disputeDetail.fulfillment?.checkOutTime || '未记录' }}
                    </el-descriptions-item>
                  </el-descriptions>

                  <div v-if="disputeDetail.fulfillment?.checkInPhotos?.length" class="photo-section">
                    <div class="section-title">入住照片</div>
                    <div class="photo-grid">
                      <el-image
                        v-for="(img, index) in disputeDetail.fulfillment.checkInPhotos"
                        :key="index"
                        :src="img"
                        :preview-src-list="disputeDetail.fulfillment.checkInPhotos"
                        fit="cover"
                        class="photo-item"
                      />
                    </div>
                  </div>

                  <div v-if="disputeDetail.fulfillment?.checkOutPhotos?.length" class="photo-section">
                    <div class="section-title">退房照片</div>
                    <div class="photo-grid">
                      <el-image
                        v-for="(img, index) in disputeDetail.fulfillment.checkOutPhotos"
                        :key="index"
                        :src="img"
                        :preview-src-list="disputeDetail.fulfillment.checkOutPhotos"
                        fit="cover"
                        class="photo-item"
                      />
                    </div>
                  </div>

                  <div v-if="disputeDetail.fulfillment?.refundHistory?.length" class="refund-history">
                    <div class="section-title">退款历史</div>
                    <el-table :data="disputeDetail.fulfillment.refundHistory" size="small">
                      <el-table-column prop="time" label="时间" />
                      <el-table-column prop="amount" label="金额">
                        <template #default="{ row }">¥{{ row.amount }}</template>
                      </el-table-column>
                    </el-table>
                  </div>
                </div>
              </el-tab-pane>

              <!-- Tab4：平台备注 -->
              <el-tab-pane label="平台备注" name="admin-note">
                <div class="admin-note-section">
                  <div class="note-form">
                    <el-input
                      v-model="adminNoteContent"
                      type="textarea"
                      :rows="3"
                      placeholder="添加内部备注，仅管理员可见..."
                    />
                    <el-button type="primary" size="small" @click="addAdminNote" :disabled="!adminNoteContent.trim()">
                      添加备注
                    </el-button>
                  </div>
                  <div class="note-history">
                    <div v-for="note in disputeDetail.adminNotes" :key="note.id" class="note-item">
                      <div class="note-header">
                        <span class="operator">{{ note.operator }}</span>
                        <span class="time">{{ note.time }}</span>
                      </div>
                      <div class="note-content">{{ note.content }}</div>
                    </div>
                    <div v-if="!disputeDetail.adminNotes?.length" class="no-records">
                      暂无备注记录
                    </div>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </div>
      </el-col>

      <!-- 右侧：裁决操作区 -->
      <el-col :span="6">
        <div class="right-panel">
          <el-card shadow="never" class="verdict-card">
            <template #header>
              <span class="panel-title">裁决操作</span>
            </template>

            <!-- 已裁决状态：只显示结果 -->
            <div v-if="disputeDetail.status === 'resolved'" class="resolved-info">
              <el-result
                icon="success"
                title="裁决已完成"
                :sub-title="`裁决金额：¥${disputeDetail.verdict?.amount}`"
              />
            </div>

            <!-- 待裁决：显示表单 -->
            <div v-else class="verdict-form">
              <!-- 状态流程 -->
              <div class="status-steps">
                <el-steps :space="60" direction="vertical" :active="getStepActive(disputeDetail.status)">
                  <el-step title="投诉提交" :status="disputeDetail.timeline.length > 0 ? 'finish' : 'wait'" />
                  <el-step
                    title="房东回应"
                    :status="disputeDetail.evidence.landlordDesc ? 'finish' : 'wait'"
                  />
                  <el-step title="平台介入" status="process" />
                  <el-step title="裁决执行" status="wait" />
                </el-steps>
              </div>

              <el-divider />

              <!-- 裁决结果 -->
              <div class="form-section">
                <div class="section-label">裁决结果 <span class="required">*</span></div>
                <el-radio-group v-model="verdictForm.result" class="verdict-radio-group">
                  <el-radio value="full_refund">全额退款给用户</el-radio>
                  <el-radio value="partial_refund">部分退款</el-radio>
                  <el-radio value="coupon">补偿优惠券</el-radio>
                  <el-radio value="reject">拒绝退款</el-radio>
                  <el-radio value="refund_to_host">退款给房东</el-radio>
                  <el-radio value="compromise">协商解决</el-radio>
                </el-radio-group>
              </div>

              <!-- 退款金额（部分退款/协商时显示） -->
              <div
                v-if="verdictForm.result === 'partial_refund' || verdictForm.result === 'compromise'"
                class="form-section"
              >
                <div class="section-label">退款金额 <span class="required">*</span></div>
                <el-input-number
                  v-model="verdictForm.amount"
                  :min="0"
                  :max="disputeDetail.order.totalAmount"
                  :step="50"
                  controls-position="right"
                />
                <div class="amount-hint">
                  最高不超过订单金额 ¥{{ disputeDetail.order.totalAmount }}
                </div>
                <div v-if="verdictForm.amount > 0" class="share-calc">
                  <div class="share-item">
                    <span>平台承担：</span>
                    <span class="value">¥{{ platformShare }}</span>
                  </div>
                  <div class="share-item">
                    <span>房东承担：</span>
                    <span class="value">¥{{ landlordShare }}</span>
                  </div>
                </div>
              </div>

              <!-- 责任判定 -->
              <div class="form-section">
                <div class="section-label">责任判定 <span class="required">*</span></div>
                <el-checkbox-group v-model="verdictForm.liability">
                  <el-checkbox value="landlord" :disabled="hasLiability('landlord')">房东责任</el-checkbox>
                  <el-checkbox value="user" :disabled="hasLiability('user')">用户责任</el-checkbox>
                  <el-checkbox value="both">双方各半</el-checkbox>
                  <el-checkbox value="none">双方无责</el-checkbox>
                </el-checkbox-group>
                <div class="liability-hint">
                  选择后将影响双方信用评分
                </div>
              </div>

              <!-- 裁决说明 -->
              <div class="form-section">
                <div class="section-label">裁决说明 <span class="required">*</span></div>
                <el-input
                  v-model="verdictForm.reason"
                  type="textarea"
                  :rows="4"
                  :maxlength="200"
                  show-word-limit
                  placeholder="请说明裁决理由，双方都将看到此说明（10-200字）"
                />
              </div>

              <!-- 操作按钮 -->
              <div class="form-actions">
                <el-button @click="saveDraft">保存草稿</el-button>
                <el-button type="primary" @click="showConfirmDialog = true" :disabled="!canSubmit">
                  提交裁决
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
      </el-col>
    </el-row>

    <!-- 提交确认弹窗 -->
    <el-dialog
      v-model="showConfirmDialog"
      title="确认提交裁决"
      width="450px"
    >
      <div class="confirm-content">
        <el-alert type="warning" :closable="false" show-icon>
          <template #title>
            提交后将立即执行退款操作，不可撤销
          </template>
        </el-alert>
        <div class="confirm-summary">
          <div class="summary-item">
            <span>裁决结果：</span>
            <strong>{{ getResultText(verdictForm.result) }}</strong>
          </div>
          <div v-if="verdictForm.amount > 0" class="summary-item">
            <span>退款金额：</span>
            <strong class="amount">¥{{ verdictForm.amount }}</strong>
          </div>
          <div class="summary-item">
            <span>责任判定：</span>
            <el-tag size="small">{{ getLiabilityText(verdictForm.liability[0]) }}</el-tag>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showConfirmDialog = false">取消</el-button>
        <el-button type="danger" @click="submitVerdict" :loading="submitting">
          确认执行
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ArrowLeft, CircleCheck, CircleClose } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import type {
  DisputeDetail,
  VerdictForm,
  ChatRecord,
  LiabilityType,
  VerdictResult
} from '@/types';

const router = useRouter();
const route = useRoute();

// 响应式数据
const activeTab = ref('complaint');
const chatFilter = ref('all');
const adminNoteContent = ref('');
const showConfirmDialog = ref(false);
const submitting = ref(false);

// 纠纷详情（模拟数据）
const disputeDetail = reactive<DisputeDetail>({
  id: 'TS20231001001',
  orderId: 'ORDER20231001001',
  status: 'processing',
  type: 'facilities',
  user: {
    id: 101,
    name: '张三',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang',
    phone: '13812345678',
    creditScore: 4.9,
    complaintCount: 1
  },
  landlord: {
    id: 201,
    name: '李四',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Li',
    phone: '13987654321',
    creditScore: 4.75,
    complaintCount: 0
  },
  order: {
    orderId: 'ORDER20231001001',
    homestayTitle: '市中心豪华海景公寓',
    checkInDate: '2023-10-01',
    checkOutDate: '2023-10-03',
    totalAmount: 680,
    claimAmount: 500
  },
  evidence: {
    userImages: [
      'https://via.placeholder.com/200x150/f5222d/ffffff?text=脏乱房间1',
      'https://via.placeholder.com/200x150/f5222d/ffffff?text=脏乱房间2',
      'https://via.placeholder.com/200x150/f5222d/ffffff?text=损坏设备'
    ],
    landlordImages: [
      'https://via.placeholder.com/200x150/52c41a/ffffff?text=清洁后1',
      'https://via.placeholder.com/200x150/52c41a/ffffff?text=清洁后2'
    ],
    userDesc: '房间卫生条件极差，床单有污渍，空调噪音很大无法入睡。与网站上的照片严重不符，要求全额退款。',
    landlordDesc: '入住前已安排保洁打扫，客人入住后提出空调问题我们也及时安排了维修。不同意全额退款。'
  },
  timeline: [
    {
      id: 1,
      time: '2023-10-03 10:30',
      type: 'complaint',
      actor: 'user',
      content: '用户提交投诉：房间卫生条件差，与图片不符'
    },
    {
      id: 2,
      time: '2023-10-03 14:00',
      type: 'response',
      actor: 'landlord',
      content: '房东回应：已安排保洁，不同意全额退款'
    }
  ],
  chatRecords: [
    {
      id: 'chat_001',
      sender: 'user',
      senderName: '张三',
      senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang',
      content: '你好，我发现房间很脏，能安排人打扫一下吗？',
      timestamp: '10-01 20:30'
    },
    {
      id: 'chat_002',
      sender: 'landlord',
      senderName: '李四',
      senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Li',
      content: '好的，我马上安排阿姨过去打扫。',
      timestamp: '10-01 20:45'
    },
    {
      id: 'chat_003',
      sender: 'user',
      senderName: '张三',
      senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang',
      content: '空调噪音太大了，根本没法睡觉，能换个房间吗？',
      timestamp: '10-02 01:20'
    },
    {
      id: 'chat_004',
      sender: 'landlord',
      senderName: '李四',
      senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Li',
      content: '现在是凌晨了，酒店前台下班了，明天一早我联系您处理可以吗？',
      timestamp: '10-02 01:30'
    },
    {
      id: 'chat_005',
      sender: 'user',
      senderName: '张三',
      senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang',
      content: '好的，那请尽快处理。',
      timestamp: '10-02 01:35'
    }
  ],
  fulfillment: {
    checkInTime: '2023-10-01 15:30',
    checkOutTime: '2023-10-03 11:00',
    checkInPhotos: ['https://via.placeholder.com/200x150/1890ff/ffffff?text=入住照片1'],
    checkOutPhotos: ['https://via.placeholder.com/200x150/722ed1/ffffff?text=退房照片1']
  },
  adminNotes: []
});

// 裁决表单
const verdictForm = reactive<VerdictForm>({
  result: 'partial_refund',
  amount: 300,
  liability: ['landlord'],
  reason: ''
});

// 计算属性
const filteredChatRecords = computed(() => {
  if (chatFilter.value === 'all') return disputeDetail.chatRecords || [];
  return (disputeDetail.chatRecords || []).filter(
    record => record.sender === chatFilter.value
  );
});

const platformShare = computed(() => {
  if (verdictForm.liability.includes('landlord')) {
    return Math.round(verdictForm.amount * 0.7);
  } else if (verdictForm.liability.includes('both')) {
    return Math.round(verdictForm.amount * 0.5);
  }
  return 0;
});

const landlordShare = computed(() => {
  if (verdictForm.liability.includes('landlord')) {
    return Math.round(verdictForm.amount * 0.3);
  } else if (verdictForm.liability.includes('both')) {
    return Math.round(verdictForm.amount * 0.5);
  }
  return verdictForm.amount;
});

const canSubmit = computed(() => {
  if (!verdictForm.result) return false;
  if ((verdictForm.result === 'partial_refund' || verdictForm.result === 'compromise') && verdictForm.amount <= 0) {
    return false;
  }
  if (verdictForm.liability.length === 0) return false;
  if (verdictForm.reason.length < 10) return false;
  return true;
});

// 方法
function goBack() {
  router.push('/admin/dispute');
}

function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

function getStatusTagType(status: string) {
  const map: Record<string, string> = {
    pending: 'warning',
    processing: 'primary',
    resolved: 'success'
  };
  return map[status] || 'info';
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已裁决'
  };
  return map[status] || status;
}

function getTypeTagType(type: string) {
  const map: Record<string, string> = {
    refund: 'primary',
    facilities: 'warning',
    service: 'danger',
    other: 'info'
  };
  return map[type] || 'info';
}

function getTypeText(type: string) {
  const map: Record<string, string> = {
    refund: '退款纠纷',
    facilities: '设施不符',
    service: '服务态度',
    other: '其他'
  };
  return map[type] || type;
}

function getLiabilityTagType(liability: string) {
  const map: Record<string, string> = {
    landlord: 'danger',
    user: 'warning',
    both: 'primary',
    none: 'info'
  };
  return map[liability] || 'info';
}

function getLiabilityText(liability: string) {
  const map: Record<string, string> = {
    landlord: '房东全责',
    user: '用户全责',
    both: '双方各半',
    none: '双方无责'
  };
  return map[liability] || liability;
}

function getResultText(result: string) {
  const map: Record<string, string> = {
    full_refund: '全额退款给用户',
    partial_refund: '部分退款',
    coupon: '补偿优惠券',
    reject: '拒绝退款',
    refund_to_host: '退款给房东',
    compromise: '协商解决'
  };
  return map[result] || result;
}

function getStepActive(status: string) {
  const map: Record<string, number> = {
    pending: 0,
    processing: 2,
    resolved: 3
  };
  return map[status] || 0;
}

function hasLiability(type: string) {
  return verdictForm.liability.includes('both') || verdictForm.liability.includes('none');
}

function addAdminNote() {
  if (!adminNoteContent.value.trim()) return;
  disputeDetail.adminNotes = disputeDetail.adminNotes || [];
  disputeDetail.adminNotes.push({
    id: Date.now(),
    operator: '管理员A',
    time: new Date().toLocaleString(),
    content: adminNoteContent.value
  });
  adminNoteContent.value = '';
  ElMessage.success('备注已添加');
}

function saveDraft() {
  ElMessage.success('草稿已保存');
}

async function submitVerdict() {
  submitting.value = true;
  try {
    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 1000));

    disputeDetail.status = 'resolved';
    disputeDetail.verdict = {
      result: verdictForm.result as VerdictResult,
      amount: verdictForm.amount,
      liability: verdictForm.liability[0] as LiabilityType,
      reason: verdictForm.reason,
      platformShare: platformShare.value,
      landlordShare: landlordShare.value,
      executedAt: new Date().toLocaleString(),
      executedBy: '管理员A'
    };

    ElMessage.success('裁决已执行');
    showConfirmDialog.value = false;
  } finally {
    submitting.value = false;
  }
}

// 初始化
onMounted(() => {
  const id = route.params.id;
  console.log('纠纷ID:', id);
  // 实际项目中根据ID加载纠纷详情
});
</script>

<style scoped lang="scss">
.dispute-page {
  background: #f0f2f5;
  min-height: 100%;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 8px;

  .header-left {
    display: flex;
    align-items: center;

    .dispute-id {
      font-weight: 600;
      color: #262626;
    }
  }
}

.verdict-result-card {
  background: linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%);
  border: 1px solid #b7eb8f;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;

  .verdict-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    .verdict-title {
      font-size: 18px;
      font-weight: 600;
      color: #52c41a;
    }

    .verdict-time {
      margin-left: auto;
      color: #8c8c8c;
      font-size: 13px;
    }
  }

  .verdict-content {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    margin-bottom: 16px;

    .result-amount {
      .label {
        color: #8c8c8c;
      }
      .value {
        font-size: 24px;
        font-weight: 700;
        color: #52c41a;
      }
    }

    .result-liability,
    .result-reason {
      display: flex;
      align-items: center;
      gap: 8px;

      .label {
        color: #8c8c8c;
      }

      .reason-text {
        color: #262626;
        max-width: 400px;
      }
    }
  }

  .refund-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-top: 12px;
    border-top: 1px dashed #b7eb8f;
    color: #8c8c8c;
    font-size: 13px;

    .time {
      margin-left: 8px;
    }
  }
}

.three-column-layout {
  .left-panel,
  .center-panel,
  .right-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}

.party-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .party-info {
    display: flex;
    gap: 12px;
    align-items: center;

    .party-detail {
      .name {
        font-size: 16px;
        font-weight: 600;
        color: #262626;
      }
      .phone {
        font-size: 13px;
        color: #8c8c8c;
      }
    }
  }

  .party-stats {
    .stat-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;

      .label {
        color: #8c8c8c;
        font-size: 13px;
      }

      .value {
        font-size: 14px;
        color: #262626;

        &.highlight {
          color: #f5222d;
        }
      }
    }
  }
}

.user-card {
  border-top: 3px solid #1890ff;
}

.landlord-card {
  border-top: 3px solid #52c41a;
}

.order-snapshot {
  .snapshot-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    font-size: 14px;

    .label {
      color: #8c8c8c;
    }

    .value {
      color: #262626;
    }

    &.dispute-amount {
      .amount {
        font-size: 20px;
        font-weight: 700;
        color: #f5222d;
      }
    }
  }

  .dispute-type {
    margin-top: 12px;
  }
}

.evidence-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 16px;
  }
}

.evidence-block {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;

  &.user-evidence {
    background: #e6f7ff;
    border-left: 4px solid #1890ff;
  }

  &.landlord-evidence {
    background: #f6ffed;
    border-left: 4px solid #52c41a;
  }

  .evidence-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;

    .evidence-meta {
      display: flex;
      flex-direction: column;

      .actor {
        font-weight: 600;
        color: #262626;
      }

      .time {
        font-size: 12px;
        color: #8c8c8c;
      }
    }
  }

  .evidence-content {
    .evidence-label {
      font-size: 13px;
      color: #8c8c8c;
      margin-bottom: 8px;
    }

    .evidence-text {
      color: #262626;
      line-height: 1.6;
      margin-bottom: 12px;
    }

    .evidence-images {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .evidence-img {
        width: 100px;
        height: 80px;
        border-radius: 4px;
        cursor: pointer;
      }
    }
  }
}

.chat-filter {
  margin-bottom: 16px;
}

.chat-records {
  max-height: 400px;
  overflow-y: auto;

  .chat-item {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;

    .chat-content {
      flex: 1;

      .chat-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;

        .sender-name {
          font-weight: 600;
          font-size: 13px;
          color: #262626;
        }

        .chat-time {
          font-size: 12px;
          color: #8c8c8c;
        }
      }

      .chat-message {
        background: #f5f5f5;
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 14px;
        line-height: 1.5;
      }
    }

    &.landlord .chat-message {
      background: #f6ffed;
    }
  }

  .no-records {
    text-align: center;
    color: #8c8c8c;
    padding: 40px 0;
  }
}

.fulfillment-section {
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #262626;
    margin: 16px 0 12px;
  }

  .photo-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;

    .photo-item {
      width: 100%;
      height: 100px;
      border-radius: 4px;
    }
  }

  .refund-history {
    margin-top: 16px;
  }
}

.admin-note-section {
  .note-form {
    margin-bottom: 20px;

    .el-textarea {
      margin-bottom: 12px;
    }
  }

  .note-history {
    .note-item {
      padding: 12px;
      background: #fafafa;
      border-radius: 6px;
      margin-bottom: 12px;

      .note-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;

        .operator {
          font-weight: 600;
          color: #1890ff;
        }

        .time {
          font-size: 12px;
          color: #8c8c8c;
        }
      }

      .note-content {
        font-size: 14px;
        color: #262626;
        line-height: 1.5;
      }
    }
  }
}

.verdict-card {
  .panel-title {
    font-weight: 600;
    font-size: 16px;
  }

  .status-steps {
    padding: 0 8px;
  }

  .verdict-form {
    .form-section {
      margin-bottom: 20px;

      .section-label {
        font-size: 14px;
        font-weight: 500;
        color: #262626;
        margin-bottom: 8px;

        .required {
          color: #f5222d;
        }
      }

      .verdict-radio-group {
        display: flex;
        flex-direction: column;
        gap: 8px;

        :deep(.el-radio) {
          margin-right: 0;
        }
      }

      .amount-hint {
        font-size: 12px;
        color: #8c8c8c;
        margin-top: 4px;
      }

      .share-calc {
        margin-top: 12px;
        padding: 12px;
        background: #fafafa;
        border-radius: 6px;

        .share-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 13px;

          &:last-child {
            margin-bottom: 0;
          }

          .value {
            font-weight: 600;
            color: #1890ff;
          }
        }
      }

      .liability-hint {
        font-size: 12px;
        color: #8c8c8c;
        margin-top: 4px;
      }
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;

      .el-button {
        flex: 1;
      }
    }
  }

  .resolved-info {
    text-align: center;
    padding: 20px 0;
  }
}

.confirm-content {
  .confirm-summary {
    margin-top: 20px;

    .summary-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
      font-size: 14px;

      .amount {
        color: #f5222d;
        font-weight: 700;
        font-size: 18px;
      }
    }
  }
}
</style>
