<template>
  <div class="booking-page">
    <div class="booking-container">
      <div class="steps-wrapper">
        <el-steps :active="currentStep" finish-status="success" align-center>
          <el-step title="填写信息" />
          <el-step title="确认支付" />
          <el-step title="预订成功" />
        </el-steps>
      </div>

      <!-- Step 1: Info -->
      <div v-if="currentStep === 0" class="step-content info-step">
        <div class="left-col">
          <div class="section-card">
            <h3>您的行程</h3>
            <div class="trip-info">
              <div class="info-row">
                <span class="label">日期</span>
                <span class="value">{{ bookingStore.checkInDate }} - {{ bookingStore.checkOutDate }}</span>
              </div>
              <div class="info-row">
                <span class="label">房客</span>
                <span class="value">{{ bookingStore.adultCount }}位成人, {{ bookingStore.childCount }}位儿童</span>
              </div>
            </div>
          </div>

          <div class="section-card">
            <h3>入住人信息</h3>
            <el-form :model="guestForm" ref="guestFormRef" label-position="top">
              <div v-for="(guest, index) in guestForm.guests" :key="index" class="guest-item">
                <h4>入住人 {{ index + 1 }}</h4>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="姓名" :prop="'guests.' + index + '.name'" :rules="{ required: true, message: '请输入姓名', trigger: 'blur' }">
                      <el-input v-model="guest.name" placeholder="与证件一致" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="身份证号" :prop="'guests.' + index + '.idCard'" :rules="{ required: true, message: '请输入身份证号', trigger: 'blur' }">
                      <el-input v-model="guest.idCard" placeholder="用于身份核验" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
              <el-button v-if="guestForm.guests.length < bookingStore.adultCount" @click="addGuest" type="primary" plain size="small">
                添加入住人
              </el-button>
            </el-form>
          </div>
          
          <div class="section-card">
            <h3>联系方式</h3>
            <el-form-item label="手机号码">
              <el-input v-model="contactPhone" placeholder="接收预订确认短信" />
            </el-form-item>
          </div>
        </div>

        <div class="right-col sticky-col">
          <div class="price-card">
            <div class="homestay-summary">
              <el-image :src="homestay?.images[0]" fit="cover" class="summary-img" />
              <div class="summary-text">
                <div class="subtitle">{{ homestay?.cityCode }}</div>
                <div class="title">{{ homestay?.title }}</div>
                <div class="rating">
                  <el-icon><StarFilled /></el-icon> {{ homestay?.rating }} ({{ homestay?.reviewCount }}条评价)
                </div>
              </div>
            </div>
            
            <el-divider />
            
            <div class="price-detail">
              <h3>价格明细</h3>
              <div class="row">
                <span>¥{{ homestay?.price }} x {{ bookingStore.totalNights }}晚</span>
                <span>¥{{ bookingStore.basePrice }}</span>
              </div>
              <div class="row">
                <span>清洁费</span>
                <span>¥{{ bookingStore.cleaningFee }}</span>
              </div>
              <div class="row">
                <span>服务费</span>
                <span>¥{{ bookingStore.serviceFee }}</span>
              </div>
              <el-divider />
              <div class="row total">
                <span>总价 (CNY)</span>
                <span>¥{{ bookingStore.totalPrice }}</span>
              </div>
            </div>

            <el-button type="primary" size="large" class="submit-btn" @click="goToPayment">
              提交订单
            </el-button>
          </div>
        </div>
      </div>

      <!-- Step 2: Payment -->
      <div v-if="currentStep === 1" class="step-content payment-step">
        <div class="payment-container">
          <div class="timer-alert">
            <el-icon><Timer /></el-icon>
            请在 15:00 内完成支付，否则订单将自动取消
          </div>
          
          <div class="amount-display">
            <div class="label">支付金额</div>
            <div class="amount">¥{{ bookingStore.totalPrice }}</div>
          </div>

          <div class="payment-methods">
            <h3>选择支付方式</h3>
            <div class="method-list">
              <div 
                class="method-item" 
                :class="{ active: payMethod === 'alipay' }"
                @click="payMethod = 'alipay'"
              >
                <div class="icon alipay">支</div>
                <span>支付宝</span>
              </div>
              <div 
                class="method-item" 
                :class="{ active: payMethod === 'wechat' }"
                @click="payMethod = 'wechat'"
              >
                <div class="icon wechat">微</div>
                <span>微信支付</span>
              </div>
            </div>
          </div>

          <el-button type="primary" size="large" class="pay-btn" :loading="paying" @click="handlePay">
            立即支付
          </el-button>
        </div>
      </div>

      <!-- Step 3: Success -->
      <div v-if="currentStep === 2" class="step-content success-step">
        <el-result
          icon="success"
          title="预订成功！"
          sub-title="您的订单已确认，我们将发送短信至您的手机。"
        >
          <template #extra>
            <el-button type="primary" @click="router.push('/orders')">查看订单</el-button>
            <el-button @click="router.push('/')">返回首页</el-button>
          </template>
        </el-result>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 对应论文第5章5.5节
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBookingStore } from '@/stores/booking';
import { StarFilled, Timer } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import confetti from 'canvas-confetti';

