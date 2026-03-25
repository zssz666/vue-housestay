<template>
  <el-container class="admin-layout">
    <el-aside width="220px" class="admin-sidebar">
      <div class="sidebar-logo">
        <el-icon :size="24" color="#409eff"><Management /></el-icon>
        <span>平台管理中心</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="admin-menu"
        background-color="#001529"
        text-color="rgba(255, 255, 255, 0.65)"
        active-text-color="#409eff"
        router
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>数据概览</span>
        </el-menu-item>
        <el-menu-item index="/admin/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/audit">
          <el-icon><Stamp /></el-icon>
          <span>审核中心</span>
          <el-badge :value="12" class="menu-badge" type="danger" />
        </el-menu-item>
        <el-menu-item index="/admin/dispute">
          <el-icon><ScaleToOriginal /></el-icon>
          <span>纠纷仲裁</span>
          <el-badge :value="3" class="menu-badge" type="warning" />
        </el-menu-item>
        <el-menu-item index="/admin/settings">
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header class="admin-header">
        <div class="header-left">
          <el-input 
            placeholder="搜索订单、用户、房源..." 
            prefix-icon="el-icon-search" 
            style="width: 300px"
            size="large"
          />
        </div>
        <div class="header-right">
          <el-badge :value="5" class="item">
            <el-icon :size="20"><Bell /></el-icon>
          </el-badge>
          <div class="admin-profile">
            <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            <span class="name">超级管理员</span>
            <el-button link type="danger" @click="handleLogout">退出</el-button>
          </div>
        </div>
      </el-header>
      
      <el-main class="admin-content">
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
  Management, DataLine, User, Stamp, ScaleToOriginal, Setting, Bell
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const activeMenu = computed(() => route.path);

const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};
</script>

<style scoped lang="scss">
.admin-layout {
  height: 100vh;
  background-color: #f0f2f5;
}

.admin-sidebar {
  background-color: #001529;
  color: white;
  display: flex;
  flex-direction: column;
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

  .admin-menu {
    border-right: none;
    flex: 1;
    
    :deep(.el-menu-item) {
      display: flex;
      align-items: center;
      padding-right: 20px;

      &.is-active {
        background-color: #409eff !important;
        color: white !important;
        .el-icon { color: white; }
      }
      &:hover {
        color: white !important;
      }

      .menu-badge {
        margin-left: auto;
        flex-shrink: 0;
        :deep(.el-badge__content) { border: none; }
      }
    }
  }
}

.admin-header {
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
    
    .item { cursor: pointer; }

    .admin-profile {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-left: 24px;
      border-left: 1px solid #eee;
      
      .name { font-weight: 500; font-size: 14px; }
    }
  }
}

.admin-content {
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
