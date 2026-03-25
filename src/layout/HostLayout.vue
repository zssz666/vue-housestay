<template>
  <el-container class="host-layout">
    <el-aside width="200px" class="host-sidebar">
      <div class="sidebar-logo">
        <el-icon :size="24" color="#1890ff"><House /></el-icon>
        <span>房东工作台</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="host-menu"
        background-color="#001529"
        text-color="#rgba(255, 255, 255, 0.65)"
        active-text-color="#fff"
        router
      >
        <el-menu-item index="/host/dashboard">
          <el-icon><DataBoard /></el-icon>
          <span>工作台</span>
        </el-menu-item>
        <el-menu-item index="/host/properties">
          <el-icon><OfficeBuilding /></el-icon>
          <span>房源管理</span>
        </el-menu-item>
        <el-menu-item index="/host/orders">
          <el-icon><List /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/host/messages">
          <el-icon><ChatDotRound /></el-icon>
          <span>消息中心</span>
        </el-menu-item>
        <el-menu-item index="/host/finance">
          <el-icon><Wallet /></el-icon>
          <span>财务管理</span>
        </el-menu-item>
        <el-menu-item index="/host/settings">
          <el-icon><Setting /></el-icon>
          <span>设置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header class="host-header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/host/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentRouteName }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <div class="action-item">
            <el-badge :value="3" class="item">
              <el-icon :size="20"><Bell /></el-icon>
            </el-badge>
          </div>
          <div class="action-item" @click="toggleFullScreen">
            <el-icon :size="20"><FullScreen /></el-icon>
          </div>
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" :src="userStore.userInfo?.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
              <span class="username">{{ userStore.userInfo?.nickname || '房东' }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="home">返回前台</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="host-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { 
  House, DataBoard, OfficeBuilding, List, ChatDotRound, Wallet, Setting, 
  Bell, FullScreen 
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const activeMenu = computed(() => route.path);
const currentRouteName = computed(() => route.meta.title || '当前页面');

const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
};

const handleCommand = (command: string) => {
  switch (command) {
    case 'logout':
      userStore.logout();
      router.push('/login');
      break;
    case 'home':
      router.push('/');
      break;
    case 'profile':
      router.push('/user/info');
      break;
  }
};
</script>

<style scoped lang="scss">
.host-layout {
  height: 100vh;
  background-color: #f0f2f5;
}

.host-sidebar {
  background-color: #001529;
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.05);
  z-index: 10;

  .sidebar-logo {
    height: 64px;
    display: flex;
    align-items: center;
    padding-left: 24px;
    background-color: #002140;
    gap: 12px;
    font-size: 18px;
    font-weight: 600;
    color: white;
  }

  .host-menu {
    border-right: none;
    flex: 1;
    
    :deep(.el-menu-item) {
      &.is-active {
        background-color: #1890ff !important;
      }
      &:hover {
        color: white !important;
      }
    }
  }
}

.host-header {
  background-color: white;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: 9;

  .header-right {
    display: flex;
    align-items: center;
    gap: 24px;

    .action-item {
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 0 8px;
      transition: all 0.3s;
      &:hover { background: #f7f7f7; }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      .username { font-size: 14px; color: rgba(0,0,0,0.85); }
    }
  }
}

.host-content {
  padding: 24px;
  overflow-y: auto;
}

/* Transition */
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.15s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-15px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(15px);
}
</style>
