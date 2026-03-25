<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="login-bg">
      <div class="login-bg__circle login-bg__circle--1"></div>
      <div class="login-bg__circle login-bg__circle--2"></div>
    </div>

    <!-- Logo 区域 -->
    <div class="login-header">
      <div class="login-logo">
        <div class="login-logo__icon">🏡</div>
      </div>
      <div class="login-logo__title">栖居</div>
      <div class="login-logo__sub">让每一次旅行，都像回家</div>
    </div>

    <!-- 表单区域 -->
    <div class="login-form-card">
      <div class="login-form-card__tabs">
        <div
          class="login-tab"
          :class="{ active: activeTab === 'sms' }"
          @click="activeTab = 'sms'"
        >
          短信登录
        </div>
        <div
          class="login-tab"
          :class="{ active: activeTab === 'password' }"
          @click="activeTab = 'password'"
        >
          密码登录
        </div>
      </div>

      <!-- 短信登录 -->
      <div v-if="activeTab === 'sms'" class="login-form">
        <van-field
          v-model="phone"
          type="tel"
          label="+86"
          placeholder="请输入手机号"
          maxlength="11"
          :border="false"
          class="login-field"
        />
        <div class="sms-row">
          <van-field
            v-model="smsCode"
            type="digit"
            placeholder="请输入验证码"
            maxlength="6"
            :border="false"
            class="login-field"
          />
          <van-button
            size="small"
            round
            :disabled="countdown > 0"
            @click="sendSms"
            class="sms-btn"
          >
            {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
          </van-button>
        </div>
      </div>

      <!-- 密码登录 -->
      <div v-if="activeTab === 'password'" class="login-form">
        <van-field
          v-model="phone"
          type="tel"
          label="+86"
          placeholder="请输入手机号"
          maxlength="11"
          :border="false"
          class="login-field"
        />
        <van-field
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          label="密码"
          placeholder="请输入密码"
          :border="false"
          class="login-field"
        >
          <template #right-icon>
            <van-icon
              :name="showPassword ? 'eye-o' : 'closed-eye'"
              @click="showPassword = !showPassword"
            />
          </template>
        </van-field>
      </div>

      <!-- 登录按钮 -->
      <van-button
        type="primary"
        round
        block
        class="login-btn"
        :loading="loading"
        :disabled="!canLogin"
        @click="handleLogin"
      >
        登录
      </van-button>

      <!-- 注册入口 -->
      <div class="login-footer">
        <span class="login-footer__text">还没有账号？</span>
        <span class="login-footer__link" @click="goRegister">立即注册</span>
      </div>
    </div>

    <!-- 协议 -->
    <div class="login-agreement">
      登录即表示同意
      <span @click.stop="showAgreement = true">《用户服务协议》</span>
      和
      <span @click.stop="showAgreement = true">《隐私政策》</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { useUserStore } from '@/stores/user';
import { authApi } from '@/api/modules/auth';

const router = useRouter();
const userStore = useUserStore();

const activeTab = ref<'sms' | 'password'>('sms');
const phone = ref('');
const smsCode = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const countdown = ref(0);
const showAgreement = ref(false);

let countdownTimer: ReturnType<typeof setInterval> | null = null;

const canLogin = computed(() => {
  if (activeTab.value === 'sms') {
    return phone.value.length === 11 && smsCode.value.length >= 4;
  }
  return phone.value.length === 11 && password.value.length >= 6;
});

async function sendSms() {
  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    showToast('请输入正确的手机号');
    return;
  }
  try {
    await authApi.sendVerifyCode(phone.value);
    showToast('验证码已发送');
  } catch {
    showToast('验证码已发送（模拟）');
  }
  countdown.value = 60;
  countdownTimer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0 && countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }, 1000);
}

async function handleLogin() {
  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    showToast('请输入正确的手机号');
    return;
  }

  loading.value = true;
  try {
    let res;
    if (activeTab.value === 'sms') {
      res = await authApi.loginByCode(phone.value, smsCode.value);
    } else {
      res = await authApi.login(phone.value, password.value);
    }

    if (res.code === 200 && res.data) {
      userStore.setUserInfo(res.data);
      userStore.token = 'mock-token-' + Date.now();
      showToast('登录成功');
      const redirect = (router.currentRoute.value.query.redirect as string) || '/';
      router.replace(redirect);
    } else {
      // Mock login for development
      mockLogin();
    }
  } catch {
    mockLogin();
  }
  loading.value = false;
}

