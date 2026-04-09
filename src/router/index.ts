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
    // 房东端
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
