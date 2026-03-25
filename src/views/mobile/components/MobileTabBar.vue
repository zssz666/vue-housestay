<template>
  <div class="mobile-tab-wrapper">
    <router-view />

    <div class="tab-bar">
      <router-link
        v-for="item in tabs"
        :key="item.path"
        :to="item.path"
        class="tab-item"
        :class="{ active: isActive(item.path) }"
      >
        <div class="icon-wrapper">
          <van-icon
            :name="isActive(item.path) ? item.activeIcon : item.icon"
            size="22"
          />
          <van-badge v-if="item.badge" :content="item.badge" class="badge" />
        </div>
        <span class="tab-text">{{ item.title }}</span>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = ref([
  { title: '首页', path: '/', icon: 'wap-home-o', activeIcon: 'wap-home' },
  { title: '收藏', path: '/favorites', icon: 'like-o', activeIcon: 'like' },
  { title: '消息', path: '/messages', icon: 'chat-o', activeIcon: 'chat', badge: '3' },
  { title: '订单', path: '/orders', icon: 'balance-list-o', activeIcon: 'balance-list' },
  { title: '我的', path: '/profile', icon: 'user-o', activeIcon: 'user' }
])

function isActive(path: string): boolean {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<style scoped lang="scss">
/* 内容区底部留白：胶囊高度 + 离底边距 + 安全区 + 多留一点避免贴边 */
.mobile-tab-wrapper {
  width: 100%;
  min-height: 100vh;
  padding-bottom: calc(56px + 20px + env(safe-area-inset-bottom));
}

/* 子页里若用了全局 .page-container，会与 wrapper 双重留白，这里只保留少量收尾间距 */
.mobile-tab-wrapper :deep(.page-container) {
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
}

/* 漂浮胶囊底栏：不占满宽、大圆角、投影 */
.tab-bar {
  position: fixed;
  left: 15px;
  right: 15px;
  bottom: calc(12px + env(safe-area-inset-bottom));
  z-index: 900;
  height: 56px;
  padding: 0 4px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: #ffffff;
  border-radius: 28px;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
  height: 100%;
  text-decoration: none;
  color: #999999;

  .icon-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    .badge {
      position: absolute;
      top: -5px;
      right: -8px;
      transform: scale(0.92);
      transform-origin: top right;
    }

    /* 角标：红底白字，贴近参考图 */
    :deep(.van-badge) {
      border: 2px solid #fff;
      box-sizing: content-box;
    }

    :deep(.van-badge--fixed) {
      background: #ff4d4f;
    }
  }

  .tab-text {
    font-size: 10px;
    margin-top: 2px;
    transform: scale(0.9);
    line-height: 1.2;
  }

  &.active {
    color: #ff9645;

    :deep(.van-icon) {
      color: #ff9645;
    }
  }

  &:active {
    opacity: 0.7;
  }
}
</style>
