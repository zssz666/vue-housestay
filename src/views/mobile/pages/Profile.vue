<template>
  <div class="page-container tj-profile-page">

    <!-- ========== 渐变头部 ========== -->
    <div class="tj-profile-header">
      <div class="tj-profile-header__bg"></div>
      <!-- 已登录 -->
      <div class="tj-profile-user" v-if="isLoggedIn">
        <img
          :src="userInfo?.avatar || defaultAvatar"
          :alt="userInfo?.name"
          class="tj-profile-user__avatar"
          @click="router.push('/edit-profile')"
        />
        <div class="tj-profile-user__info">
          <div class="tj-profile-user__name">
            {{ userInfo?.name || '游客' }}
            <span v-if="userInfo?.realName" class="tj-tag tj-tag--orange">已实名</span>
            <span v-else class="tj-tag tj-tag--gray">未实名</span>
          </div>
          <div class="tj-profile-user__phone">{{ userInfo?.phone ? maskPhone(userInfo.phone) : '' }}</div>
        </div>
        <div class="tj-profile-user__edit" @click="router.push('/edit-profile')">
          <van-icon name="edit" size="16" color="rgba(255,255,255,0.7)" />
        </div>
      </div>
      <!-- 未登录 -->
      <div class="tj-profile-user" v-else @click="goLogin">
        <img :src="defaultAvatar" alt="" class="tj-profile-user__avatar" />
        <div class="tj-profile-user__info">
          <div class="tj-profile-user__name">点击登录 / 注册</div>
          <div class="tj-profile-user__phone">登录后享受完整服务</div>
        </div>
        <van-icon name="chevron-right" size="20" color="rgba(255,255,255,0.5)" />
      </div>
    </div>

    <!-- ========== 功能区 ========== -->
    <div class="tj-profile-content">

      <!-- 订单统计宫格 -->
      <div class="tj-card tj-profile-order-card" v-if="isLoggedIn">
        <div class="tj-profile-section-head">
          <span class="tj-profile-section-title">我的订单</span>
        </div>
        <div class="order-status-grid">
          <div
            v-for="item in orderStatus"
            :key="item.key"
            class="status-item"
            @click="router.push(`/orders?tab=${item.tabIndex}`)"
          >
            <div class="icon-wrapper" :style="{ background: item.bgColor }">
              <van-icon :name="item.icon" size="22" :color="item.iconColor" />
              <van-badge
                v-if="item.count > 0"
                :content="item.count"
                :max="99"
                class="status-badge"
              />
            </div>
            <span class="status-text">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <!-- 全部订单入口 -->
      <div class="tj-card" style="padding: 0;" v-if="isLoggedIn" @click="router.push('/orders')">
        <div class="tj-profile-cell">
          <van-icon name="orders-o" size="20" color="#FF9645" />
          <span>全部订单</span>
          <van-icon name="arrow" size="14" color="#CCC" />
        </div>
      </div>

      <!-- 实名认证 -->
      <div class="tj-card" style="padding: 14px;" v-if="isLoggedIn" @click="goCert">
        <div class="tj-profile-cert">
          <div class="tj-profile-cert__icon" style="background: #FFF3E0;">
            <van-icon name="idcard" size="20" color="#FF9645" />
          </div>
          <div class="tj-profile-cert__info">
            <div class="tj-profile-cert__title">实名认证</div>
            <div class="tj-profile-cert__sub">
              {{ certStatus === 'verified' ? '已认证 · ' + (userInfo?.realName || '') : certStatus === 'pending' ? '认证审核中' : '未认证，点击前往认证' }}
            </div>
          </div>
          <van-icon name="chevron-right" size="18" color="#CCC" />
        </div>
      </div>

      <!-- 特色功能列表 -->
      <div class="tj-card" style="padding: 4px 0;">
        <!-- 同行人管理 -->
        <div class="tj-profile-cell" @click="router.push('/guest')">
          <van-icon name="contact" size="20" color="#607D8B" />
          <span>常用入住人</span>
          <span class="tj-profile-cell__extra">{{ guestCount }}位</span>
          <van-icon name="arrow" size="14" color="#CCC" />
        </div>
        <div class="tj-divider" style="margin: 0 16px;"></div>
        <!-- 我的收藏 -->
        <div class="tj-profile-cell" @click="goFavorites">
          <van-icon name="star" size="20" color="#FFB800" />
          <span>我的收藏</span>
          <van-icon class="tj-profile-cell__extra" name="arrow" size="14" color="#CCC" />
        </div>
        <div class="tj-divider" style="margin: 0 16px;"></div>
        <!-- 联系客服 -->
        <div class="tj-profile-cell" @click="contactService">
          <van-icon name="service" size="20" color="#00BCD4" />
          <span>联系客服</span>
          <van-icon class="tj-profile-cell__extra" name="arrow" size="14" color="#CCC" />
        </div>
        <div class="tj-divider" style="margin: 0 16px;"></div>
        <!-- 关于我们 -->
        <div class="tj-profile-cell" @click="goAbout">
          <van-icon name="info" size="20" color="#999" />
          <span>关于我们</span>
          <van-icon class="tj-profile-cell__extra" name="arrow" size="14" color="#CCC" />
        </div>
      </div>

      <!-- 退出登录 -->
      <div class="tj-profile-logout" v-if="isLoggedIn">
        <button class="tj-btn tj-btn--block tj-btn--gray-outline tj-btn--md" @click="handleLogout">
          退出登录
        </button>
      </div>

      <!-- 底部版权 -->
      <div class="tj-profile-footer">
        <div class="tj-profile-footer__logo"><img src="/log.svg"></div>
        <div class="tj-profile-footer__slogan">发现独特的住宿体验</div>
        <div class="tj-profile-footer__copy">© 2026 栖居民宿预订平台</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { useUserStore } from '@/stores/user';
