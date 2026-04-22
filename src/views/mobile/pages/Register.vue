<template>
  <div class="register-page">
    <div class="login-bg">
      <div class="login-bg__circle login-bg__circle--1"></div>
      <div class="login-bg__circle login-bg__circle--2"></div>
    </div>

    <div class="register-header">
      <div class="login-logo">
        <div class="login-logo__icon"><img src='/icon.svg' alt="logo"></div>
      </div>
      <div class="login-logo__title">栖居</div>
      <div class="login-logo__sub">欢迎加入，开启您的旅程</div>
    </div>

    <div class="register-form-card">
      <div class="register-form">
        <!-- 头像 -->
        <div class="avatar-section">
          <van-uploader
            :after-read="handleAvatarUpload"
            :max-count="1"
            :preview-size="80"
            accept="image/*"
            class="avatar-uploader"
          >
            <div class="avatar-wrapper">
              <img v-if="form.avatar" :src="form.avatar" class="avatar-img" alt="头像" />
              <div v-else class="avatar-placeholder">
                <van-icon name="plus" size="24" />
              </div>
              <div v-if="uploadingAvatar" class="avatar-loading">
                <van-loading type="spinner" size="20" color="#fff" />
              </div>
            </div>
          </van-uploader>
          <div class="avatar-tip">点击上传头像</div>
        </div>

        <!-- 手机号 -->
        <van-field
          v-model="form.phone"
          type="tel"
          label="+86"
          placeholder="请输入手机号"
          maxlength="11"
          :border="false"
          class="register-field"
          :error-message="errors.phone"
        />

        <!-- 验证码 -->
        <van-field
          v-model="form.code"
          type="digit"
          label="验证码"
          placeholder="请输入验证码"
          maxlength="6"
          :border="false"
          class="register-field"
          :error-message="errors.code"
        >
          <template #button>
            <van-button
              size="small"
              type="primary"
              plain
              hairline
              :disabled="countdown > 0 || sendingCode"
              :loading="sendingCode"
              @click="handleSendCode"
              class="code-btn"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </van-button>
          </template>
        </van-field>

        <!-- 密码 -->
        <van-field
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          label="密码"
          placeholder="请设置登录密码"
          :border="false"
          class="register-field"
          :error-message="errors.password"
        >
          <template #right-icon>
            <van-icon
              :name="showPassword ? 'eye-o' : 'closed-eye'"
              @click="showPassword = !showPassword"
            />
          </template>
        </van-field>

        <!-- 确认密码 -->
        <van-field
          v-model="form.confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          label="确认"
          placeholder="请再次输入密码"
          :border="false"
          class="register-field"
          :error-message="errors.confirmPassword"
        >
          <template #right-icon>
            <van-icon
              :name="showConfirmPassword ? 'eye-o' : 'closed-eye'"
              @click="showConfirmPassword = !showConfirmPassword"
            />
          </template>
        </van-field>

        <!-- 昵称 -->
        <van-field
          v-model="form.nickname"
          label="昵称"
          placeholder="请输入昵称（选填）"
          maxlength="20"
          :border="false"
          class="register-field"
        />

        <!-- 性别 -->
        <div class="gender-row">
          <span class="gender-label">性别</span>
          <van-radio-group v-model="form.gender" direction="horizontal" class="gender-group">
            <van-radio :name="1" shape="square" icon-size="14">男</van-radio>
            <van-radio :name="0" shape="square" icon-size="14">女</van-radio>
          </van-radio-group>
        </div>

        <!-- 生日 -->
        <div class="birthday-row" @click="showBirthdayPicker = true">
          <span class="birthday-label">生日</span>
          <span class="birthday-value">{{ form.birthday || '选填' }}</span>
          <van-icon name="calendar-o" size="16" color="#969799" />
        </div>

        <van-button
          type="primary"
          round
          block
          class="register-btn"
          :loading="loading"
          :disabled="!canRegister"
          @click="handleRegister"
        >
          注册
        </van-button>

        <div class="register-footer">
          <span class="register-footer__text">已有账号？</span>
          <span class="register-footer__link" @click="goLogin">立即登录</span>
        </div>
      </div>
    </div>

    <div class="register-agreement">
      注册即表示同意
      <span @click.stop="showAgreement = true">《用户服务协议》</span>
      和
      <span @click.stop="showAgreement = true">《隐私政策》</span>
    </div>
    <van-calendar
      v-model:show="showBirthdayPicker"
      :min-date="minDate"
      :max-date="maxDate"
      color="#FF9645"
      @confirm="onBirthdayConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showLoadingToast, closeToast } from 'vant';
import { useUserStore } from '@/stores/user';
import { authApi } from '@/api/modules/auth';
import { uploadToCos } from '@/utils/cos';

const router = useRouter();
const userStore = useUserStore();

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);
const sendingCode = ref(false);
const uploadingAvatar = ref(false);
const countdown = ref(0);
const showAgreement = ref(false);
let countdownTimer: ReturnType<typeof setInterval> | null = null;

const form = reactive({
  phone: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  code: '',
  avatar: '',
  gender: null as number | null,
  birthday: '',
});

const showBirthdayPicker = ref(false);
const minDate = new Date(1900, 0, 1);
const maxDate = new Date();

const errors = reactive({
  phone: '',
  password: '',
  confirmPassword: '',
  code: ''
});

const canRegister = computed(() => {
  return form.phone.length === 11
    && form.code.length === 6
    && form.password.length >= 6
    && form.confirmPassword.length >= 6;
});

