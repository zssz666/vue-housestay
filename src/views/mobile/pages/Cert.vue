<template>
  <div class="tj-page tj-cert-page">
    <!-- 顶部导航 -->
    <div class="tj-page__header">
      <div class="tj-page__header-left" @click="$router.back()">
        <van-icon name="arrow-left" size="20" color="#333" />
      </div>
      <span class="tj-page__header-title">实名认证</span>
      <div class="tj-page__header-right"></div>
    </div>

    <div class="tj-cert-content">
      <!-- 已认证状态 -->
      <div class="tj-cert-tip" v-if="certStatus === 1">
        <div class="tj-cert-tip__icon">
          <van-icon name="checked" size="24" color="#52C41A" />
        </div>
        <div class="tj-cert-tip__text">
          <div class="tj-cert-tip__title">实名认证已通过</div>
          <div class="tj-cert-tip__sub">{{ userInfo?.realName || '—' }} · {{ maskIdCard(userInfo?.idCard || '') }}</div>
        </div>
      </div>

      <!-- 认证表单 -->
      <div class="tj-card tj-cert-form" v-if="certStatus === 0">
        <div class="tj-cert-form__title">
          <van-icon name="idcard" size="18" color="#FF9645" />
          身份信息
        </div>

        <div class="tj-form-item">
          <div class="tj-form-item__label">真实姓名</div>
          <van-field
            v-model="form.realName"
            placeholder="请输入您的真实姓名"
            class="tj-form-item__field"
          />
        </div>

        <div class="tj-form-item">
          <div class="tj-form-item__label">身份证号</div>
          <van-field
            v-model="form.idCard"
            placeholder="请输入18位身份证号码"
            maxlength="18"
            class="tj-form-item__field"
          />
        </div>

        <div class="tj-cert-form__idcard-tip">
          <van-icon name="info-o" size="13" color="#999" />
          身份信息仅用于实名认证，我们将严格保护您的隐私
        </div>

        <van-button
          block
          round
          type="primary"
          class="tj-cert-form__submit"
          :loading="submitting"
          @click="submitCert"
        >
          {{ submitting ? '提交中...' : '提交认证' }}
        </van-button>
      </div>

      <!-- 认证状态说明 -->
      <div class="tj-card tj-cert-info">
        <div class="tj-cert-info__title">认证须知</div>
        <div class="tj-cert-info__item">
          <van-icon name="passed" size="16" color="#52C41A" />
          完成认证可提升账户安全等级
        </div>
        <div class="tj-cert-info__item">
          <van-icon name="passed" size="16" color="#52C41A" />
          部分房源需要实名认证后才能预订
        </div>
        <div class="tj-cert-info__item">
          <van-icon name="passed" size="16" color="#52C41A" />
          认证信息将严格保密，仅用于身份核实
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { showToast, showSuccessToast } from 'vant';
import { useUserStore } from '@/stores/user';
import { userApi } from '@/api/modules/auth';
import type { User } from '@/types';

const userStore = useUserStore();
const userInfo = userStore.userInfo;

const certStatus = ref<number>(-1); // 0=未认证, 1=已认证, -1=加载中
const submitting = ref(false);

const form = ref({
  realName: userInfo?.realName || '',
  idCard: userInfo?.idCard || '',
});

onMounted(async () => {
  try {
    const res = await userApi.getCertStatus();
    certStatus.value = res.certStatus;
    // 如果已认证，从最新用户信息同步
    if (res.certStatus === 1 && userInfo) {
      form.value.realName = userInfo.realName || '';
      form.value.idCard = userInfo.idCard || '';
    }
  } catch {
    certStatus.value = 0;
  }
});

function maskIdCard(idCard: string): string {
  if (!idCard || idCard.length < 8) return idCard;
  return idCard.slice(0, 3) + '***********' + idCard.slice(-4);
}

async function submitCert() {
  if (!form.value.realName.trim()) {
    showToast('请输入真实姓名');
    return;
  }
  if (!/^\d{17}[\dXx]$/.test(form.value.idCard)) {
    showToast('请输入正确的18位身份证号');
    return;
  }
  submitting.value = true;
  try {
    const user: User = await userApi.submitCert({
      realName: form.value.realName.trim(),
      idCard: form.value.idCard.trim(),
    });
    userStore.setUserInfo(user);
    certStatus.value = 1;
    showSuccessToast('实名认证已通过');
  } catch (err: any) {
    showToast(err.message || '提交失败，请重试');
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped lang="scss">
.tj-cert-page {
  min-height: 100vh;
  background: var(--tj-bg-page);
}

.tj-page__header {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 16px;
  background: #fff;
  border-bottom: 1px solid var(--tj-border-light);
  position: sticky;
  top: 0;
  z-index: 100;
}

.tj-page__header-left,
.tj-page__header-right {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.tj-page__header-title {
  flex: 1;
  text-align: center;
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

.tj-cert-content {
  padding: 16px;
}

.tj-cert-tip {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #F6FFED;
  border: 1px solid #B7EB8F;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 16px;
}

.tj-cert-tip__icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #D9F7BE;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tj-cert-tip__title {
  font-size: 14px;
  font-weight: 600;
  color: #52C41A;
  margin-bottom: 4px;
}

.tj-cert-tip__sub {
  font-size: 12px;
  color: #666;
}

.tj-cert-form {
  margin-bottom: 12px;
}

.tj-cert-form__title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  color: var(--tj-text-title);
  margin-bottom: 14px;
}

.tj-form-item {
  margin-bottom: 12px;
}

.tj-form-item__label {
  font-size: 13px;
  color: var(--tj-text-body);
  margin-bottom: 6px;
}

.tj-form-item__field {
  background: var(--tj-bg-hover) !important;
  border-radius: 8px !important;
  padding: 10px 12px !important;

  :deep(.van-field__control) {
    font-size: 14px;
  }
}

.tj-cert-form__idcard-tip {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--tj-text-hint);
  margin-top: 8px;
  margin-bottom: 16px;
}

.tj-cert-form__submit {
  height: 44px;
  font-weight: 700;
  background: linear-gradient(135deg, #FF9645, #FF8C3B) !important;
  border: none !important;
}

.tj-cert-info {
  margin-bottom: 0;
}

.tj-cert-info__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--tj-text-title);
  margin-bottom: 12px;
}

.tj-cert-info__item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--tj-text-body);
  margin-bottom: 10px;

  &:last-child { margin-bottom: 0; }
}
</style>
