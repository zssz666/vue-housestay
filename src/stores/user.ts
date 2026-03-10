import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '@/types';

export const useUserStore = defineStore('user', () => {
  const token = ref<string>('');
  const userInfo = ref<User | null>(null);

  const isLoggedIn = computed(() => !!token.value);

  function login(userData: User, authToken: string) {
    userInfo.value = userData;
    token.value = authToken;
  }

  function logout() {
    userInfo.value = null;
    token.value = '';
  }

  function updateUserInfo(data: Partial<User>) {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...data };
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    logout,
    updateUserInfo
  };
}, {
  persist: true // Enable persistence
});
