<template>
  <div class="tj-page tj-cert-page">
    <!-- 顶部导航 -->
    <div class="tj-page__header">
      <div class="tj-page__header-left" @click="$router.back()">
        <van-icon name="arrow-left" size="20" color="#333" />
      </div>
      <span class="tj-page__header-title">学生认证</span>
      <div class="tj-page__header-right"></div>
    </div>

    <div class="tj-cert-content">
      <!-- 未通过实名认证 -->
      <div class="tj-cert-tip tj-cert-tip--warning" v-if="certStatus !== 1">
        <div class="tj-cert-tip__icon">
          <van-icon name="warning" size="24" color="#FAAD14" />
        </div>
        <div class="tj-cert-tip__text">
          <div class="tj-cert-tip__title">请先完成实名认证</div>
          <div class="tj-cert-tip__sub">学生认证需要您先完成实名身份认证</div>
        </div>
        <van-button size="small" round class="tj-cert-tip__btn" @click="$router.push('/cert')">
          去认证
        </van-button>
      </div>

      <!-- 已学生认证 -->
      <div class="tj-cert-tip" v-if="certStatus === 1 && studentStatus === 1">
        <div class="tj-cert-tip__icon">
          <van-icon name="checked" size="24" color="#52C41A" />
        </div>
        <div class="tj-cert-tip__text">
          <div class="tj-cert-tip__title">学生认证已通过</div>
          <div class="tj-cert-tip__sub">您可以享受学生专属权益</div>
        </div>
      </div>

      <!-- 年龄超限 -->
      <div class="tj-cert-tip tj-cert-tip--disabled" v-if="certStatus === 1 && !eligible && studentStatus === 0">
        <div class="tj-cert-tip__icon">
          <van-icon name="warning" size="24" color="#999" />
        </div>
        <div class="tj-cert-tip__text">
          <div class="tj-cert-tip__title">暂不符合学生认证条件</div>
          <div class="tj-cert-tip__sub" v-if="age > 22">学生认证仅限22岁及以下用户，您当前 {{ age }} 岁</div>
          <div class="tj-cert-tip__sub" v-else-if="age < 0">请先在编辑资料中设置您的生日</div>
        </div>
      </div>

      <!-- 认证表单：实名认证通过 + 年龄符合 + 未认证 -->
      <div class="tj-card tj-cert-form" v-if="certStatus === 1 && eligible && studentStatus === 0">
        <div class="tj-cert-form__title">
          <van-icon name="coupon-o" size="18" color="#FF9645" />
          学生认证
        </div>

        <!-- 年龄提示 -->
        <div class="tj-cert-form__age-tip">
          <van-icon name="info-o" size="13" color="#1677FF" />
          您的年龄 {{ age }} 岁，符合学生认证条件
        </div>

        <!-- 学生证照片 -->
        <div class="tj-form-item">
          <div class="tj-form-item__label">学生证照片</div>
          <div class="tj-cert-form__upload">
            <div class="tj-cert-form__upload-placeholder" v-if="!studentCardUrl" @click="triggerUpload">
              <van-icon name="photograph" size="28" color="#DCDEE0" />
              <div class="tj-cert-form__upload-text">点击上传学生证</div>
            </div>
            <div class="tj-cert-form__upload-preview" v-else @click="triggerUpload">
              <img :src="studentCardUrl" alt="学生证" class="tj-cert-form__upload-img" />
              <div class="tj-cert-form__upload-mask">
                <van-icon name="photograph" size="24" color="#fff" />
              </div>
            </div>
          </div>
          <div class="tj-form-item__hint">请上传学生证封面页，要求信息清晰可辨</div>
        </div>

        <van-button
          block
          round
          type="primary"
          class="tj-cert-form__submit"
          :loading="submitting"
          :disabled="!studentCardUrl"
          @click="submitStudentCert"
        >
          {{ submitting ? '提交中...' : '提交认证' }}
        </van-button>
      </div>

      <!-- 认证说明 -->
      <div class="tj-card tj-cert-info">
        <div class="tj-cert-info__title">学生认证说明</div>
        <div class="tj-cert-info__item">
          <van-icon name="passed" size="16" color="#52C41A" />
          仅限22岁及以下用户申请
        </div>
        <div class="tj-cert-info__item">
          <van-icon name="passed" size="16" color="#52C41A" />
          必须先完成实名认证
        </div>
        <div class="tj-cert-info__item">
          <van-icon name="passed" size="16" color="#52C41A" />
          审核通过后可享受学生专属权益
        </div>
        <div class="tj-cert-info__item">
          <van-icon name="passed" size="16" color="#52C41A" />
          学生证照片需清晰显示姓名、学校等信息
        </div>
      </div>
    </div>

    <input
      ref="fileInputEl"
      type="file"
      accept="image/*"
      style="display:none"
      @change="onFileChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { showToast, showSuccessToast, showImagePreview } from 'vant';
