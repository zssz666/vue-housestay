<template>
  <el-drawer
    v-model="visible"
    direction="rtl"
    :size="600"
    :show-close="false"
    :with-header="false"
    :before-close="handleClose"
    class="audit-detail-drawer"
  >
    <!-- 顶部区域 -->
    <div class="drawer-header">
      <div class="header-left">
        <h2>{{ title }}</h2>
        <el-tag v-if="detail?.status === 0" type="warning" size="small">待审核</el-tag>
        <el-tag v-else-if="detail?.status === 1" type="success" size="small">已通过</el-tag>
        <el-tag v-else type="danger" size="small">已驳回</el-tag>
      </div>
      <div class="header-right">
        <span class="submit-time">申请时间：{{ detail?.submitTime }}</span>
        <el-button :icon="Close" circle @click="handleClose" />
      </div>
    </div>

    <!-- 中部可滚动区域 -->
    <el-scrollbar class="drawer-body">
      <!-- 房东资质审核 -->
      <template v-if="type === 'landlord' && landlordDetail">
        <LandlordAuditContent
          :detail="landlordDetail"
          :loading="loading"
          @view-id-card="handleViewIdCard"
        />
      </template>

      <!-- 房源审核 -->
      <template v-else-if="type === 'homestay' && homestayDetail">
        <HomestayAuditContent
          :detail="homestayDetail"
          :loading="loading"
        />
      </template>

      <!-- 提现审核 -->
      <template v-else-if="type === 'withdrawal' && withdrawalDetail">
        <WithdrawalAuditContent
          :detail="withdrawalDetail"
          :loading="loading"
          @view-card="handleViewCard"
        />
      </template>
    </el-scrollbar>

    <!-- 底部操作区域 -->
    <div class="drawer-footer">
      <!-- 审核历史 -->
      <div class="audit-history">
        <span v-if="detail?.history && detail.history.length > 0">
          <template v-if="detail.history.length === 1">
            首次提交
          </template>
          <template v-else>
            第{{ detail.history.length }}次提交
            <span v-if="lastRejectReason" class="reject-reason">
              ，上次驳回原因：{{ lastRejectReason }}
            </span>
          </template>
        </span>
      </div>

      <!-- 操作按钮 -->
      <div class="footer-actions" v-if="detail?.status === 0">
        <el-popconfirm
          title="确定要驳回该申请吗？"
          confirm-button-text="确认驳回"
          cancel-button-text="取消"
          @confirm="handleReject"
        >
          <template #reference>
            <el-button type="danger" :loading="actionLoading" :disabled="actionLoading">
              驳回
            </el-button>
          </template>
        </el-popconfirm>

        <el-popconfirm
          title="确定要通过该申请吗？"
          confirm-button-text="确认通过"
          cancel-button-text="取消"
          @confirm="handleApprove"
        >
          <template #reference>
            <el-button type="success" :loading="actionLoading" :disabled="actionLoading">
              通过
            </el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>

    <!-- 驳回原因弹窗 -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="选择驳回原因"
      width="480px"
      :close-on-click-modal="false"
    >
      <div class="reject-dialog-content">
        <el-radio-group v-model="selectedReason">
          <el-radio
            v-for="reason in rejectReasons"
            :key="reason.value"
            :value="reason.value"
            class="reason-radio"
          >
            {{ reason.label }}
          </el-radio>
          <el-radio value="other" class="reason-radio">
            其他
            <el-input
              v-if="selectedReason === 'other'"
              v-model="otherReason"
              type="textarea"
              :rows="2"
              placeholder="请输入详细说明"
              class="other-reason-input"
            />
          </el-radio>
        </el-radio-group>
      </div>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject" :disabled="!selectedReason">
          确认驳回
        </el-button>
      </template>
    </el-dialog>

    <!-- 通过确认弹窗 -->
    <el-dialog
      v-model="approveDialogVisible"
      :title="approveDialogTitle"
      width="480px"
      :close-on-click-modal="false"
    >
      <div class="approve-dialog-content">
        <p class="confirm-text">{{ approveConfirmText }}</p>

        <!-- 房源审核：通过时可选择上架方式 -->
        <template v-if="type === 'homestay'">
          <el-form label-width="100px" class="publish-form">
            <el-form-item label="上架方式">
              <el-radio-group v-model="publishType">
                <el-radio value="immediate">立即上架</el-radio>
                <el-radio value="scheduled">定时上架</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="publishType === 'scheduled'" label="选择时间">
              <el-date-picker
                v-model="scheduledTime"
                type="datetime"
                placeholder="选择上架时间"
                :disabled-date="disabledDate"
                style="width: 100%"
              />
            </el-form-item>
          </el-form>
        </template>

        <!-- 提现审核：通过时显示预计到账时间 -->
        <template v-if="type === 'withdrawal'">
          <el-alert
            type="info"
            :closable="false"
            show-icon
            class="arrival-tip"
          >
            <template #title>
              预计 {{ arrivalTime }} 前到账
            </template>
          </el-alert>
        </template>

        <el-form-item label="备注" class="remark-form-item">
          <el-input
            v-model="remark"
            type="textarea"
            :rows="2"
            placeholder="可选，添加审核备注"
          />
        </el-form-item>
      </div>
      <template #footer>
        <el-button @click="approveDialogVisible = false">取消</el-button>
        <el-button type="success" @click="confirmApprove" :loading="actionLoading">
          确认
        </el-button>
      </template>
    </el-dialog>

    <!-- 身份证查看弹窗 -->
    <el-dialog
      v-model="idCardDialogVisible"
      title="身份证信息"
      width="800px"
      class="id-card-dialog"
    >
      <div class="id-card-compare" v-if="idCardImages">
        <div class="id-card-item">
          <h4>身份证正面</h4>
          <el-image
            :src="idCardImages.front"
            :preview-src-list="[idCardImages.front]"
            fit="contain"
            class="id-card-image"
          />
        </div>
        <div class="id-card-item">
          <h4>身份证反面</h4>
          <el-image
            :src="idCardImages.back"
            :preview-src-list="[idCardImages.back]"
            fit="contain"
            class="id-card-image"
          />
        </div>
      </div>
    </el-dialog>

    <!-- 银行卡查看弹窗 -->
    <el-dialog
      v-model="cardDialogVisible"
      title="银行卡信息"
      width="400px"
    >
      <div class="card-info-content" v-if="fullCardInfo">
        <p>银行名称：{{ fullCardInfo.bankName }}</p>
        <p>卡号：{{ fullCardInfo.cardNumber }}</p>
        <p>持卡人：{{ fullCardInfo.cardHolder }}</p>
      </div>
    </el-dialog>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Close } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type {
  AuditDetail,
  AuditType,
  LandlordAuditDetail,
  HomestayAuditDetail,
  WithdrawalAuditDetail,
  AuditActionParams
} from '@/types';