async function handleSendCode() {
  errors.phone = '';
  if (!form.phone) {
    errors.phone = '请输入手机号';
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(form.phone)) {
    errors.phone = '请输入正确的手机号';
    return;
  }

  sendingCode.value = true;
  try {
    await authApi.sendVerifyCode(form.phone);
    showToast({ message: '验证码已发送', wordBreak: 'break-all' });
    countdown.value = 60;
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(countdownTimer!);
        countdownTimer = null;
      }
    }, 1000);
  } catch (err: any) {
    showToast(err.message || '发送失败');
  } finally {
    sendingCode.value = false;
  }
}

async function handleAvatarUpload(file: any) {
  uploadingAvatar.value = true;
  try {
    const url = await uploadToCos(file.file, (percent) => {
      // 进度回调，可在此更新 UI
    });
    form.avatar = url;
  } catch (err: any) {
    showToast(err.message || '头像上传失败');
  } finally {
    uploadingAvatar.value = false;
  }
}

function validateForm(): boolean {
  let valid = true;
  errors.phone = '';
  errors.password = '';
  errors.confirmPassword = '';
  errors.code = '';

  if (!form.phone) {
    errors.phone = '请输入手机号';
    valid = false;
  } else if (!/^1[3-9]\d{9}$/.test(form.phone)) {
    errors.phone = '请输入正确的手机号';
    valid = false;
  }

  if (!form.code) {
    errors.code = '请输入验证码';
    valid = false;
  } else if (form.code.length !== 6) {
    errors.code = '验证码为6位数字';
    valid = false;
  }

  if (!form.password) {
    errors.password = '请输入密码';
    valid = false;
  } else if (form.password.length < 6) {
    errors.password = '密码至少6位';
    valid = false;
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = '请再次输入密码';
    valid = false;
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = '两次密码输入不一致';
    valid = false;
  }

  return valid;
}

async function handleRegister() {
  if (!validateForm()) return;

  loading.value = true;
  try {
    const res = await authApi.register({
      phone: form.phone,
      password: form.password,
      code: form.code,
      nickname: form.nickname || undefined,
      avatar: form.avatar || undefined,
      gender: form.gender ?? undefined,
      birthday: form.birthday || undefined,
    });

    if (res && res.token && res.user) {
      userStore.login(res.user, res.token);
      showToast({ message: '注册成功', onOpened: () => {
        const redirect = (router.currentRoute.value.query.redirect as string) || '/';
        router.replace(redirect);
      }});
    } else {
      showToast('注册失败，请重试');
    }
  } catch (err: any) {
    showToast(err.message || '注册失败，请重试');
  } finally {
    loading.value = false;
  }
}

function goLogin() {
  router.push('/login');
}

function onBirthdayConfirm(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  form.birthday = `${y}-${m}-${d}`;
  showBirthdayPicker.value = false;
}
</script>

<style scoped>
.register-page {
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

.register-header {
  margin-top: 60px;
  text-align: center;
  margin-bottom: 32px;
}

.login-logo {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 8px 24px rgba(255, 150, 69, 0.4);
  background-color: #fff;
  overflow: hidden;
}

.login-logo__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.login-logo__icon img {
  width: 72px;
  height: 72px;
  object-fit: cover;
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

.register-form-card {
  width: 100%;
  background: var(--van-white);
  border-radius: var(--van-radius-xl);
  padding: 24px 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.register-form {
  margin-bottom: 8px;
}

/* 头像 */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.avatar-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  border: 2px dashed #dcdee0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #969799;
}

.avatar-loading {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.avatar-tip {
  margin-top: 8px;
  font-size: 12px;
  color: var(--van-text-color-4);
}

.avatar-uploader :deep(.van-uploader__wrapper) {
  width: auto;
  height: auto;
}

.avatar-uploader :deep(.van-uploader__input-wrapper) {
  width: auto;
  height: auto;
}

.register-field {
  padding-left: 0 !important;
  padding-right: 0 !important;
  border-bottom: 1px solid #F0F0F0 !important;
  border-radius: 0 !important;
}

.code-btn {
  font-size: 13px;
  padding: 0 8px;
  height: 28px;
  border-radius: 4px;
}

.gender-row,
.birthday-row {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #F0F0F0;
  font-size: var(--van-cell-line-height);
  color: var(--van-cell-text-color);
}

.gender-label,
.birthday-label {
  color: var(--van-cell-label-color);
  font-size: var(--van-cell-font-size);
  margin-right: 16px;
  flex-shrink: 0;
}

.birthday-row {
  justify-content: flex-start;
  gap: 8px;
  cursor: pointer;
}

.birthday-value {
  flex: 1;
  color: var(--van-cell-value-color);
}

.register-btn {
  height: 48px;
  font-size: var(--van-font-size-lg);
  font-weight: 700;
  background: linear-gradient(135deg, #FF9645, #FF7B3D) !important;
  border: none !important;
  box-shadow: 0 4px 16px rgba(255, 150, 69, 0.4);
  margin-top: 24px;
  margin-bottom: 16px;
}

.register-footer {
  text-align: center;
  font-size: var(--van-font-size-sm);
  color: var(--van-text-color-3);
}

.register-footer__link {
  color: var(--van-primary-color);
  cursor: pointer;
  font-weight: 600;
}

.register-agreement {
  font-size: 11px;
  color: var(--van-text-color-4);
  text-align: center;
  line-height: 1.6;
  padding-bottom: 24px;
}

.register-agreement span {
  color: var(--van-primary-color);
  cursor: pointer;
}
</style>
