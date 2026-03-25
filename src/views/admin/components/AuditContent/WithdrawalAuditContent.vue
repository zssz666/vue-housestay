<template>
  <div class="withdrawal-audit-content">
    <!-- 加载状态 -->
    <el-skeleton :loading="loading" animated :rows="10">
      <template #template>
        <div class="skeleton-card">
          <el-skeleton-item variant="text" style="width: 40%; height: 40px" />
          <el-skeleton-item variant="text" style="width: 60%; margin-top: 12px" />
        </div>
      </template>

      <!-- 提现金额区 -->
      <div class="info-card amount-card">
        <div class="amount-label">申请金额</div>
        <div class="amount-value">
          ¥{{ detail.withdrawal.amount.toLocaleString() }}
          <el-tag v-if="detail.withdrawal.amount >= 20000" type="danger" size="small" class="large-tag">
            大额
          </el-tag>
        </div>
        <div class="amount-detail">
          <div class="amount-item">
            <span class="label">手续费：</span>
            <span class="value">¥{{ detail.withdrawal.fee }}</span>
          </div>
          <div class="amount-item">
            <span class="label">实际到账：</span>
            <span class="value highlight">¥{{ detail.withdrawal.actualAmount.toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <!-- 收款账户信息 -->
      <div class="info-card">
        <div class="section-title">收款账户信息</div>

        <div class="bank-card">
          <div class="bank-icon">
            <el-icon :size="32"><Postcard /></el-icon>
          </div>
          <div class="bank-info">
            <div class="bank-name">{{ detail.withdrawal.bankName }}</div>
            <div class="bank-number">
              {{ detail.withdrawal.cardNumber }}
              <el-button type="primary" link size="small" @click="handleViewCard">
                查看完整
              </el-button>
            </div>
          </div>
        </div>

        <div class="card-holder" :class="{ mismatch: !detail.withdrawal.realNameMatch }">
          <div class="holder-label">
            <el-icon v-if="!detail.withdrawal.realNameMatch"><WarningFilled /></el-icon>
            持卡人：
          </div>
          <div class="holder-value">
            {{ detail.withdrawal.cardHolder }}
            <el-tag v-if="!detail.withdrawal.realNameMatch" type="danger" size="small">
              与实名认证姓名不一致
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 风控信息区 -->
      <div class="info-card risk-card">
        <div class="section-title">
          <el-icon color="#1890ff"><DataAnalysis /></el-icon>
          风控信息
        </div>

        <!-- 账户余额 -->
        <div class="risk-item">
          <div class="risk-label">账户余额</div>
          <div class="risk-value">
            <span class="balance-value">¥{{ detail.account.balance.toLocaleString() }}</span>
            <el-tag
              v-if="detail.account.balance < detail.withdrawal.amount"
              type="danger"
              size="small"
            >
              余额不足
            </el-tag>
          </div>
          <div class="risk-tip">保证金要求：¥{{ detail.account.guaranteeBalance.toLocaleString() }}</div>
        </div>

        <!-- 近期提现记录 -->
        <div class="risk-item">
          <div class="risk-label">
            近期提现记录（最近7天）
            <el-tag
              v-if="detail.withdrawalCount7Days > 2"
              type="warning"
              size="small"
              class="warning-tag"
            >
              频繁提现
            </el-tag>
          </div>
          <div class="withdrawal-list">
            <div
              v-for="(item, index) in detail.recentWithdrawals"
              :key="index"
              class="withdrawal-item"
            >
              <span class="withdrawal-time">{{ item.time }}</span>
              <span class="withdrawal-amount">¥{{ item.amount.toLocaleString() }}</span>
              <el-tag :type="item.status === 'approved' ? 'success' : 'danger'" size="small">
                {{ item.status === 'approved' ? '已通过' : '已驳回' }}
              </el-tag>
            </div>
            <div v-if="detail.recentWithdrawals.length === 0" class="no-record">
              暂无近期提现记录
            </div>
          </div>
          <div class="withdrawal-summary">
            本次是第 {{ detail.withdrawalCount7Days + 1 }} 次申请
          </div>
        </div>

        <!-- 订单纠纷 -->
        <div class="risk-item">
          <div class="risk-label">订单纠纷</div>
          <div class="risk-value">
            <span :class="{ danger: detail.account.activeComplaints > 0 }">
              {{ detail.account.activeComplaints }} 起进行中的投诉
            </span>
            <el-tag v-if="detail.account.activeComplaints > 0" type="danger" size="small">
              需关注
            </el-tag>
          </div>
        </div>

        <!-- 信用评分 -->
        <div class="risk-item">
          <div class="risk-label">信用评分</div>
          <div class="risk-value">
            <el-rate
              v-model="creditScore"
              disabled
              show-score
              text-color="#ff9900"
              score-template="{value}分"
            />
          </div>
        </div>
      </div>
    </el-skeleton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Postcard, WarningFilled, DataAnalysis } from '@element-plus/icons-vue';
import type { WithdrawalAuditDetail } from '@/types';

const props = defineProps<{
  detail: WithdrawalAuditDetail;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'view-card'): void;
}>();