// 子组件
import LandlordAuditContent from './AuditContent/LandlordAuditContent.vue';
import HomestayAuditContent from './AuditContent/HomestayAuditContent.vue';
import WithdrawalAuditContent from './AuditContent/WithdrawalAuditContent.vue';

const props = defineProps<{
  modelValue: boolean;
  type: AuditType;
  detail?: AuditDetail;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'audit', params: AuditActionParams): void;
  (e: 'close'): void;
}>();

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

// 加载状态
const loading = computed(() => props.loading || false);
const actionLoading = ref(false);

// 类型断言的计算属性
const landlordDetail = computed(() => {
  if (props.type === 'landlord' && props.detail) {
    return props.detail as LandlordAuditDetail;
  }
  return null;
});

const homestayDetail = computed(() => {
  if (props.type === 'homestay' && props.detail) {
    return props.detail as HomestayAuditDetail;
  }
  return null;
});

const withdrawalDetail = computed(() => {
  if (props.type === 'withdrawal' && props.detail) {
    return props.detail as WithdrawalAuditDetail;
  }
  return null;
});

// 标题
const title = computed(() => {
  const titles: Record<AuditType, string> = {
    landlord: '审核房东资质',
    homestay: '审核房源',
    withdrawal: '审核提现申请'
  };
  return titles[props.type] || '审核详情';
});

