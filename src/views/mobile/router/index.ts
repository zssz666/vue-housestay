import { createRouter, createWebHistory } from 'vue-router';
import MobileTabBar from '../components/MobileTabBar.vue';
import { useUserStore } from '@/stores/user';

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL || '/'),
  routes: [
    {
      path: '/',
      component: MobileTabBar,
      children: [
        {
          path: '',
          name: 'MobileHome',
          component: () => import('../pages/Home.vue'),
        },
        {
          path: 'favorites',
          name: 'MobileFavorites',
          component: () => import('../pages/Favorites.vue'),
        },
        {
          path: 'messages',
          name: 'MobileMessages',
          component: () => import('../pages/ChatList.vue'),
        },
        {
          path: 'orders',
          name: 'MobileOrders',
          component: () => import('../pages/Order.vue'),
        },
        {
          path: 'profile',
          name: 'MobileProfile',
          component: () => import('../pages/Profile.vue'),
        },
      ],
    },
    {
      path: '/homestay/:id',
      name: 'MobileDetail',
      component: () => import('../pages/Detail.vue'),
    },
    {
      path: '/search',
      name: 'MobileSearch',
      component: () => import('../pages/Search.vue'),
    },
    {
      path: '/cert',
      name: 'MobileCert',
      component: () => import('../pages/Cert.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile-favorites',
      name: 'MobileProfileFavorites',
      component: () => import('../pages/ProfileFavorites.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/booking/:homestayId',
      name: 'MobileBooking',
      component: () => import('../pages/Booking.vue'),
    },
    {
      path: '/guest',
      name: 'GuestManage',
      component: () => import('../pages/GuestManage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/invoice',
      name: 'MobileInvoice',
      component: () => import('../pages/Invoice.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'MobileLogin',
      component: () => import('../pages/Login.vue'),
    },
    {
      path: '/register',
      name: 'MobileRegister',
      component: () => import('../pages/Register.vue'),
    },
    {
      path: '/review/:orderId',
      name: 'MobileReview',
      component: () => import('../pages/Review.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/chat/:conversationId',
      name: 'MobileChat',
      component: () => import('../pages/Chat.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/edit-profile',
      name: 'MobileEditProfile',
      component: () => import('../pages/EditProfile.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/student-cert',
      name: 'MobileStudentCert',
      component: () => import('../pages/StudentCert.vue'),
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach((to, _from) => {
  if (to.meta.requiresAuth) {
    const userStore = useUserStore();
    if (!userStore.isLoggedIn) {
      return { path: '/login', query: { redirect: to.fullPath } };
    }
  }
});

export default router;
