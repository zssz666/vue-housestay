<template>
  <div class="landlord-audit-content">
    <!-- 加载状态 -->
    <el-skeleton :loading="loading" animated :rows="10">
      <template #template>
        <div class="skeleton-card">
          <el-skeleton-item variant="circle" style="width: 60px; height: 60px" />
          <div class="skeleton-text">
            <el-skeleton-item variant="text" style="width: 120px" />
            <el-skeleton-item variant="text" style="width: 180px" />
          </div>
        </div>
      </template>

      <!-- 申请人信息卡片 -->
      <div class="info-card">
        <div class="applicant-info">
          <el-avatar :size="60" :src="detail.applicant.avatar">
            {{ detail.applicant.name.charAt(0) }}
          </el-avatar>
          <div class="applicant-detail">
            <div class="name-row">
              <span class="name">{{ detail.applicant.name }}</span>
              <el-tag v-if="detail.history?.length === 1 || !detail.history" type="danger" size="small">
                首次申请
              </el-tag>
              <el-tag v-else type="warning" size="small">重新提交</el-tag>
            </div>
            <div class="info-row">
              <span class="info-item">
                <el-icon><Phone /></el-icon>
                {{ formatPhone(detail.applicant.phone) }}
              </span>
              <span class="info-item">
                <el-icon><Calendar /></el-icon>
                注册时间：{{ detail.applicant.registerTime }}
              </span>
            </div>
          </div>
        </div>

        <el-divider />

        <div class="id-card-section">
          <div class="section-title">身份证信息</div>
          <div class="id-info-grid">
            <div class="id-info-item">
              <span class="label">姓名：</span>
              <span class="value">{{ detail.applicant.idCardName }}</span>
            </div>
            <div class="id-info-item">
              <span class="label">身份证号：</span>
              <span class="value">{{ maskIdCard(detail.applicant.idCardNumber) }}</span>
              <el-button type="primary" link size="small" @click="handleViewFullIdCard">
                查看完整
              </el-button>
            </div>
            <div class="id-info-item">
              <span class="label">有效期：</span>
              <span class="value" :class="{ expired: isExpired(detail.applicant.idCardExpireDate) }">
                {{ detail.applicant.idCardExpireDate }}
                <el-tag v-if="isExpired(detail.applicant.idCardExpireDate)" type="danger" size="small">
                  已过期
                </el-tag>
                <el-tag v-else type="success" size="small">正常</el-tag>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 证明材料区 -->
      <div class="info-card">
        <div class="section-title">证明材料</div>

        <el-tabs v-model="activeTab" class="cert-tabs">
          <el-tab-pane label="身份证正面" name="front">
            <div class="cert-image-wrapper">
              <el-image
                :src="detail.idCardFront"
                :preview-src-list="[detail.idCardFront]"
                fit="contain"
                class="cert-image"
                :zoom-rate="1.2"
                :max-scale="3"
                :min-scale="0.5"
              />
            </div>
          </el-tab-pane>

          <el-tab-pane label="身份证反面" name="back">
            <div class="cert-image-wrapper">
              <el-image
                :src="detail.idCardBack"
                :preview-src-list="[detail.idCardBack]"
                fit="contain"
                class="cert-image"
                :zoom-rate="1.2"
                :max-scale="3"
                :min-scale="0.5"
              />
            </div>
          </el-tab-pane>

          <el-tab-pane label="手持证件照" name="hand">
            <div class="cert-image-wrapper">
              <el-image
                :src="detail.handHoldIdCard"
                :preview-src-list="[detail.handHoldIdCard]"
                fit="contain"
                class="cert-image"
                :zoom-rate="1.2"
                :max-scale="3"
                :min-scale="0.5"
              />
            </div>
            <div class="cert-tip">
              <el-icon color="#faad14"><Warning /></el-icon>
              请确认人脸与证件照一致
            </div>
          </el-tab-pane>

          <el-tab-pane label="房产证明" name="property">
            <div class="cert-images-grid">
              <div v-for="(img, index) in detail.propertyCert" :key="index" class="cert-image-item">
                <el-image
                  :src="img"
                  :preview-src-list="detail.propertyCert"
                  fit="cover"
                  class="cert-thumbnail"
                />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 智能检测提示 -->
      <div v-if="detail.riskInfo" class="info-card">
        <div class="section-title">智能检测结果</div>

        <div class="risk-item normal">
          <el-icon><CircleCheck /></el-icon>
          <span>身份证有效期：{{ detail.applicant.idCardExpireDate }}（正常）</span>
        </div>

        <div v-if="detail.riskInfo.phoneRegistered" class="risk-item warning">
          <el-icon><WarningFilled /></el-icon>
          <span>
            该手机号已注册过其他账号
            <template v-if="detail.riskInfo.relatedAccounts?.length">
              （关联账号：{{ detail.riskInfo.relatedAccounts.join('、') }}）
            </template>
          </span>
        </div>

        <div v-if="detail.riskInfo.riskLevel === 'danger'" class="risk-item danger">
          <el-icon><CircleClose /></el-icon>
          <span>{{ detail.riskInfo.riskDesc }}</span>
        </div>
      </div>
    </el-skeleton>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Phone, Calendar, Warning, CircleCheck, WarningFilled, CircleClose } from '@element-plus/icons-vue';
import type { LandlordAuditDetail } from '@/types';

defineProps<{
  detail: LandlordAuditDetail;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'view-id-card'): void;
}>();

const activeTab = ref('front');

function formatPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

function maskIdCard(idCard: string): string {
  if (idCard.length === 18) {
    return idCard.slice(0, 3) + '***********' + idCard.slice(-4);
  }
  return idCard;
}

function isExpired(expireDate: string): boolean {
  return new Date(expireDate) < new Date();
}

function handleViewFullIdCard() {
  emit('view-id-card');
}
</script>

<style scoped lang="scss">
.landlord-audit-content {
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
  }

  .skeleton-card {
    display: flex;
    gap: 16px;
    padding: 16px;
    background: #fff;
    border-radius: 8px;
    margin-bottom: 16px;

    .skeleton-text {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }

  .applicant-info {
    display: flex;
    gap: 16px;

    .applicant-detail {
      flex: 1;

      .name-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;

        .name {
          font-size: 18px;
          font-weight: 600;
        }
      }

      .info-row {
        display: flex;
        gap: 24px;

        .info-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #595959;
        }
      }
    }
  }

  .id-card-section {
    .id-info-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .id-info-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;

        .label {
          color: #8c8c8c;
          min-width: 70px;
        }

        .value {
          color: #262626;

          &.expired {
            color: #ff4d4f;
          }
        }
      }
    }
  }

  .cert-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 16px;
    }
  }

  .cert-image-wrapper {
    background: #f5f5f5;
    border-radius: 8px;
    overflow: hidden;

    .cert-image {
      width: 100%;
      max-height: 300px;
    }
  }

  .cert-tip {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    font-size: 13px;
    color: #faad14;
  }

  .cert-images-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;

    .cert-image-item {
      aspect-ratio: 1;
      border-radius: 8px;
      overflow: hidden;

      .cert-thumbnail {
        width: 100%;
        height: 100%;
      }
    }
  }

  .risk-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 12px;
    font-size: 14px;

    &.normal {
      background: #f6ffed;
      color: #52c41a;

      .el-icon {
        font-size: 18px;
      }
    }

    &.warning {
      background: #fffbe6;
      color: #faad14;

      .el-icon {
        font-size: 18px;
      }
    }

    &.danger {
      background: #fff2f0;
      color: #f5222d;

      .el-icon {
        font-size: 18px;
      }
    }
  }
}
</style>