import { getGuestList } from '../api/mobileApi';

const router = useRouter();
const userStore = useUserStore();

const isLoggedIn = computed(() => userStore.isLoggedIn);
const userInfo = computed(() => userStore.userInfo);
const certStatus = ref<'none' | 'pending' | 'verified'>('none');
const guestCount = ref(0);
const defaultAvatar = 'https://picsum.photos/128/128?random=888';

const orderStats = ref({ pending: 2, confirmed: 0, toCheckIn: 1, completed: 0 });

interface OrderStatusItem {
  key: string;
  tabIndex: number;
  label: string;
  icon: string;
  bgColor: string;
  iconColor: string;
  count: number;
}

const orderStatus = computed<OrderStatusItem[]>(() => [
  {
    key: 'pending',
    tabIndex: 0,
    label: '待支付',
    icon: 'balance-pay',
    bgColor: '#FFF3E0',
    iconColor: '#FF9800',
    count: orderStats.value.pending,
  },
  {
    key: 'confirmed',
    tabIndex: 1,
    label: '待确认',
    icon: 'clock',
    bgColor: '#E3F2FD',
    iconColor: '#1890FF',
    count: orderStats.value.confirmed,
  },
  {
    key: 'checkin',
    tabIndex: 2,
    label: '待入住',
    icon: 'hotel-o',
    bgColor: '#E8F5E9',
    iconColor: '#52C41A',
    count: orderStats.value.toCheckIn,
  },
  {
    key: 'completed',
    tabIndex: 4,
    label: '已完成',
    icon: 'passed',
    bgColor: '#F3E5F5',
    iconColor: '#722ED1',
    count: orderStats.value.completed,
  },
]);

function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

function goLogin() { router.push('/login'); }

function goCert() {
  if (certStatus.value === 'verified') showToast('您已完成实名认证');
  else router.push('/cert');
}

function goFavorites() {
  if (!isLoggedIn.value) { router.push('/login'); return; }
  router.push('/profile-favorites');
}

function contactService() { showToast('客服热线：400-888-8888'); }
function goAbout() { showToast('栖居民宿预订平台 v1.0'); }

