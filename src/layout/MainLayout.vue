<template>
  <header :class="['header', { 'header--scrolled': isScrolled }]">
    <div class="header-container">
      <div class="logo-container" @click="router.push('/')">
        <el-icon :size="32" color="#FF5A5F"><House /></el-icon>
        <span class="logo-text">栖居</span>
      </div>

      <div class="search-container" v-if="!isHome">
        <SearchBar mini />
      </div>

      <div class="user-menu">
        <el-dropdown trigger="click" @command="handleCommand">
          <div class="user-avatar-wrapper">
            <el-icon :size="20"><Menu /></el-icon>
            <el-avatar 
              :size="32" 
              :src="userStore.userInfo?.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" 
            />
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <template v-if="userStore.isLoggedIn">
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item command="orders">我的订单</el-dropdown-item>
                <el-dropdown-item command="wishlist">收藏夹</el-dropdown-item>
                <el-divider style="margin: 4px 0" />
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </template>
              <template v-else>
                <el-dropdown-item command="login">登录</el-dropdown-item>
                <el-dropdown-item command="register">注册</el-dropdown-item>
              </template>
              <el-divider style="margin: 4px 0" />
              <el-dropdown-item command="host">出租房源</el-dropdown-item>
              <el-dropdown-item command="help">帮助中心</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </header>

  <main class="main-content">
    <router-view v-slot="{ Component }">
      <transition name="fade-slide" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </main>

  <footer class="footer">
    <div class="footer-container">
      <div class="footer-section">
        <h3>关于栖居</h3>
        <ul>
          <li>栖居新闻</li>
          <li>学习资料</li>
          <li>工作机会</li>
        </ul>
      </div>
      <div class="footer-section">
        <h3>社区</h3>
        <ul>
          <li>社区动态</li>
          <li>推荐有奖</li>
          <li>无障碍设施</li>
        </ul>
      </div>
      <div class="footer-section">
        <h3>房东</h3>
        <ul>
          <li>开展房源业务</li>
          <li>社区论坛</li>
          <li>房东责任</li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2026 栖居民宿预订系统 - 毕业设计作品</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
// 对应论文第5章5.1节
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import SearchBar from '@/components/business/SearchBar.vue';
import { House, Menu } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const isScrolled = ref(false);

const isHome = computed(() => route.path === '/');

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

const handleCommand = (command: string) => {
  switch (command) {
    case 'logout':
      userStore.logout();
      router.push('/');
      break;
    case 'login':
      router.push('/login');
      break;
    case 'orders':
      router.push('/user/orders');
      break;
    case 'wishlist':
      router.push('/user/wishlist');
      break;
    case 'profile':
      router.push('/user/info');
      break;
    case 'register':
      // router.push('/register');
      break;
    case 'host':
      router.push('/host/dashboard');
      break;
    case 'help':
      // router.push('/help');
      break;
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped lang="scss">
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 80px;
  z-index: 1000;
  transition: all 0.3s ease;
  background-color: transparent;

  &--scrolled {
    background-color: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(10px);
    box-shadow: 0 1px 12px rgba(0, 0, 0, 0.08);
  }

  .header-container {
    max-width: 1440px;
    margin: 0 auto;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
  }

  .logo-container {
    display: flex;
    align-items: center;
    cursor: pointer;
    gap: 8px;

    .logo-text {
      font-size: 24px;
      font-weight: 800;
      color: var(--color-primary);
    }
  }

  .user-menu {
    .user-avatar-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 5px 5px 5px 12px;
      border: 1px solid #ddd;
      border-radius: 21px;
      cursor: pointer;
      transition: box-shadow 0.2s ease;
      background-color: white;

      &:hover {
        box-shadow: 0 2px 4px rgba(0,0,0,0.18);
      }
    }
  }
}

.main-content {
  min-height: calc(100vh - 80px);
  padding-top: 0; // Header is transparent on home page
}

.footer {
  background-color: var(--color-bg-body);
  border-top: 1px solid #ddd;
  padding: 48px 0 24px;

  .footer-container {
    max-width: 1440px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    padding: 0 40px;
    gap: 40px;

    .footer-section {
      h3 {
        font-size: 14px;
        text-transform: uppercase;
        margin-bottom: 20px;
        color: var(--color-text-title);
      }

      ul {
        list-style: none;
        padding: 0;
        li {
          font-size: 14px;
          margin-bottom: 12px;
          color: var(--color-text-main);
          cursor: pointer;
          &:hover { text-decoration: underline; }
        }
      }
    }
  }

  .footer-bottom {
    max-width: 1440px;
    margin: 48px auto 0;
    padding: 24px 40px 0;
    border-top: 1px solid #ddd;
    text-align: center;
    p {
      font-size: 14px;
      color: var(--color-text-secondary);
    }
  }
}

@media (max-width: 768px) {
  .header .header-container { padding: 0 20px; }
  .footer .footer-container { grid-template-columns: 1fr; }
}
</style>
