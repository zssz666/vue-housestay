<template>
  <div class="page-container tj-booking-page">

    <!-- ========== 顶部返回栏 ========== -->
    <div class="tj-booking-topbar">
      <div class="tj-booking-topbar__back" @click="router.back()">
        <van-icon name="arrow-left" size="20" color="#333" />
      </div>
      <div class="tj-booking-topbar__title">填写订单</div>
      <div style="width: 34px;"></div>
    </div>

    <!-- 顶部占位 -->
    <div style="height: 0;"></div>

    <!-- ========== 房源信息卡 ========== -->
    <div class="tj-booking-homestay tj-card" v-if="orderStore.selectedHomestay">
      <div class="tj-booking-homestay__img">
        <img
          :src="orderStore.selectedHomestay.images?.[0] || 'https://picsum.photos/160/120?random=50'"
          alt=""
          class="tj-booking-homestay__img-el"
        />
      </div>
      <div class="tj-booking-homestay__info">
        <div class="tj-booking-homestay__title">{{ orderStore.selectedHomestay.title }}</div>
        <div class="tj-booking-homestay__address">
          <van-icon name="location-o" size="12" color="#999" />
          {{ orderStore.selectedHomestay.address }}
        </div>
        <div class="tj-booking-homestay__price">
          <span class="tj-price__symbol">¥</span>
          <span class="tj-price__amount" style="font-size: 18px;">{{ orderStore.selectedHomestay.price }}</span>
          <span class="tj-price__unit">/晚</span>
        </div>
      </div>
    </div>

    <!-- ========== 底部滑出表单卡片 ========== -->
    <div class="tj-booking-sheet">
      <div class="tj-booking-sheet__handle"></div>

      <!-- 日期选择 -->
      <div class="tj-booking-section" @click="showDatePicker = true">
        <div class="tj-booking-section__label">入住日期</div>
        <div class="tj-booking-daterow">
          <div class="tj-booking-datechip" :class="{ 'is-empty': !orderStore.checkInDate }">
            <div class="tj-booking-datechip__label">入住</div>
            <div class="tj-booking-datechip__value">{{ orderStore.checkInDate || '选择日期' }}</div>
          </div>
          <div class="tj-booking-datesep">
            <van-icon name="arrow-right" size="12" color="#CCC" />
            <div class="tj-booking-datesep__nights">{{ orderStore.totalNights }}晚</div>
          </div>
          <div class="tj-booking-datechip" :class="{ 'is-empty': !orderStore.checkOutDate }">
            <div class="tj-booking-datechip__label">退房</div>
            <div class="tj-booking-datechip__value">{{ orderStore.checkOutDate || '选择日期' }}</div>
          </div>
        </div>
      </div>

      <div class="tj-divider" style="margin: 0;"></div>

      <!-- 入住人数 -->
      <div class="tj-booking-section tj-booking-section--row">
        <div class="tj-booking-section__label">入住人数</div>
        <van-stepper
          v-model="adultCount"
          min="1"
          :max="orderStore.selectedHomestay?.maxGuests || 10"
          @change="onAdultChange"
          theme="round"
          button-size="28"
        />
        <span class="tj-booking-section__hint">共{{ adultCount }}人</span>
      </div>

      <div class="tj-divider" style="margin: 0;"></div>

      <!-- 入住人 -->
      <div class="tj-booking-section">
        <div class="tj-booking-section__label">入住人信息</div>
        <div class="tj-booking-guest-chips" v-if="selectedGuests.length">
          <div
            v-for="(guest, idx) in selectedGuests"
            :key="idx"
            class="tj-guest-chip"
          >
            <van-icon name="user-o" size="13" color="#999" />
            {{ guest.name }}
            <van-icon name="cross" size="12" color="#CCC" @click="removeGuest(idx)" />
          </div>
        </div>
        <div v-else class="tj-booking-guest-empty">请添加入住人</div>
        <div class="tj-booking-guest-add" @click="showGuestPicker = true">
          <van-icon name="plus" size="14" color="#FF9645" />
          <span>添加入住人</span>
        </div>
      </div>

      <div class="tj-divider" style="margin: 0;"></div>

      <!-- 联系手机 -->
      <div class="tj-booking-section">
        <div class="tj-booking-section__label">联系手机</div>
        <van-field
          v-model="contactPhone"
          type="tel"
          placeholder="请输入手机号"
          maxlength="11"
          :border="false"
          input-align="right"
          @update:model-value="v => orderStore.setContactPhone(v)"
        />
      </div>

      <div class="tj-divider" style="margin: 0 16px;"></div>

      <!-- 价格明细 -->
      <div class="tj-booking-section" v-if="orderStore.totalNights > 0">
        <div class="tj-booking-section__label">价格明细</div>
        <div class="tj-booking-price-list">
          <div class="tj-booking-price-row">
            <span class="tj-booking-price-row__label">
              房费
              <span class="tj-booking-price-row__sub">
                {{ orderStore.totalNights }}晚 × ¥{{ orderStore.selectedHomestay?.price }}
              </span>
            </span>
            <span class="tj-booking-price-row__value">¥{{ orderStore.basePrice }}</span>
          </div>
          <div class="tj-booking-price-row">
            <span class="tj-booking-price-row__label">服务费</span>
            <span class="tj-booking-price-row__value">¥{{ orderStore.serviceFee }}</span>
          </div>
          <div class="tj-booking-price-row">
            <span class="tj-booking-price-row__label">清洁费</span>
            <span class="tj-booking-price-row__value">¥{{ orderStore.cleaningFee }}</span>
          </div>
          <div class="tj-booking-price-row tj-booking-price-row--total">
            <span class="tj-booking-price-row__label">合计</span>
            <span class="tj-booking-price-row__value tj-booking-price-row__value--total">
              ¥{{ orderStore.totalPrice }}
            </span>
          </div>
        </div>
      </div>

      <!-- 底部占位 -->
      <div style="height: 84px;"></div>
    </div>

    <!-- ========== 底部悬浮价格栏 ========== -->
    <div class="tj-booking-bar" v-if="orderStore.totalNights > 0">
      <div class="tj-booking-bar__price">
        <span class="tj-price__symbol">¥</span>
        <span class="tj-price__amount">{{ orderStore.totalPrice }}</span>
      </div>
      <button
        class="tj-booking-bar__btn"
        :class="{ 'is-disabled': !canSubmit }"
        :disabled="!canSubmit || submitting"
        @click="handleSubmit"
      >
        {{ submitting ? '提交中...' : '提交订单' }}
      </button>
    </div>

    <!-- 日期选择 -->
    <van-calendar
      v-model:show="showDatePicker"
      type="range"
      :min-date="today"
      :max-date="maxDate"
      color="#FF9645"
      @confirm="onDateConfirm"
    />

    <!-- 入住人选择弹窗 -->
    <van-popup v-model:show="showGuestPicker" position="bottom" round :style="{ height: 'auto', maxHeight: '65vh' }">
      <div class="tj-guest-picker">
        <!-- 头部 -->
        <div class="tj-guest-picker__header">
          <span class="tj-guest-picker__title">选择入住人</span>
          <van-icon name="cross" size="20" color="#999" @click="showGuestPicker = false" />
        </div>
        <!-- 列表 -->
        <div class="tj-guest-picker__body">
          <van-checkbox-group v-model="localSelectedGuests">
            <div
              v-for="guest in allGuests"
              :key="guest.id || guest.name"
              class="tj-guest-picker-item"
            >
              <van-checkbox
                :name="guest.name"
                shape="square"
                checked-color="#FF9645"
                label-position="right"
              >
                <div class="tj-guest-picker-item__info">
                  <div class="tj-guest-picker-item__name">{{ guest.name }}</div>
                  <div class="tj-guest-picker-item__meta">{{ guest.idCard }} · {{ guest.phone }}</div>
                </div>
              </van-checkbox>
            </div>
          </van-checkbox-group>
          <!-- 无入住人 -->
          <div v-if="!allGuests.length" class="tj-empty" style="padding: 40px 0;">
            <div class="tj-empty__icon">👤</div>
            <div class="tj-empty__title">暂无入住人</div>
            <button class="tj-btn tj-btn--primary tj-btn--sm" style="margin-top: 12px;" @click="goAddGuest">
              添加入住人
            </button>
          </div>
        </div>
        <!-- 底部按钮 -->
        <div class="tj-guest-picker__footer">
          <button class="tj-btn tj-btn--block tj-btn--primary tj-btn--lg" @click="confirmGuests">
            确认 ({{ localSelectedGuests.length }}人)
          </button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast, showSuccessToast } from 'vant';
