import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Homestay, GuestInfo } from '@/types';

export const useBookingStore = defineStore('booking', () => {
  const currentStep = ref(0);
  const selectedHomestay = ref<Homestay | null>(null);
  const checkInDate = ref<string>('');
  const checkOutDate = ref<string>('');
  const guests = ref<GuestInfo[]>([{ name: '', idCard: '', phone: '' }]);
  const contactPhone = ref('');
  const adultCount = ref(1);
  const childCount = ref(0);
  const discountAmount = ref(0);
  
  // Computed Properties
  const totalNights = computed(() => {
    if (!checkInDate.value || !checkOutDate.value) return 0;
    const diff = new Date(checkOutDate.value).getTime() - new Date(checkInDate.value).getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  });

  const basePrice = computed(() => {
    if (!selectedHomestay.value || totalNights.value <= 0) return 0;
    return selectedHomestay.value.price * totalNights.value;
  });

  const serviceFee = computed(() => basePrice.value * 0.1); // 10% service fee
  const cleaningFee = computed(() => 50); // Fixed cleaning fee for simplicity

  const totalPrice = computed(() => {
    return basePrice.value + serviceFee.value + cleaningFee.value - discountAmount.value;
  });

  function initBooking(homestay: Homestay, checkIn: string, checkOut: string, adults: number, children: number) {
    selectedHomestay.value = homestay;
    checkInDate.value = checkIn;
    checkOutDate.value = checkOut;
    adultCount.value = adults;
    childCount.value = children;
    currentStep.value = 0;
    // Reset guests
    guests.value = Array(adults).fill({ name: '', idCard: '', phone: '' }).map((_x, _i) => ({ name: '', idCard: '', phone: '' }));
  }

  function updateGuests(newGuests: GuestInfo[]) {
    guests.value = newGuests;
  }
  
  function nextStep() {
    currentStep.value++;
  }

  function prevStep() {
    if (currentStep.value > 0) currentStep.value--;
  }

  function clearBooking() {
    selectedHomestay.value = null;
    checkInDate.value = '';
    checkOutDate.value = '';
    guests.value = [];
    currentStep.value = 0;
  }

  return {
    currentStep,
    selectedHomestay,
    checkInDate,
    checkOutDate,
    guests,
    contactPhone,
    adultCount,
    childCount,
    discountAmount,
    totalNights,
    basePrice,
    serviceFee,
    cleaningFee,
    totalPrice,
    initBooking,
    updateGuests,
    nextStep,
    prevStep,
    clearBooking
  };
}, {
  persist: true
});
