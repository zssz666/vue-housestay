import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Homestay } from '@/types';
import type { MobileGuest } from '../types';

export const useOrderStore = defineStore('mobile-order', () => {
  // 当前预订的房源
  const selectedHomestay = ref<Homestay | null>(null);

  // 日期
  const checkInDate = ref('');
  const checkOutDate = ref('');

  // 入住人（同行人）
  const selectedGuests = ref<MobileGuest[]>([]);

  // 联系手机
  const contactPhone = ref('');

  // 人数
  const adultCount = ref(1);
  const childCount = ref(0);

  // 备注
  const remark = ref('');

  // 计算属性
  const totalNights = computed(() => {
    if (!checkInDate.value || !checkOutDate.value) return 0;
    const start = new Date(checkInDate.value);
    const end = new Date(checkOutDate.value);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  });

  const basePrice = computed(() => {
    if (!selectedHomestay.value || !totalNights.value) return 0;
    return selectedHomestay.value.price * totalNights.value;
  });

  const serviceFee = computed(() => {
    return Math.round(basePrice.value * 0.1);
  });

  const cleaningFee = computed(() => {
    return 50;
  });

  const totalPrice = computed(() => {
    return basePrice.value + serviceFee.value + cleaningFee.value;
  });

  // Actions
  function initBooking(homestay: Homestay) {
    selectedHomestay.value = homestay;
    checkInDate.value = '';
    checkOutDate.value = '';
    selectedGuests.value = [];
    contactPhone.value = '';
    adultCount.value = 1;
    childCount.value = 0;
    remark.value = '';
  }

  function setDateRange(checkIn: string, checkOut: string) {
    checkInDate.value = checkIn;
    checkOutDate.value = checkOut;
  }

  function setSelectedGuests(guests: MobileGuest[]) {
    selectedGuests.value = guests;
  }

  function setContactPhone(phone: string) {
    contactPhone.value = phone;
  }

  function setGuestCounts(adults: number, children: number) {
    adultCount.value = adults;
    childCount.value = children;
  }

  function clearBooking() {
    selectedHomestay.value = null;
    checkInDate.value = '';
    checkOutDate.value = '';
    selectedGuests.value = [];
    contactPhone.value = '';
    adultCount.value = 1;
    childCount.value = 0;
    remark.value = '';
  }

  return {
    selectedHomestay,
    checkInDate,
    checkOutDate,
    selectedGuests,
    contactPhone,
    adultCount,
    childCount,
    remark,
    totalNights,
    basePrice,
    serviceFee,
    cleaningFee,
    totalPrice,
    initBooking,
    setDateRange,
    setSelectedGuests,
    setContactPhone,
    setGuestCounts,
    clearBooking,
  };
}, {
  persist: true,
});