import { userApi } from '@/api/modules/auth';
import { uploadApi } from '@/api/modules/landlord';

const certStatus = ref<number>(-1);   // 实名认证状态 0=未认证, 1=已认证
const studentStatus = ref<number>(0); // 学生认证状态 0=未认证, 1=已认证
const age = ref<number>(-1);         // 年龄
const eligible = ref<boolean>(false); // 是否符合学生认证条件

const studentCardUrl = ref<string>('');
const submitting = ref(false);
const fileInputEl = ref<HTMLInputElement | null>(null);

onMounted(async () => {
  try {
    const res = await userApi.getStudentCertStatus();
    certStatus.value = res.certStatus;
    studentStatus.value = res.studentStatus;
    age.value = res.age;
    eligible.value = res.eligible;
  } catch {
    certStatus.value = 0;
    studentStatus.value = 0;
  }
});

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
    studentCardUrl.value = ev.target?.result as string;
    showImagePreview({ images: [studentCardUrl.value], showIndex: false });
  };
  reader.readAsDataURL(file);
  target.value = '';
}

async function submitStudentCert() {
  if (!studentCardUrl.value) {
    showToast('请上传学生证照片');
    return;
  }

  submitting.value = true;
  try {
    // 如果是 base64，先上传到服务器获取 URL
    let url = studentCardUrl.value;
    if (url.startsWith('data:')) {
      const blob = await fetch(url).then(r => r.blob());
      const uploadFile = new File([blob], 'student_card.jpg', { type: blob.type });
      const res = await uploadApi.uploadImage(uploadFile, 'student-card');
      url = res.url;
    }

    await userApi.submitStudentCert(url);
    studentStatus.value = 1; // 已认证
    showSuccessToast('学生认证已通过');
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

  &--warning {
    background: #FFFBE6;
    border-color: #FFE58F;
  }

  &--disabled {
    background: #F5F5F5;
    border-color: #D9D9D9;

    .tj-cert-tip__title { color: #999; }
    .tj-cert-tip__sub { color: #999; }
  }
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

  .tj-cert-tip--warning & {
    background: #FFF1B8;
  }

  .tj-cert-tip--disabled & {
    background: #F0F0F0;
  }
}

.tj-cert-tip__text {
  flex: 1;
  min-width: 0;
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

.tj-cert-tip__btn {
  background: linear-gradient(135deg, #FF9645, #FF8C3B) !important;
  border: none !important;
  font-size: 12px;
  padding: 0 12px;
  height: 28px;
  flex-shrink: 0;
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

.tj-cert-form__age-tip {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #1677FF;
  background: #E6F4FF;
  border-radius: 6px;
  padding: 8px 10px;
  margin-bottom: 16px;
}

.tj-form-item {
  margin-bottom: 12px;
}

.tj-form-item__label {
  font-size: 13px;
  color: var(--tj-text-body);
  margin-bottom: 8px;
}

.tj-form-item__hint {
  font-size: 12px;
  color: var(--tj-text-hint);
  margin-top: 6px;
}

.tj-cert-form__upload {
  position: relative;
}

.tj-cert-form__upload-placeholder {
  width: 100%;
  height: 180px;
  border: 2px dashed #DCDEE0;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: border-color 0.2s;

  &:active { border-color: #FF9645; }
}

.tj-cert-form__upload-text {
  font-size: 13px;
  color: #969799;
}

.tj-cert-form__upload-preview {
  position: relative;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
}

.tj-cert-form__upload-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.tj-cert-form__upload-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.tj-cert-form__submit {
  height: 44px;
  font-weight: 700;
  background: linear-gradient(135deg, #FF9645, #FF8C3B) !important;
  border: none !important;
  margin-top: 16px;

  &[disabled] {
    background: #D9D9D9 !important;
  }
}

.tj-cert-form__pending {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  gap: 8px;
}

.tj-cert-form__pending-text {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.tj-cert-form__pending-sub {
  font-size: 12px;
  color: #999;
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