// 审核历史
const lastRejectReason = computed(() => {
  if (!props.detail?.history || props.detail.history.length === 0) return '';
  const lastAction = props.detail.history[props.detail.history.length - 1];
  return lastAction.action === 'reject' ? lastAction.reason : '';
});

// 驳回相关
const rejectDialogVisible = ref(false);
const selectedReason = ref('');
const otherReason = ref('');
const rejectReasons = computed(() => {
  if (props.type === 'landlord') {
    return [
      { value: 'id_card_unclear', label: '证件照片不清晰/不完整' },
      { value: 'id_card_mismatch', label: '身份证信息与手持照不符' },
      { value: 'property_cert_invalid', label: '房产证明无效/过期' }
    ];
  } else if (props.type === 'homestay') {
    return [
      { value: 'image_mismatch', label: '图文不符' },
      { value: 'price_abnormal', label: '价格异常' },
      { value: 'violation_info', label: '违规信息' },
      { value: 'facility_false', label: '设施虚假' }
    ];
  } else {
    return [
      { value: 'balance_insufficient', label: '余额不足' },
      { value: 'account_abnormal', label: '账户异常' },
      { value: 'risk_triggered', label: '触发风控' },
      { value: 'info_mismatch', label: '信息不符' }
    ];
  }
});

// 通过相关
const approveDialogVisible = ref(false);
const publishType = ref<'immediate' | 'scheduled'>('immediate');
const scheduledTime = ref('');
const remark = ref('');
const arrivalTime = computed(() => {
  const now = new Date();
  now.setHours(now.getHours() + 2);
  return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
});

const approveDialogTitle = computed(() => {
  if (props.type === 'homestay') return '房源审核 - 通过确认';
  if (props.type === 'withdrawal') return '提现审核 - 确认打款';
  return '审核确认';
});

const approveConfirmText = computed(() => {
  if (props.type === 'homestay') return '确定通过该房源审核？';
  if (props.type === 'withdrawal' && withdrawalDetail.value) {
    const amount = withdrawalDetail.value.withdrawal.amount;
    return `确定向该用户打款 ¥${amount?.toLocaleString()}？`;
  }
  return '确定通过该申请？';
});

// 身份证弹窗
const idCardDialogVisible = ref(false);
const idCardImages = ref<{ front: string; back: string } | null>(null);

// 银行卡弹窗
const cardDialogVisible = ref(false);
const fullCardInfo = ref<{
  bankName: string;
  cardNumber: string;
  cardHolder: string;
} | null>(null);

// 监听关闭
watch(visible, (val) => {
  if (!val) {
    // 重置状态
    rejectDialogVisible.value = false;
    approveDialogVisible.value = false;
    selectedReason.value = '';
    otherReason.value = '';
    remark.value = '';
  }
});

// 关闭处理
function handleClose() {
  visible.value = false;
  emit('close');
}

// 查看身份证
function handleViewIdCard() {
  if (props.type === 'landlord' && props.detail) {
    const detail = props.detail as LandlordAuditDetail;
    idCardImages.value = {
      front: detail.idCardFront,
      back: detail.idCardBack
    };
    idCardDialogVisible.value = true;
  }
}

// 查看银行卡
function handleViewCard() {
  if (props.type === 'withdrawal' && props.detail) {
    const detail = props.detail as WithdrawalAuditDetail;
    ElMessageBox.confirm(
      `银行卡号：${detail.withdrawal.cardNumber.replace(/\*/g, '')}\n持卡人：${detail.withdrawal.cardHolder}`,
      '完整银行卡信息',
      { confirmButtonText: '关闭', showCancelButton: false }
    );
  }
}

