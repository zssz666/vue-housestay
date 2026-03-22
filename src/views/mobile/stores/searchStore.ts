import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { MobileSearchParams } from '../types';

export const useSearchStore = defineStore('mobile-search', () => {
  const params = ref<MobileSearchParams>({
    page: 1,
    size: 10,
  });

  const cityCode = ref('');
  const keyword = ref('');
  const checkIn = ref('');
  const checkOut = ref('');
  const guestCount = ref(1);
  const priceRange = ref<[number, number]>([0, 10000]);
  const facilities = ref<string[]>([]);
  const roomType = ref('');

  const activeTab = ref<'list' | 'map'>('list');

  const searchParams = computed<MobileSearchParams>(() => ({
    cityCode: cityCode.value,
    keyword: keyword.value,
    checkIn: checkIn.value,
    checkOut: checkOut.value,
    guestCount: guestCount.value,
    minPrice: priceRange.value[0] || undefined,
    maxPrice: priceRange.value[1] || undefined,
    facilities: facilities.value.length ? facilities.value : undefined,
    roomType: roomType.value || undefined,
    page: params.value.page,
    size: params.value.size,
  }));

  function updateSearch(newParams: Partial<MobileSearchParams>) {
    params.value = { ...params.value, ...newParams };
  }

  function setCity(code: string) {
    cityCode.value = code;
  }

  function setKeyword(kw: string) {
    keyword.value = kw;
  }

  function setDateRange(checkInDate: string, checkOutDate: string) {
    checkIn.value = checkInDate;
    checkOut.value = checkOutDate;
  }

  function setGuests(count: number) {
    guestCount.value = count;
  }

  function setPriceRange(min: number, max: number) {
    priceRange.value = [min, max];
  }

  function toggleFacility(facility: string) {
    const idx = facilities.value.indexOf(facility);
    if (idx === -1) {
      facilities.value.push(facility);
    } else {
      facilities.value.splice(idx, 1);
    }
  }

  function setRoomType(type: string) {
    roomType.value = type;
  }

  function setActiveTab(tab: 'list' | 'map') {
    activeTab.value = tab;
  }

  function nextPage() {
    params.value.page!++;
  }

  function resetPage() {
    params.value.page = 1;
  }

  function clearAll() {
    cityCode.value = '';
    keyword.value = '';
    checkIn.value = '';
    checkOut.value = '';
    guestCount.value = 1;
    priceRange.value = [0, 10000];
    facilities.value = [];
    roomType.value = '';
    params.value.page = 1;
  }

  return {
    params,
    cityCode,
    keyword,
    checkIn,
    checkOut,
    guestCount,
    priceRange,
    facilities,
    roomType,
    activeTab,
    searchParams,
    updateSearch,
    setCity,
    setKeyword,
    setDateRange,
    setGuests,
    setPriceRange,
    toggleFacility,
    setRoomType,
    setActiveTab,
    nextPage,
    resetPage,
    clearAll,
  };
});
