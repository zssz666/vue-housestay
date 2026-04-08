import { createRouter, createWebHistory } from 'vue-router';
import { ElMessage } from 'element-plus';
import PortalLayout from '@/layout/PortalLayout.vue';
import { useUserStore } from '@/stores/user';
import { isMobileDevice } from '@/utils/device';

const router = createRouter({
  // 使用 History 模式
  history: createWebHistory(import.meta.env.VITE_BASE_URL || '/'),
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
  routes: [
    // ========================
    // 门户首页（新增）
    // ========================
    {
      path: '/',
      component: PortalLayout,
      children: [
        {
          path: '',
          name: 'PortalHome',
          component: () => import('@/views/portal/Index.vue'),
        },
      ],
    },

    // ========================
    // 登录页
    // ========================
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/portal/Login.vue'),
    },

    // ========================
    // 移动端 H5 页面（保留）
    // ========================
    {
      path: '/m',
      component: () => import('@/views/mobile/App.vue'),
      children: [
        { path: '', redirect: '/m/home' },
        { path: 'home', component: () => import('@/views/mobile/pages/Home.vue') },
        { path: 'search', component: () => import('@/views/mobile/pages/Search.vue') },
        { path: 'detail/:id', component: () => import('@/views/mobile/pages/Detail.vue') },
        { path: 'booking/:id', component: () => import('@/views/mobile/pages/Booking.vue'), meta: { requiresAuth: true } },
        { path: 'order', component: () => import('@/views/mobile/pages/Order.vue'), meta: { requiresAuth: true } },
        { path: 'profile', component: () => import('@/views/mobile/pages/Profile.vue'), meta: { requiresAuth: true } },
        { path: 'edit-profile', component: () => import('@/views/mobile/pages/EditProfile.vue'), meta: { requiresAuth: true } },
        { path: 'favorites', component: () => import('@/views/mobile/pages/Favorites.vue'), meta: { requiresAuth: true } },
        { path: 'chat/:orderId?', component: () => import('@/views/mobile/pages/Chat.vue'), meta: { requiresAuth: true } },
        { path: 'messages', component: () => import('@/views/mobile/pages/Messages.vue'), meta: { requiresAuth: true } },
        { path: 'invoice', component: () => import('@/views/mobile/pages/Invoice.vue'), meta: { requiresAuth: true } },
        { path: 'cert', component: () => import('@/views/mobile/pages/Cert.vue'), meta: { requiresAuth: true } },
        { path: 'login', component: () => import('@/views/mobile/pages/Login.vue') },
      ],
    },

    // ========================
    // 房东端（保留完整功能）
    // ========================
    {
      path: '/host',
      component: () => import('@/layout/HostLayout.vue'),
      meta: { requiresAuth: true, role: 'host' },
      children: [
        { path: '', redirect: '/host/dashboard' },
        { path: 'dashboard', component: () => import('@/views/host/Dashboard.vue'), meta: { title: '工作台' } },
        { path: 'properties', component: () => import('@/views/host/Properties.vue'), meta: { title: '房源管理' } },
        { path: 'orders', component: () => import('@/views/host/Orders.vue'), meta: { title: '订单管理' } },
        { path: 'messages', component: () => import('@/views/host/Messages.vue'), meta: { title: '消息中心' } },
        { path: 'finance', component: () => import('@/views/host/Finance.vue'), meta: { title: '财务管理' } },
        { path: 'settings', component: () => import('@/views/host/Settings.vue'), meta: { title: '设置' } },
        { path: 'checkout/:id', component: () => import('@/views/host/CheckOut.vue'), meta: { title: '退房验房' } },
      ],
    },

    // ========================
    // 管理端（保留完整功能）
    // ========================
    {
      path: '/admin',
      component: () => import('@/layout/AdminLayout.vue'),
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        { path: '', redirect: '/admin/dashboard' },
        { path: 'dashboard', component: () => import('@/views/admin/Dashboard.vue'), meta: { title: '数据概览' } },
        { path: 'audit', component: () => import('@/views/admin/Audit.vue'), meta: { title: '审核中心' } },
        { path: 'dispute', component: () => import('@/views/admin/Dispute.vue'), meta: { title: '纠纷仲裁' } },
        { path: 'dispute/:id', component: () => import('@/views/admin/Dispute.vue'), meta: { title: '纠纷详情' } },
        { path: 'users', component: () => import('@/views/admin/Users.vue'), meta: { title: '用户管理' } },
        { path: 'settings', component: () => import('@/views/admin/Settings.vue'), meta: { title: '系统设置' } },
      ],
    },

    // ========================
    // 已移除的路由（保留说明）
    // ========================
    // 以下是原 /user/* 路由，已移除并重定向到移动端
    // - /user/Home.vue        → 已删除
    // - /user/Search.vue      → 已删除
    // - /user/Detail.vue     → 已删除
    // - /user/Booking.vue    → 已删除
    // - /user/Orders.vue     → 已删除
    // - /user/Profile.vue    → 已删除
    // - /user/Info.vue       → 已删除
    // - /user/Invoice.vue    → 已删除
    // - /user/Review.vue     → 已删除
    // - /user/Security.vue   → 已删除
    // - /user/Wishlist.vue   → 已删除

    // ========================
    // 404 兜底
    // ========================
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});

// 全局导航守卫
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore();

  // 移动端访问根路径，自动跳转移动端
  if (to.path === '/' && isMobileDevice()) {
    return next('/m/home');
  }

  // 需要认证的路由
  if (to.meta.requiresAuth) {
    if (!userStore.isLoggedIn) {
      return next({ path: '/login', query: { redirect: to.fullPath } });
    }
  }

  // 验证角色权限
  if (to.meta.role) {
    const requiredRole = to.meta.role as string;
    if (userStore.userInfo?.role !== requiredRole) {
      ElMessage.warning('您没有权限访问该页面');
      return next('/');
    }
  }

  next();
});

export default router;
