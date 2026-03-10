import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '@/layout/MainLayout.vue';
import Home from '@/views/user/Home.vue';
import { useUserStore } from '@/stores/user';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'Home',
          component: Home
        },
        {
          path: 'search',
          name: 'Search',
          component: () => import('@/views/user/Search.vue')
        },
        {
          path: 'homestay/:id',
          name: 'Detail',
          component: () => import('@/views/user/Detail.vue')
        },
        {
          path: 'book/create',
          name: 'Booking',
          component: () => import('@/views/user/Booking.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'user',
          component: () => import('@/views/user/Profile.vue'),
          meta: { requiresAuth: true },
          children: [
            { path: '', redirect: '/user/orders' },
            { path: 'orders', component: () => import('@/views/user/Orders.vue') },
            { path: 'wishlist', component: () => import('@/views/user/Wishlist.vue') },
            { path: 'invoice', component: () => import('@/views/user/Invoice.vue') },
            { path: 'info', component: () => import('@/views/user/Info.vue') }, // Placeholder
            { path: 'security', component: () => import('@/views/user/Security.vue') }, // Placeholder
          ]
        },
        {
          path: 'review', // Standalone review page
          name: 'Review',
          component: () => import('@/views/user/Review.vue'),
          meta: { requiresAuth: true }
        }
      ]
    },
    {
      path: '/host',
      component: () => import('@/layout/HostLayout.vue'),
      meta: { requiresAuth: true, role: 'host' },
      children: [
        { path: '', redirect: '/host/dashboard' },
        { path: 'dashboard', component: () => import('@/views/host/Dashboard.vue'), meta: { title: '工作台' } },
        { path: 'properties', component: () => import('@/views/host/Properties.vue'), meta: { title: '房源管理' } },
        { path: 'orders', component: () => import('@/views/host/Orders.vue'), meta: { title: '订单管理' } },
        { path: 'calendar', component: () => import('@/views/host/Calendar.vue'), meta: { title: '房态日历' } },
        { path: 'finance', component: () => import('@/views/host/Finance.vue'), meta: { title: '财务管理' } },
        { path: 'settings', component: () => import('@/views/host/Settings.vue'), meta: { title: '设置' } },
        { path: 'checkout/:id', component: () => import('@/views/host/CheckOut.vue'), meta: { title: '退房验房' } },
      ]
    },
    {
      path: '/admin',
      component: () => import('@/layout/AdminLayout.vue'),
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        { path: '', redirect: '/admin/dashboard' },
        { path: 'dashboard', component: () => import('@/views/admin/Dashboard.vue'), meta: { title: '数据概览' } },
        { path: 'audit', component: () => import('@/views/admin/Audit.vue'), meta: { title: '审核中心' } },
        { path: 'dispute', component: () => import('@/views/admin/Dispute.vue'), meta: { title: '纠纷仲裁' } },
        { path: 'settings', component: () => import('@/views/admin/Settings.vue'), meta: { title: '系统设置' } },
      ]
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/user/Login.vue') // Placeholder
    }
  ]
});

router.beforeEach((to) => {
  const userStore = useUserStore();
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    // In a real app, return '/login';
    // For this demo, we allow access but might show warning
    return true; 
  }
});

export default router;
