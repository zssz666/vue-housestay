import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { MobileGuest } from '../types';

export const useGuestStore = defineStore('mobile-guest', () => {
  // 同行人列表
  const guests = ref<MobileGuest[]>([]);

  function setGuests(list: MobileGuest[]) {
    guests.value = list;
  }

  function addGuest(guest: MobileGuest) {
    guests.value.push(guest);
  }

  function removeGuest(index: number) {
    guests.value.splice(index, 1);
  }

  function updateGuest(index: number, guest: MobileGuest) {
    guests.value[index] = guest;
  }

  function clearGuests() {
    guests.value = [];
  }

  return { guests, setGuests, addGuest, removeGuest, updateGuest, clearGuests };
}, {
  persist: true,
});
