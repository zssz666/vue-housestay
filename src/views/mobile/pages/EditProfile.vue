<template>
  <div class="tj-page tj-edit-profile-page">
    <!-- 顶部导航 -->
    <div class="tj-page__header">
      <div class="tj-page__header-left" @click="$router.back()">
        <van-icon name="arrow-left" size="20" color="#333" />
      </div>
      <span class="tj-page__header-title">编辑资料</span>
      <div class="tj-page__header-right">
        <span
          class="tj-save-btn"
          :class="{ disabled: saving }"
          @click="handleSave"
        >
          {{ saving ? '保存中...' : '保存' }}
        </span>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="edit-profile-content">

      <!-- 头像区 -->
      <div class="avatar-section" @click="triggerUpload">
        <div class="avatar-wrap">
          <img
            class="avatar-img"
            :src="form.avatar || defaultAvatar"
            alt="头像"
          />
          <div class="avatar-camera">
            <van-icon name="photograph" size="16" color="#fff" />
          </div>
        </div>
        <div class="avatar-tip">更换头像</div>
      </div>

      <!-- 隐藏的文件上传 -->
      <input
        ref="fileInputEl"
        type="file"
        accept="image/*"
        style="display: none;"
        @change="onFileChange"
      />

      <!-- 表单区 -->
      <van-cell-group class="tj-form-group" inset>
        <!-- 昵称 -->
        <van-field
          v-model="form.nickname"
          label="昵称"
          placeholder="请输入昵称"
          maxlength="20"
          clearable
          :formatter="formatter"
        />

        <!-- 手机号 -->
        <van-field
          v-model="form.phone"
          label="手机号"
          placeholder="请输入手机号"
          disabled
        >
          <template #button>
            <span class="change-phone-btn" @click="showPhonePopup = true">更换</span>
          </template>
        </van-field>

        <!-- 邮箱 -->
        <van-field
          v-model="form.email"
          label="邮箱"
          placeholder="请输入邮箱"
          type="email"
          clearable
          :error-message="emailError"
          @blur="validateEmail"
        />

        <!-- 性别 -->
        <van-cell title="性别" :border="false">
          <template #value>
            <van-radio-group v-model="form.gender" direction="horizontal" class="gender-group">
              <van-radio name="male" shape="square" icon-size="16">男</van-radio>
              <van-radio name="female" shape="square" icon-size="16">女</van-radio>
              <van-radio name="secret" shape="square" icon-size="16">保密</van-radio>
            </van-radio-group>
          </template>
        </van-cell>

        <div class="tj-divider" style="margin: 0 16px;"></div>

        <!-- 生日 -->
        <van-cell
          title="生日"
          is-link
          :value="form.birthday || '未设置'"
          @click="showBirthdayPicker = true"
        />

        <div class="tj-divider" style="margin: 0 16px;"></div>

        <!-- 个性签名 -->
        <van-field
          v-model="form.signature"
          label="个性签名"
          type="textarea"
          placeholder="介绍一下自己吧~"
          maxlength="100"
          rows="2"
          autosize
          show-word-limit
          :border="false"
        />
      </van-cell-group>

      <!-- 实名认证入口 -->
      <van-cell-group class="tj-form-group" inset style="margin-top: 12px;">
        <van-cell
          title="实名认证"
          is-link
          :value="userInfo?.realName ? `已认证 · ${userInfo.realName}` : '未认证'"
          :value-class="userInfo?.realName ? 'cert-done' : 'cert-none'"
          @click="$router.push('/cert')"
        />
      </van-cell-group>

    </div>

    <!-- 更换手机号弹窗 -->
    <van-popup v-model:show="showPhonePopup" position="bottom" round>
      <div class="phone-popup">
        <div class="phone-popup__title">更换手机号</div>
        <van-field
          v-model="newPhone"
          type="tel"
          label="+86"
          placeholder="请输入新手机号"
          maxlength="11"
          clearable
          :error-message="phoneError"
        />
        <div class="phone-popup__code">
          <van-field
            v-model="phoneCode"
            type="digit"
            placeholder="请输入验证码"
            maxlength="6"
            clearable
          />
          <van-button
            size="small"
            round
            :disabled="phoneCountdown > 0"
            class="code-btn"
            @click="sendPhoneCode"
          >
            {{ phoneCountdown > 0 ? `${phoneCountdown}s` : '获取验证码' }}
          </van-button>
        </div>
        <van-button
          type="primary"
          round
          block
          class="phone-popup__submit"
          @click="confirmChangePhone"
        >
          确认更换
        </van-button>
      </div>
    </van-popup>

    <!-- 生日选择器 -->
    <van-calendar
      v-model:show="showBirthdayPicker"
      :min-date="minDate"
      :max-date="maxDate"
      color="#FF9645"
      :default-date="birthdayPickerValue"
      @confirm="onBirthdayConfirm"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { showToast, showSuccessToast, showImagePreview as imagePreview } from 'vant';