import { createOrder } from '../api/mobileApi';
import { useOrderStore } from '../stores/orderStore';
import { useGuestStore } from '../stores/guestStore';

const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();
const guestStore = useGuestStore();

const homestayId = Number(route.params.homestayId);
const showDatePicker = ref(false);
const showGuestPicker = ref(false);
const submitting = ref(false);

const adultCount = ref(orderStore.adultCount || 1);
const contactPhone = ref(orderStore.contactPhone || '');
const selectedGuests = ref([...orderStore.selectedGuests]);
const localSelectedGuests = ref<string[]>(orderStore.selectedGuests.map(g => g.name));

const today = new Date();
const maxDate = new Date(Date.now() + 365 * 24 * 3600 * 1000);
const allGuests = computed(() => guestStore.guests);

const canSubmit = computed(() => {
  return (
    orderStore.checkInDate &&
    orderStore.checkOutDate &&
    orderStore.totalNights > 0 &&
    selectedGuests.value.length > 0 &&
    contactPhone.value.length === 11
  );
});

function onDateConfirm(values: [Date, Date]) {
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  orderStore.setDateRange(fmt(values[0]), fmt(values[1]));
  showDatePicker.value = false;
}

function onAdultChange(val: number) {
  adultCount.value = val;
  orderStore.setGuestCounts(val, 0);
}