const creditScore = computed(() => props.detail.account.creditScore / 20);

function handleViewCard() {
  emit('view-card');
}
</script>

<style scoped lang="scss">
.withdrawal-audit-content {
  .info-card {
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    border: 1px solid #f0f0f0;
  }

  .section-title {
    font-size: 15px;
    font-weight: 600;
    color: #262626;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .skeleton-card {
    padding: 16px;
    background: #fff;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  // 金额卡片
  .amount-card {
    text-align: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border: none;

    .amount-label {
      font-size: 14px;
      opacity: 0.9;
    }

    .amount-value {
      font-size: 36px;
      font-weight: 700;
      margin: 8px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;

      .large-tag {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
        color: #fff;
      }
    }

    .amount-detail {
      display: flex;
      justify-content: center;
      gap: 32px;
      font-size: 14px;
      opacity: 0.9;

      .amount-item {
        .label {
          opacity: 0.8;
        }

        .value {
          &.highlight {
            font-weight: 600;
          }
        }
      }
    }
  }

  // 银行卡信息
  .bank-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: #fafafa;
    border-radius: 8px;
    margin-bottom: 12px;

    .bank-icon {
      width: 48px;
      height: 48px;
      background: #fff;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bank-info {
      flex: 1;

      .bank-name {
        font-size: 16px;
        font-weight: 600;
        color: #262626;
        margin-bottom: 4px;
      }

      .bank-number {
        font-size: 14px;
        color: #8c8c8c;
      }
    }
  }

  .card-holder {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: #f6ffed;
    border-radius: 6px;

    &.mismatch {
      background: #fff2f0;
    }

    .holder-label {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      color: #8c8c8c;
    }

    .holder-value {
      font-size: 14px;
      color: #262626;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  // 风控卡片
  .risk-card {
    .section-title {
      color: #1890ff;
    }
  }

  .risk-item {
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .risk-label {
      font-size: 13px;
      color: #8c8c8c;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;

      .warning-tag {
        margin-left: auto;
      }
    }

    .risk-value {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      color: #262626;

      .balance-value {
        font-size: 20px;
        font-weight: 600;
        color: #262626;
      }

      .danger {
        color: #f5222d;
        font-weight: 500;
      }
    }

    .risk-tip {
      font-size: 12px;
      color: #8c8c8c;
      margin-top: 4px;
    }
  }

  .withdrawal-list {
    background: #fafafa;
    border-radius: 6px;
    padding: 8px 12px;
    margin-bottom: 8px;

    .withdrawal-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 6px 0;

      .withdrawal-time {
        font-size: 13px;
        color: #8c8c8c;
      }

      .withdrawal-amount {
        flex: 1;
        font-size: 14px;
        font-weight: 500;
        color: #262626;
      }
    }

    .no-record {
      font-size: 13px;
      color: #d9d9d9;
      text-align: center;
      padding: 8px 0;
    }
  }

  .withdrawal-summary {
    font-size: 12px;
    color: #faad14;
    background: #fffbe6;
    padding: 4px 8px;
    border-radius: 4px;
    display: inline-block;
  }
}
</style>