// 驳回处理
function handleReject() {
  selectedReason.value = '';
  otherReason.value = '';
  rejectDialogVisible.value = true;
}

async function confirmReject() {
  if (!selectedReason.value) {
    ElMessage.warning('请选择驳回原因');
    return;
  }

  const reason = selectedReason.value === 'other'
    ? otherReason.value
    : rejectReasons.value.find(r => r.value === selectedReason.value)?.label || selectedReason.value;

  actionLoading.value = true;
  try {
    emit('audit', {
      id: props.detail?.id || '',
      action: 'reject',
      reason,
      remark: remark.value
    });

    ElMessage.success('已驳回');
    rejectDialogVisible.value = false;
    handleClose();
  } finally {
    actionLoading.value = false;
  }
}

// 通过处理
function handleApprove() {
  remark.value = '';
  publishType.value = 'immediate';
  scheduledTime.value = '';
  approveDialogVisible.value = true;
}

async function confirmApprove() {
  actionLoading.value = true;
  try {
    const params: AuditActionParams = {
      id: props.detail?.id || '',
      action: 'approve',
      remark: remark.value
    };

    if (props.type === 'homestay') {
      params.publishType = publishType.value;
      if (publishType.value === 'scheduled' && scheduledTime.value) {
        params.scheduledTime = new Date(scheduledTime.value).toISOString();
      }
    }

    emit('audit', params);
    ElMessage.success(props.type === 'withdrawal' ? '打款已发起' : '已通过');
    approveDialogVisible.value = false;
    handleClose();
  } finally {
    actionLoading.value = false;
  }
}

// 禁用日期（不能选择过去时间）
function disabledDate(date: Date) {
  return date.getTime() < Date.now();
}
</script>

<style scoped lang="scss">
.audit-detail-drawer {
  :deep(.el-drawer__body) {
    padding: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

.drawer-header {
  height: 80px;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .submit-time {
      font-size: 13px;
      color: #8c8c8c;
    }
  }
}

.drawer-body {
  flex: 1;
  overflow: hidden;
  padding: 24px;
}

.drawer-footer {
  height: 120px;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-shrink: 0;

  .audit-history {
    font-size: 13px;
    color: #8c8c8c;

    .reject-reason {
      color: #ff4d4f;
    }
  }

  .footer-actions {
    display: flex;
    gap: 16px;
    justify-content: flex-end;

    :deep(.el-button) {
      width: 120px;
    }
  }
}

// 驳回原因弹窗
.reject-dialog-content {
  .reason-radio {
    display: flex;
    align-items: flex-start;
    width: 100%;
    margin-bottom: 12px;

    :deep(.el-radio__label) {
      display: flex;
      flex-direction: column;
    }

    .other-reason-input {
      margin-top: 8px;
      width: 300px;
    }
  }
}

// 通过确认弹窗
.approve-dialog-content {
  .confirm-text {
    font-size: 15px;
    color: #262626;
    margin-bottom: 16px;
  }

  .arrival-tip {
    margin-bottom: 16px;
  }

  .publish-form {
    margin-bottom: 16px;
  }

  .remark-form-item {
    margin-top: 16px;
  }
}

// 身份证对比弹窗
.id-card-dialog {
  :deep(.el-dialog__body) {
    padding: 16px 24px;
  }

  .id-card-compare {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;

    .id-card-item {
      h4 {
        margin: 0 0 12px;
        font-size: 14px;
        color: #262626;
      }

      .id-card-image {
        width: 100%;
        height: 280px;
        border-radius: 8px;
        background: #f5f5f5;
      }
    }
  }
}

// 银行卡信息弹窗
.card-info-content {
  p {
    margin: 8px 0;
    font-size: 14px;
  }
}
</style>