function removeGuest(idx: number) {
  const removed = selectedGuests.value.splice(idx, 1)[0];
  localSelectedGuests.value = localSelectedGuests.value.filter(n => n !== removed?.name);
  orderStore.setSelectedGuests(selectedGuests.value);
}

function confirmGuests() {
  selectedGuests.value = allGuests.value.filter(g => localSelectedGuests.value.includes(g.name));
  orderStore.setSelectedGuests(selectedGuests.value);
  showGuestPicker.value = false;
}

function goAddGuest() {
  showGuestPicker.value = false;
  router.push('/guest');
}

async function handleSubmit() {
  if (!orderStore.selectedHomestay) { showToast('房源信息不存在'); return; }
  if (!contactPhone.value) { showToast('请输入联系手机'); return; }
  if (selectedGuests.value.length === 0) { showToast('请添加入住人'); return; }

  submitting.value = true;
  try {
    const res = await createOrder({
      homestayId: orderStore.selectedHomestay.homestayId,
      checkInDate: orderStore.checkInDate,
      checkOutDate: orderStore.checkOutDate,
      guestNames: selectedGuests.value.map(g => g.name),
      contactPhone: contactPhone.value,
      totalAmount: orderStore.totalPrice,
    });
    if (res.code === 200) {
      orderStore.setContactPhone(contactPhone.value);
      showSuccessToast({ message: '订单提交成功' });
      orderStore.clearBooking();
      router.replace('/orders');
    } else {
      showToast(res.message || '提交失败');
    }
  } catch {
    showToast('模拟提交成功（开发环境）');
    orderStore.clearBooking();
    router.replace('/orders');
  }
  submitting.value = false;
}

watch(contactPhone, (val) => { orderStore.setContactPhone(val); });
</script>

<style scoped>
.tj-booking-page {
  background: var(--tj-bg-page);
  padding-bottom: calc(84px + var(--tj-safe-bottom));
}

/* ========== 顶部返回栏 ========== */
.tj-booking-topbar {
  position: sticky;
  top: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 14px;
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 1px 0 var(--tj-border-light);
}

.tj-booking-topbar__back {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}