const router = useRouter();
const bookingStore = useBookingStore();
const guestFormRef = ref();

const currentStep = ref(0);
const paying = ref(false);
const payMethod = ref('alipay');
const contactPhone = ref('');

const homestay = computed(() => bookingStore.selectedHomestay);

const guestForm = reactive({
  guests: bookingStore.guests
});

const addGuest = () => {
  guestForm.guests.push({ name: '', idCard: '', phone: '' });
};

const goToPayment = async () => {
  if (!guestFormRef.value) return;
  await guestFormRef.value.validate((valid: boolean) => {
    if (valid) {
      if (!contactPhone.value) {
        ElMessage.warning('请输入联系手机');
        return;
      }
      bookingStore.updateGuests(guestForm.guests);
      bookingStore.contactPhone = contactPhone.value;
      currentStep.value = 1;
    }
  });
};

const handlePay = () => {
  paying.value = true;
  // Simulate payment
  setTimeout(() => {
    paying.value = false;
    currentStep.value = 2;
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, 2000);
};

onMounted(() => {
  if (!bookingStore.selectedHomestay) {
    ElMessage.error('无预订信息，请重新选择');
    router.push('/');
  }
  // Initialize guests if empty
  if (bookingStore.guests.length === 0) {
    bookingStore.guests = [{ name: '', idCard: '', phone: '' }];
  }
});
</script>

<style scoped lang="scss">
.booking-page {
  padding-top: 80px;
  background-color: #f7f7f7;
  min-height: 100vh;
  padding-bottom: 80px;
}

.booking-container {
  max-width: 1120px;
  margin: 0 auto;
  padding: 40px 20px;
}

.steps-wrapper {
  margin-bottom: 40px;
}

.step-content {
  &.info-step {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 40px;
  }
}

.section-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.08);

  h3 { margin-top: 0; margin-bottom: 16px; font-size: 18px; }
}

.guest-item {
  border-bottom: 1px solid #eee;
  padding-bottom: 16px;
  margin-bottom: 16px;
  &:last-child { border-bottom: none; }
  h4 { margin-bottom: 12px; font-size: 14px; color: #717171; }
}

.sticky-col {
  position: sticky;
  top: 100px;
  height: fit-content;
}

.price-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #ddd;
  box-shadow: 0 6px 16px rgba(0,0,0,0.12);

  .homestay-summary {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    .summary-img { width: 80px; height: 80px; border-radius: 8px; }
    .summary-text {
      .subtitle { font-size: 12px; color: #717171; }
      .title { font-size: 14px; font-weight: 600; margin: 4px 0; }
      .rating { font-size: 12px; display: flex; align-items: center; gap: 4px; }
    }
  }

  .price-detail {
    margin: 16px 0;
    h3 { font-size: 16px; margin-bottom: 12px; }
    .row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      color: #717171;
      font-size: 14px;
      
      &.total {
        color: #222;
        font-weight: 700;
        font-size: 16px;
        margin-top: 12px;
      }
    }
  }
  
  .submit-btn { width: 100%; font-weight: 700; background-color: var(--color-primary); border-color: var(--color-primary); }
}

.payment-container {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);

  .timer-alert {
    background: #fff0f0;
    color: #ff5a5f;
    padding: 12px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 24px;
  }

  .amount-display {
    text-align: center;
    margin-bottom: 40px;
    .label { color: #717171; margin-bottom: 8px; }
    .amount { font-size: 36px; font-weight: 700; color: #222; }
  }

  .method-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 40px;

    .method-item {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover { border-color: #222; }
      &.active { border-color: var(--color-primary); background-color: #fff8f8; }

      .icon {
        width: 32px;
        height: 32px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        &.alipay { background-color: #1677FF; }
        &.wechat { background-color: #07C160; }
      }
    }
  }
  
  .pay-btn { width: 100%; font-weight: 700; background-color: var(--color-primary); border-color: var(--color-primary); }
}

@media (max-width: 768px) {
  .step-content.info-step { grid-template-columns: 1fr; }
  .sticky-col { position: static; margin-top: 24px; }
}
</style>
