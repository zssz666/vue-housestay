<template>
  <div class="portal-layout">
    <!-- 顶部导航 -->
    <header :class="['portal-header', { 'scrolled': isScrolled }]">
      <div class="header-container">
        <!-- Logo -->
        <router-link to="/" class="logo">
          <img src="/log.svg" alt="栖居" class="logo-img" />
        </router-link>

        <!-- 导航链接 -->
        <nav class="nav-center">
          <a href="#showcase">平台能力</a>
          <a href="#spaces">精选房源</a>
          <a href="#operator">经营者入口</a>
        </nav>

        <!-- 右侧 -->
        <div class="nav-right">
          <template v-if="!isLoggedIn">
            <router-link to="/login?role=host" class="login-link">房东入口</router-link>
            <span class="nav-divider">|</span>
            <router-link to="/login?role=admin" class="login-link">管理后台</router-link>
          </template>
          <template v-else>
            <router-link :to="dashboardRoute" class="login-btn">
              进入工作台
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </router-link>
          </template>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="portal-main">
      <router-view v-slot="{ Component }">
        <transition name="fade-slide" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

const isScrolled = ref(false);
const isLoggedIn = computed(() => !!userStore.token);

const dashboardRoute = computed(() => {
  const role = userStore.userInfo?.role;
  if (role === 'host') return '/host/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  return '/m/home';
});

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped lang="scss">
.portal-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #0A0A0A;
}

// 导航栏
.portal-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 20px 0;
  transition: all 0.3s ease;

  &.scrolled {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
    padding: 14px 0;

    .logo-img {
      filter: none;
    }

    .nav-center a {
      color: #666;
    }

    .nav-right .login-link {
      color: #1A1A1A;
      border-color: #1A1A1A;
    }

    .nav-right .nav-divider {
      color: #ddd;
    }
  }

  .header-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    text-decoration: none;

    .logo-img {
      height: 36px;
      width: auto;
      transition: filter 0.3s;
    }
  }

  .nav-center {
    display: flex;
    gap: 40px;

    a {
      color: rgba(255, 255, 255, 0.9);
      text-decoration: none;
      font-size: 14px;
      letter-spacing: 0.05em;
      transition: color 0.3s;

      &:hover {
        color: #D4A574;
      }
    }
  }

  .nav-right {
    display: flex;
    align-items: center;
    gap: 12px;

    .login-link {
      color: rgba(255, 255, 255, 0.9);
      text-decoration: none;
      font-size: 14px;
      transition: color 0.3s;

      &:hover {
        color: #D4A574;
      }
    }

    .nav-divider {
      color: rgba(255, 255, 255, 0.3);
      font-size: 14px;
    }

    .login-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      color: white;
      text-decoration: none;
      font-size: 14px;
      padding: 8px 16px;
      background: linear-gradient(135deg, #FF5A5F 0%, #ff7a7f 100%);
      border-radius: 6px;
      transition: all 0.3s;

      svg {
        transition: transform 0.3s;
      }

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(255, 90, 95, 0.3);

        svg {
          transform: translateX(3px);
        }
      }
    }
  }
}

.portal-main {
  flex: 1;
}

// 过渡动画
.fade-slide-enter-active {
  transition: all 0.35s ease-out;
}

.fade-slide-leave-active {
  transition: all 0.25s ease-in;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

// 响应式
@media (max-width: 768px) {
  .portal-header {
    .header-container {
      padding: 0 20px;
    }

    .logo .logo-img {
      height: 30px;
    }

    .nav-center {
      display: none;
    }

    .nav-right {
      .login-link {
        font-size: 13px;
      }

      .nav-divider {
        display: none;
      }
    }
  }
}
</style>
