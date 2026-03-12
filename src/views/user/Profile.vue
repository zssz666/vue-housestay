<template>
  <div class="profile-layout">
    <div class="profile-container">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="user-card">
          <el-avatar :size="80" :src="userStore.userInfo?.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
          <h3 class="nickname">{{ userStore.userInfo?.nickname || 'Guest' }}</h3>
          <p class="role-badge">{{ getRoleName(userStore.userInfo?.role) }}</p>
        </div>
        
        <nav class="side-menu">
          <router-link 
            v-for="item in menuItems" 
            :key="item.path" 
            :to="item.path" 
            class="menu-item"
            active-class="active"
            :target="item.target"
            rel="noopener"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.label }}</span>
          </router-link>
        </nav>
      </aside>

      <!-- Content -->
      <main class="content-area">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { List, Star, User, Ticket, Lock, Setting } from '@element-plus/icons-vue';
import { computed } from 'vue';

const userStore = useUserStore();

interface MenuItem {
  label: string;
  path: string;
  icon: any;
  target?: string;
}

const menuItems = computed<MenuItem[]>(() => {
  const items: MenuItem[] = [
    { label: '我的订单', path: '/user/orders', icon: List },
    { label: '我的收藏', path: '/user/wishlist', icon: Star },
    { label: '个人信息', path: '/user/info', icon: User },
    { label: '发票管理', path: '/user/invoice', icon: Ticket },
    { label: '账号安全', path: '/user/security', icon: Lock },
  ];
  // 管理员显示管理后台入口
  if (userStore.userInfo?.role === 'admin') {
    items.push({ label: '管理后台', path: '/admin/dashboard', icon: Setting, target: '_blank' });
  }
  return items;
});

const getRoleName = (role?: string) => {
  switch (role) {
    case 'admin': return '管理员';
    case 'host': return '认证房东';
    default: return '普通用户';
  }
};
</script>

<style scoped lang="scss">
.profile-layout {
  padding-top: 100px; /* Header height + gap */
  padding-bottom: 60px;
  background-color: #f7f7f7;
  min-height: 100vh;
}

.profile-container {
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  gap: 32px;
  padding: 0 20px;
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
  background: white;
  border-radius: 12px;
  padding: 32px 0;
  height: fit-content;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);

  .user-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 32px;
    padding: 0 20px;
    
    .nickname {
      margin: 16px 0 8px;
      font-size: 18px;
      font-weight: 600;
    }
    
    .role-badge {
      font-size: 12px;
      color: #717171;
      background: #f7f7f7;
      padding: 4px 12px;
      border-radius: 12px;
    }
  }

  .side-menu {
    display: flex;
    flex-direction: column;
    
    .menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 32px;
      color: #484848;
      text-decoration: none;
      transition: all 0.2s;
      border-left: 4px solid transparent;
      
      &:hover {
        background-color: #f7f7f7;
      }
      
      &.active {
        color: var(--color-primary);
        border-left-color: var(--color-primary);
        background-color: #fff8f8;
        font-weight: 600;
      }
    }
  }
}

.content-area {
  flex: 1;
  min-width: 0;
}

@media (max-width: 768px) {
  .profile-container {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
  }
}
</style>
