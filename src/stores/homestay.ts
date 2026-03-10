import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Homestay } from '@/types';

export const useHomestayStore = defineStore('homestay', () => {
  const homestayList = ref<Homestay[]>([]);
  const currentHomestay = ref<Homestay | null>(null);
  const loading = ref(false);

  // Filters
  const searchParams = ref({
    cityCode: '',
    keyword: '',
    dateRange: [] as [Date, Date] | [],
    guestCount: 1,
    priceRange: [100, 5000],
    facilities: [] as string[],
    roomType: [] as string[],
  });

  function setHomestayList(list: Homestay[]) {
    homestayList.value = list;
  }

  function setCurrentHomestay(homestay: Homestay) {
    currentHomestay.value = homestay;
  }

  function updateSearchParams(params: Partial<typeof searchParams.value>) {
    searchParams.value = { ...searchParams.value, ...params };
  }

  function clearSearchParams() {
    searchParams.value = {
      cityCode: '',
      keyword: '',
      dateRange: [],
      guestCount: 1,
      priceRange: [100, 5000],
      facilities: [],
      roomType: [],
    };
  }

  return {
    homestayList,
    currentHomestay,
    loading,
    searchParams,
    setHomestayList,
    setCurrentHomestay,
    updateSearchParams,
    clearSearchParams
  };
});