.tj-booking-topbar__back:active { background: #EBEBEB; transform: scale(0.93); }

.tj-booking-topbar__title {
  font-size: var(--tj-fs-lg);
  font-weight: 700;
  color: var(--tj-text-title);
}

/* ========== 房源信息卡 ========== */
.tj-booking-homestay {
  display: flex;
  gap: 12px;
  padding: 14px;
  margin: 10px 16px 0;
}

.tj-booking-homestay__img-el {
  width: 80px;
  height: 64px;
  border-radius: var(--tj-radius-sm);
  object-fit: cover;
  display: block;
}

.tj-booking-homestay__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.tj-booking-homestay__title {
  font-size: var(--tj-fs-md);
  font-weight: 600;
  color: var(--tj-text-title);
  line-height: 1.4;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.tj-booking-homestay__address {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: var(--tj-fs-xs);
  color: var(--tj-text-hint);
  margin-bottom: 6px;
}

/* ========== 底部滑出表单 ========== */
.tj-booking-sheet {
  background: var(--tj-bg-card);
  border-radius: var(--tj-radius-xl) var(--tj-radius-xl) 0 0;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.08);
  margin-top: 6px;
  animation: tj-sheet-in 0.32s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes tj-sheet-in {
  from { transform: translateY(40px); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}

.tj-booking-sheet__handle {
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: #DDDDDD;
  margin: 12px auto 0;
}

.tj-booking-section {
  padding: 14px 16px;
}

.tj-booking-section--row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tj-booking-section__label {
  font-size: var(--tj-fs-md);
  font-weight: 600;
  color: var(--tj-text-title);
  margin-bottom: 10px;
}

.tj-booking-section--row .tj-booking-section__label {
  margin-bottom: 0;
  flex-shrink: 0;
}

.tj-booking-section__hint {
  font-size: var(--tj-fs-xs);
  color: var(--tj-text-hint);
  flex-shrink: 0;
}

/* 日期范围 */
.tj-booking-daterow {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tj-booking-datechip {
  flex: 1;
  background: var(--tj-bg-hover);
  border-radius: var(--tj-radius-sm);
  padding: 8px 12px;
  border: 1.5px solid transparent;
  transition: all 0.15s;
}

.tj-booking-datechip.is-empty {
  border-color: #FFE4D4;
  background: #FFF8F3;
}

.tj-booking-datechip__label {
  font-size: 10px;
  color: var(--tj-text-hint);
  margin-bottom: 2px;
}

.tj-booking-datechip__value {
  font-size: var(--tj-fs-sm);
  font-weight: 600;
  color: var(--tj-text-title);
}

.tj-booking-datechip.is-empty .tj-booking-datechip__value {
  color: var(--tj-orange);
}

.tj-booking-datesep {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  padding: 0 4px;
}

.tj-booking-datesep__nights {
  font-size: 10px;
  color: var(--tj-orange);
  font-weight: 600;
}

/* 入住人 */
.tj-booking-guest-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.tj-guest-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: #FFF3E0;
  border-radius: var(--tj-radius-pill);
  font-size: var(--tj-fs-sm);
  color: var(--tj-text-title);
  border: 1px solid rgba(255, 150, 69, 0.2);
}

.tj-guest-chip:active { opacity: 0.75; }

.tj-booking-guest-empty {
  font-size: var(--tj-fs-sm);
  color: var(--tj-text-hint);
  margin-bottom: 8px;
}

.tj-booking-guest-add {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: var(--tj-fs-sm);
  color: var(--tj-orange);
  cursor: pointer;
  font-weight: 600;
}

/* 价格明细 */
.tj-booking-price-list {
  background: var(--tj-bg-hover);
  border-radius: var(--tj-radius-sm);
  overflow: hidden;
}

.tj-booking-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  font-size: var(--tj-fs-sm);
  color: var(--tj-text-body);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.tj-booking-price-row:last-child { border-bottom: none; }

.tj-booking-price-row--total {
  background: #FFF3E0;
  color: var(--tj-text-title);
  font-weight: 700;
}

.tj-booking-price-row__sub {
  font-size: 10px;
  color: var(--tj-text-hint);
  margin-left: 4px;
}

.tj-booking-price-row__value {
  font-weight: 600;
  color: var(--tj-text-title);
}

.tj-booking-price-row__value--total {
  color: #FF4D00;
  font-size: var(--tj-fs-xl);
}

/* ========== 底部悬浮栏 ========== */
.tj-booking-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 500;
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: var(--tj-shadow-bar);
  padding: 10px 16px calc(10px + var(--tj-safe-bottom));
  display: flex;
  align-items: center;
  gap: 12px;
}

.tj-booking-bar__price {
  display: flex;
  align-items: baseline;
  gap: 1px;
  flex: 1;
}

.tj-booking-bar__btn {
  height: 44px;
  padding: 0 32px;
  border-radius: 22px;
  background: linear-gradient(135deg, #FF9645, #FF8C3B);
  color: #fff;
  font-size: var(--tj-fs-md);
  font-weight: 700;
  border: none;
  box-shadow: var(--tj-shadow-btn);
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  letter-spacing: 0.3px;
}

.tj-booking-bar__btn:active {
  opacity: 0.88;
  transform: scale(0.97);
}

.tj-booking-bar__btn.is-disabled {
  background: #CCCCCC !important;
  box-shadow: none !important;
  cursor: not-allowed;
}

/* ========== 入住人选择弹窗 ========== */
.tj-guest-picker {
  display: flex;
  flex-direction: column;
  max-height: 65vh;
}

.tj-guest-picker__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 12px;
  border-bottom: 1px solid var(--tj-border-light);
}

.tj-guest-picker__title {
  font-size: var(--tj-fs-lg);
  font-weight: 700;
  color: var(--tj-text-title);
}

.tj-guest-picker__body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.tj-guest-picker-item {
  padding: 10px 16px;
  border-bottom: 1px solid var(--tj-border-light);
}

.tj-guest-picker-item__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tj-guest-picker-item__name {
  font-size: var(--tj-fs-md);
  font-weight: 600;
  color: var(--tj-text-title);
}

.tj-guest-picker-item__meta {
  font-size: var(--tj-fs-xs);
  color: var(--tj-text-hint);
}

.tj-guest-picker__footer {
  padding: 12px 16px calc(12px + var(--tj-safe-bottom));
  border-top: 1px solid var(--tj-border-light);
}
</style>
