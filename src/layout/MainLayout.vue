<template>
  <header :class="['header', { 'header--scrolled': isScrolled }]">
    <div class="header-container">
      <!-- 左：Logo -->
      <div class="logo-container" @click="router.push('/')">
        <img src="/log.svg" alt="栖居" class="logo">
      </div>

      <!-- 中：胶囊搜索框 - 可输入 -->
      <div class="search-pill">
        <!-- 地点输入 -->
        <div class="search-section destination">
          <el-autocomplete
            v-model="searchForm.destination"
            :fetch-suggestions="querySearch"
            placeholder="目的地"
            class="search-input"
            :trigger-on-focus="false"
            @select="handleSearch"
          />
        </div>
        <div class="divider"></div>
        
        <!-- 日期选择 -->
        <div class="search-section dates">
          <el-date-picker
            v-model="searchForm.dates"
            type="daterange"
            range-separator="-"
            start-placeholder="入住"
            end-placeholder="退房"
            format="MM/DD"
            value-format="YYYY-MM-DD"
            class="date-picker-inline"
          />
        </div>
        <div class="divider"></div>
        
        <!-- 人数选择 -->
        <div class="search-section guests">
          <el-popover placement="bottom" :width="260" trigger="click">
            <template #reference>
              <div class="guest-trigger">
                {{ guestSummary }}
              </div>
            </template>
            <div class="guest-selector">
              <div class="guest-row">
                <span>成人</span>
                <el-input-number v-model="searchForm.adults" :min="1" :max="16" size="small" />
              </div>
              <div class="guest-row">
                <span>儿童</span>
                <el-input-number v-model="searchForm.children" :min="0" :max="5" size="small" />
              </div>
            </div>
          </el-popover>
          <!-- 搜索按钮 -->
          <button class="search-btn" @click="handleSearch">
            <el-icon :size="14"><Search /></el-icon>
          </button>
        </div>
      </div>

      <!-- 右：用户菜单 -->
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useHomestayStore } from '@/stores/homestay';
import { Menu, Search } from '@element-plus/icons-vue';

const router = useRouter();
const userStore = useUserStore();
const homestayStore = useHomestayStore();
const isScrolled = ref(false);

// 搜索表单
const searchForm = ref({
  destination: '',
  dates: [] as unknown as [string, string] | null,
  adults: 1,
  children: 0
});

const guestSummary = computed(() => {
  const total = searchForm.value.adults + searchForm.value.children;
  return `${total} 位房客`;
});

// 目的地自动补全
const querySearch = (_queryString: string, cb: any) => {
  const results = [
    { value: '成都' },
    { value: '大理' },
    { value: '杭州' },
    { value: '厦门' },
    { value: '西安' },
    { value: '丽江' },
    { value: '桂林' },
    { value: '青岛' },
  ];
  cb(results);
};

// 搜索处理
const handleSearch = () => {
  homestayStore.updateSearchParams({
    keyword: searchForm.value.destination,
    guestCount: searchForm.value.adults + searchForm.value.children
  });
  
  router.push({
    path: '/search',
    query: {
      q: searchForm.value.destination,
      guests: searchForm.value.adults + searchForm.value.children
    }
  });
};

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
      router.push({ path: '/login', query: { mode: 'login' } });
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
      router.push({ path: '/login', query: { mode: 'register' } });
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

  // 胶囊搜索框 - 可输入
  .search-pill {
    display: flex;
    align-items: center;
    height: 48px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 40px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
    transition: box-shadow 0.2s;
    padding-right: 6px;
    width: 480px;

    &:hover {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .search-section {
      padding: 0 16px;
      font-size: 14px;
      white-space: nowrap;
      flex: 1;

      &.destination {
        .search-input {
          width: 100%;
          :deep(.el-input__wrapper) {
            box-shadow: none !important;
            background: transparent;
          }
          :deep(.el-input__inner) {
            font-weight: 500;
            color: #222;
            &::placeholder { color: #717171; }
          }
        }
      }

      &.dates {
        :deep(.date-picker-inline) {
          width: 180px;
          .el-input__wrapper { box-shadow: none !important; }
          .el-range-separator { color: #717171; }
          .el-input__inner { 
            color: #222; 
            &::placeholder { color: #717171; }
          }
        }
      }

      &.guests {
        display: flex;
        align-items: center;
        gap: 8px;
        padding-right: 0;
        color: #717171;
        
        .guest-trigger {
          cursor: pointer;
          padding: 4px 0;
          &:hover { color: #222; }
        }

        .search-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #FF5A5F;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          cursor: pointer;
          transition: transform 0.2s;

          &:hover {
            transform: scale(1.05);
            background: #FF385C;
          }
        }
      }
    }

    .divider {
      width: 1px;
      height: 24px;
      background: #ddd;
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
  .header {
    .header-container { padding: 0 20px; }
    .search-pill { display: none; }
  }
  .footer .footer-container { grid-template-columns: 1fr; }
}
</style>

<style lang="scss">
// 全局样式 - 人数选择器
.guest-selector {
  padding: 10px;
  .guest-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    &:last-child { margin-bottom: 0; }
    span { color: #222; }
  }
}
</style>