import { useUserStore } from '@/stores/user';
import { userApi } from '@/api/modules/auth';
import type { User } from '@/types';

const userStore = useUserStore();
const userInfo = computed(() => userStore.userInfo);

const saving = ref(false);
const loading = ref(false);
const showPhonePopup = ref(false);
const showBirthdayPicker = ref(false);
const fileInputEl = ref<HTMLInputElement | null>(null);

// 表单数据
const form = reactive({
  nickname: '',
  phone: '',
  email: '',
  gender: 'secret',
  birthday: '',
  signature: '',
  avatar: '',
  realName: '',
});

const defaultAvatar = 'https://picsum.photos/128/128?random=888';

// 生日选择器默认选中今天或已有生日
const minDate = new Date(1900, 0, 1);
const maxDate = new Date();
const birthdayPickerValue = ref(new Date());

const emailError = ref('');
const phoneError = ref('');
const newPhone = ref('');
const phoneCode = ref('');
const phoneCountdown = ref(0);
let phoneCountdownTimer: ReturnType<typeof setInterval> | null = null;

// 昵称输入过滤器（去除空格）
function formatter(val: string) {
  return val.replace(/\s+/g, '');
}

// 页面加载时填充数据
onMounted(async () => {
  loading.value = true;
  if (userInfo.value) {
    Object.assign(form, {
      nickname: userInfo.value.nickname || '',
      phone: userInfo.value.phone || '',
      email: userInfo.value.email || '',
      gender: (userInfo.value as any).gender || 'secret',
      birthday: (userInfo.value as any).birthday || '',
      signature: (userInfo.value as any).signature || '',
      avatar: userInfo.value.avatar || '',
      realName: userInfo.value.realName || '',
    });
    if (form.birthday) {
      birthdayPickerValue.value = new Date(form.birthday);
    }
  }

  // 请求最新用户信息
  try {
    const res = await userApi.getUserInfo();
    if (res.code === 200 && res.data) {
      const d = res.data as any;
      Object.assign(form, {
        nickname: d.nickname || '',
        phone: d.phone || '',
        email: d.email || '',
        gender: d.gender || 'secret',
        birthday: d.birthday || '',
        signature: d.signature || '',
        avatar: d.avatar || '',
        realName: d.realName || '',
      });
      if (form.birthday) birthdayPickerValue.value = new Date(form.birthday);
      userStore.setUserInfo(res.data);
    }
  } catch {
    // 使用本地缓存数据
  }
  loading.value = false;
});

onUnmounted(() => {
  if (phoneCountdownTimer) clearInterval(phoneCountdownTimer);
});

// 头像上传
function triggerUpload() {
  fileInputEl.value?.click();
}

async function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showToast('图片大小不能超过 5MB');
    return;
  }
  if (!file.type.startsWith('image/')) {
    showToast('请选择图片文件');
    return;
  }

  // 预览
  const reader = new FileReader();
  reader.onload = (ev) => {
    form.avatar = ev.target?.result as string;
    imagePreview({ images: [form.avatar], showIndex: false });
  };
  reader.readAsDataURL(file);
  target.value = '';
}

function validateEmail() {
  if (!form.email) {
    emailError.value = '';
    return;
  }
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(form.email)) {
    emailError.value = '邮箱格式不正确';
  } else {
    emailError.value = '';
  }
}

// 生日确认
function onBirthdayConfirm(val: Date | Date[]) {
  const date = Array.isArray(val) ? val[0] : val;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  form.birthday = `${y}-${m}-${d}`;
  showBirthdayPicker.value = false;
}

// 发送手机验证码
async function sendPhoneCode() {
  if (!/^1[3-9]\d{9}$/.test(newPhone.value)) {
    phoneError.value = '请输入正确的手机号';
    return;
  }
  phoneError.value = '';
  try {
    await userApi.sendPhoneChangeCode(newPhone.value);
    showToast('验证码已发送');
  } catch {
    showToast('验证码已发送（模拟）');
  }
  phoneCountdown.value = 60;
  phoneCountdownTimer = setInterval(() => {
    phoneCountdown.value--;
    if (phoneCountdown.value <= 0 && phoneCountdownTimer) {
      clearInterval(phoneCountdownTimer);
      phoneCountdownTimer = null;
    }
  }, 1000);
}

// 确认更换手机号
async function confirmChangePhone() {
  if (!/^1[3-9]\d{9}$/.test(newPhone.value)) {
    phoneError.value = '请输入正确的手机号';
    return;
  }
  if (!phoneCode.value || phoneCode.value.length < 4) {
    showToast('请输入验证码');
    return;
  }
  phoneError.value = '';

  try {
    const res = await userApi.updateUserInfo({ phone: newPhone.value, code: phoneCode.value });
    if (res.code === 200) {
      form.phone = newPhone.value;
      showPhonePopup.value = false;
      newPhone.value = '';
      phoneCode.value = '';
      showSuccessToast({ message: '手机号更换成功' });
    }
  } catch {
    form.phone = newPhone.value;
    showPhonePopup.value = false;
    newPhone.value = '';
    phoneCode.value = '';
    showToast('手机号更换成功（模拟）');
  }
}