async function loadGuestCount() {
  if (!isLoggedIn.value) return;
  try {
    const res = await getGuestList();
    if (res.code === 200 && res.data) guestCount.value = res.data.length;
  } catch { /* ignore */ }
}

function handleLogout() {
  userStore.logout();
  showToast('已退出登录');
  router.replace('/');
}

onMounted(async () => {
  certStatus.value = userInfo.value?.realName ? 'verified' : 'none';
  await loadGuestCount();
});
</script>

<style scoped>
.tj-profile-page {
  background: var(--tj-bg-page);
  padding-bottom: calc(56px + var(--tj-safe-bottom));
}
/* ========== 头部 ========== */
.tj-profile-header {
  position: relative;
  background: linear-gradient(135deg, #FF9645 0%, #FF7A3C 50%, #FF5A5F 100%);
  padding: 14px 16px 22px;
  border-radius: 0 0 32px 32px;
  margin-bottom: -12px;
}

.tj-profile-header__bg {
  position: absolute;
  inset: 0;
  border-radius: 0 0 32px 32px;
  background: transparent;
}

.tj-profile-user {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
}

.tj-profile-user__avatar {
  width: 62px;
  height: 62px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.45);
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(255, 150, 69, 0.35);
  flex-shrink: 0;
}

.tj-profile-user__info { flex: 1; }

.tj-profile-user__name {
  font-size: var(--tj-fs-xl);
  font-weight: 700;
  color: #fff;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tj-profile-user__phone {
  font-size: var(--tj-fs-sm);
  color: rgba(255, 255, 255, 0.72);
}

.tj-profile-user__edit {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

/* ========== 功能区 ========== */
.tj-profile-content {
  padding: 12px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 订单卡片 */
.tj-profile-order-card { padding: 0; overflow: visible; }

.tj-profile-section-head {
  padding: 12px 14px 8px;
  border-bottom: 1px solid var(--tj-border-light);
}

.tj-profile-section-title {
  font-size: var(--tj-fs-md);
  font-weight: 700;
  color: var(--tj-text-title);
}

/* 订单宫格 */
.order-status-grid {
  display: flex;
  justify-content: space-around;
  padding: 14px 8px 16px;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  flex: 1;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: transform 0.15s;

  &:active { transform: scale(0.94); }
}

.status-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  background: #FF4C4C;
  font-size: 11px;
  line-height: 16px;
  border-radius: 8px;
  border: 2px solid #fff;
  box-sizing: content-box;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
}

.status-text {
  font-size: 12px;
  color: var(--tj-text-body);
}

/* 实名认证 */
.tj-profile-cert {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.tj-profile-cert__icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tj-profile-cert__info { flex: 1; min-width: 0; }

.tj-profile-cert__title {
  font-size: var(--tj-fs-md);
  font-weight: 600;
  color: var(--tj-text-title);
  margin-bottom: 3px;
}

.tj-profile-cert__sub {
  font-size: var(--tj-fs-xs);
  color: var(--tj-text-hint);
}

/* 功能单元格 */
.tj-profile-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: background 0.15s;
  font-size: var(--tj-fs-md);
  color: var(--tj-text-title);
}

.tj-profile-cell:active { background: var(--tj-bg-hover); }

.tj-profile-cell__extra {
  flex: 1;
  text-align: right;
  font-size: var(--tj-fs-sm);
  color: var(--tj-text-hint);
  margin-right: 4px;
}

/* 退出登录 */
.tj-profile-logout {
  padding: 4px 0 20px;
}

/* 底部版权 */
.tj-profile-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 20px 0 24px;
}

.tj-profile-footer__logo {
  font-size: 18px;
  margin-bottom: 2px;
}

.tj-profile-footer__slogan {
  font-size: var(--tj-fs-xs);
  color: var(--tj-text-hint);
}

.tj-profile-footer__copy {
  font-size: 11px;
  color: var(--tj-text-light);
}
</style>
