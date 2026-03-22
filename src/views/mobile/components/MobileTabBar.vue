<template>
  <div class="mobile-tab-wrapper">
    <router-view />

    <nav class="tj-tabbar">
      <router-link
        v-for="tab in tabs"
        :key="tab.path"
        :to="tab.path"
        class="tj-tabbar__item"
        :class="{ 'is-active': isActive(tab.path) }"
      >
        <div class="tj-tabbar__icon">
          <van-icon :name="isActive(tab.path) ? tab.activeIcon : tab.icon" size="24" />
          <van-badge
            v-if="tab.badge"
            :content="tab.badge"
            class="tj-tabbar__badge"
          />
        </div>
        <span class="tj-tabbar__text">{{ tab.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const tabs = ref([
  {
    label: '首页',
    path: '/',
    icon: 'wap-home-o',
    activeIcon: 'wap-home',
    badge: null,
  },
  {
    label: '收藏',
    path: '/favorites',
    icon: 'like-o',
    activeIcon: 'like',
    badge: null,
  },
  {
    label: '消息',
    path: '/messages',
    icon: 'chat-o',
    activeIcon: 'chat',
    badge: '3',
  },
  {
    label: '订单',
    path: '/orders',
    icon: 'orders-o',
    activeIcon: 'orders',
    badge: null,
  },
  {
    label: '我的',
    path: '/profile',
    icon: 'user-o',
    activeIcon: 'user',
    badge: null,
  },
]);

function isActive(path: string): boolean {
  if (path === '/') return route.path === '/';
  return route.path.startsWith(path);
}
</script>

<style scoped lang="scss">
.mobile-tab-wrapper {
  width: 100%;
  min-height: 100vh;
  background: var(--tj-bg-page);
}

.tj-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: #ffffff;
  border-top: 0.5px solid #eeeeee;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 900;
}

.tj-tabbar__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #999999;
  height: 100%;
  cursor: pointer;
  transition: opacity 0.15s;

  &:active { opacity: 0.65; }

  &.is-active {
    color: #FF9645;
  }
}

.tj-tabbar__icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
  width: 24px;
  height: 24px;
}

.tj-tabbar__badge {
  position: absolute;
  top: -4px;
  right: -8px;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  font-size: 10px;
  line-height: 16px;
  border-radius: 8px;
  background: #FF4C4C;
  color: #fff;
}

.tj-tabbar__text {
  font-size: 10px;
  transform: scale(0.9);
  transform-origin: center top;
}
</style>