// 保存
async function handleSave() {
  if (saving.value) return;
  if (!form.nickname.trim()) {
    showToast('请输入昵称');
    return;
  }
  if (form.email) validateEmail();
  if (emailError.value) return;

  saving.value = true;
  try {
    const updateData: any = {
      nickname: form.nickname.trim(),
      email: form.email,
      avatar: form.avatar,
    };
    // 追加可选字段
    if (form.birthday) updateData.birthday = form.birthday;
    if (form.signature) updateData.signature = form.signature;
    if (form.gender) updateData.gender = form.gender;

    const res = await userApi.updateUserInfo(updateData);
    if (res.code === 200) {
      userStore.setUserInfo(res.data as User);
      showSuccessToast({ message: '保存成功' });
      setTimeout(() => history.back(), 800);
    } else {
      // Mock 保存成功
      mockSave();
    }
  } catch {
    mockSave();
  }
  saving.value = false;
}

function mockSave() {
  userStore.setUserInfo({
    ...(userStore.userInfo as any),
    nickname: form.nickname.trim(),
    email: form.email,
    avatar: form.avatar,
    birthday: form.birthday,
    signature: form.signature,
    gender: form.gender,
  } as User);
  showSuccessToast({ message: '保存成功' });
  setTimeout(() => history.back(), 800);
}
</script>

<style scoped lang="scss">
.tj-edit-profile-page {
  min-height: 100vh;
  background: #F7F8FA;
}

.tj-page__header {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 4px 0 0;
  background: #fff;
  border-bottom: 1px solid #F0F0F0;
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
  justify-content: center;
  cursor: pointer;
}

.tj-page__header-right {
  justify-content: flex-end;
}

.tj-page__header-title {
  flex: 1;
  text-align: center;
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

.tj-save-btn {
  font-size: 15px;
  color: #FF9645;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;

  &.disabled {
    color: #C0C0C0;
  }
}

/* 内容区 */
.edit-profile-content {
  padding: 20px 16px;
}

/* 头像区 */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
  cursor: pointer;
}

.avatar-wrap {
  position: relative;
  width: 80px;
  height: 80px;
}

.avatar-img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 150, 69, 0.3);
}

.avatar-camera {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 26px;
  height: 26px;
  background: linear-gradient(135deg, #FF9645, #FF7B3D);
  border-radius: 50%;
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(255, 150, 69, 0.4);
}

.avatar-tip {
  margin-top: 8px;
  font-size: 13px;
  color: #FF9645;
  font-weight: 500;
}

/* 表单组 */
.tj-form-group {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.van-cell) {
  padding: 14px 16px;

  &::after {
    border-color: #F0F0F0;
  }

  .van-cell__title {
    color: #333;
    font-size: 15px;
    flex: 0 0 80px;
  }

  .van-cell__value {
    color: #666;
    font-size: 14px;
  }
}

:deep(.van-field__control) {
  color: #333;
  font-size: 14px;

  &::placeholder {
    color: #BFBFBF;
  }

  &:disabled {
    color: #999;
  }
}

.change-phone-btn {
  font-size: 14px;
  color: #FF9645;
  font-weight: 500;
  cursor: pointer;
}

/* 性别选择 */
.gender-group {
  display: flex;
  gap: 16px;

  :deep(.van-radio__label) {
    color: #666;
    font-size: 14px;
  }

  :deep(.van-radio--disabled .van-radio__label) {
    color: #BFBFBF;
  }
}

/* 实名认证状态文字 */
.cert-done {
  color: #52C41A !important;
  font-size: 14px;
}

.cert-none {
  color: #FAAD14 !important;
  font-size: 14px;
}

/* 更换手机号弹窗 */
.phone-popup {
  padding: 20px 20px calc(20px + env(safe-area-inset-bottom));
}

.phone-popup__title {
  text-align: center;
  font-size: 17px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.phone-popup__code {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;

  :deep(.van-field) {
    flex: 1;
    background: #F7F8FA;
    border-radius: 8px;
    padding: 10px 14px;
  }
}

.code-btn {
  background: transparent !important;
  border: none !important;
  color: #FF9645 !important;
  font-size: 14px;
  white-space: nowrap;
  padding: 0;
  width: auto;
  height: auto;
}

.phone-popup__submit {
  margin-top: 20px;
  background: linear-gradient(135deg, #FF9645, #FF7B3D) !important;
  border: none !important;
  font-weight: 600;
}
</style>