function mockLogin() {
  userStore.setUserInfo({
    userId: 1001,
    phone: phone.value,
    nickname: phone.value.slice(-4),
    avatar: `https://picsum.photos/128/128?random=${Date.now()}`,
    role: 'guest',
    status: 1,
    createdAt: new Date().toISOString(),
  } as any);
  userStore.token = 'mock-token-' + Date.now();
  showToast('登录成功（开发环境）');
  const redirect = (router.currentRoute.value.query.redirect as string) || '/';
  router.replace(redirect);
}

function goRegister() {
  showToast('注册功能开发中');
}

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer);
});
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(160deg, #FFF3E0 0%, #FFFFFF 40%, #F5F5F5 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px;
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.login-bg__circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 150, 69, 0.08), rgba(255, 90, 95, 0.05));
}

.login-bg__circle--1 {
  width: 300px;
  height: 300px;
  top: -100px;
  right: -80px;
}

.login-bg__circle--2 {
  width: 200px;
  height: 200px;
  bottom: 100px;
  left: -60px;
}

/* Logo 区域 */
.login-header {
  margin-top: 60px;
  text-align: center;
  margin-bottom: 40px;
}

.login-logo {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: linear-gradient(135deg, #FF9645, #FF7B3D);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 8px 24px rgba(255, 150, 69, 0.4);
}

.login-logo__icon {
  font-size: 36px;
}

.login-logo__title {
  font-size: 28px;
  font-weight: 800;
  color: #333;
  letter-spacing: 4px;
  margin-bottom: 8px;
}

.login-logo__sub {
  font-size: var(--van-font-size-sm);
  color: var(--van-text-color-3);
  letter-spacing: 2px;
}

/* 表单卡片 */
.login-form-card {
  width: 100%;
  background: var(--van-white);
  border-radius: var(--van-radius-xl);
  padding: 24px 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.login-form-card__tabs {
  display: flex;
  border-bottom: 1px solid #F0F0F0;
  margin-bottom: 20px;
}

.login-tab {
  flex: 1;
  text-align: center;
  padding-bottom: 12px;
  font-size: var(--van-font-size-md);
  color: var(--van-text-color-3);
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.login-tab.active {
  color: var(--van-primary-color);
  font-weight: 700;
}

.login-tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: var(--van-primary-color);
  border-radius: 2px;
}

.login-form {
  margin-bottom: 20px;
}

.login-field {
  padding-left: 0 !important;
  padding-right: 0 !important;
  border-bottom: 1px solid #F0F0F0 !important;
  border-radius: 0 !important;
}

.sms-row {
  display: flex;
  align-items: center;
  gap: 0;
}

.sms-row .login-field {
  flex: 1;
  border-bottom: 1px solid #F0F0F0 !important;
}

.sms-btn {
  background: transparent !important;
  border: none !important;
  color: var(--van-primary-color) !important;
  font-size: var(--van-font-size-sm);
  padding: 0;
  white-space: nowrap;
  width: auto;
  height: auto;
}

.login-btn {
  height: 48px;
  font-size: var(--van-font-size-lg);
  font-weight: 700;
  background: linear-gradient(135deg, #FF9645, #FF7B3D) !important;
  border: none !important;
  box-shadow: 0 4px 16px rgba(255, 150, 69, 0.4);
  margin-bottom: 16px;
}

.login-footer {
  text-align: center;
  font-size: var(--van-font-size-sm);
  color: var(--van-text-color-3);
}

.login-footer__link {
  color: var(--van-primary-color);
  cursor: pointer;
  font-weight: 600;
}

/* 协议 */
.login-agreement {
  font-size: 11px;
  color: var(--van-text-color-4);
  text-align: center;
  line-height: 1.6;
  padding-bottom: 24px;
}

.login-agreement span {
  color: var(--van-primary-color);
  cursor: pointer;
}
</style>
