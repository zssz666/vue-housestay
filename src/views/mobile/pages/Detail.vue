<template>
  <div class="page-container tj-detail-page">

    <!-- ========== 沉浸式图片轮播 ========== -->
    <div class="tj-detail-swipe" v-if="homestay">
      <van-swipe
        :height="Math.round(windowWidth * 0.55)"
        :show-indicators="(homestay.images?.length || 0) > 1"
        indicator-color="#FF9645"
        @change="currentImageIndex = $event"
      >
        <van-swipe-item
          v-for="(img, idx) in homestay.images"
          :key="idx"
        >
          <img :src="img" class="tj-detail-swipe__img" alt="房源图片" />
        </van-swipe-item>
      </van-swipe>

      <!-- 图片指示器 -->
      <div class="tj-detail-swipe__indicator" v-if="homestay.images?.length > 1">
        {{ currentImageIndex + 1 }} / {{ homestay.images?.length }}
      </div>

      <!-- 顶部操作栏 -->
      <div class="tj-detail-swipe__topbar">
        <div class="tj-detail-swipe__back" @click="router.back()">
          <van-icon name="arrow-left" size="18" color="#333" />
        </div>
        <div class="tj-detail-swipe__actions">
          <div class="tj-detail-swipe__action" @click="onShare">
            <van-icon name="share-o" size="18" color="#333" />
          </div>
          <div
            class="tj-detail-swipe__action"
            :class="{ 'is-active': isFavorited }"
            @click="toggleFavorite"
          >
            <van-icon
              :name="isFavorited ? 'star' : 'star-o'"
              :color="isFavorited ? '#FF9645' : '#333'"
              size="18"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 骨架屏 -->
    <div v-if="!homestay" class="tj-skeleton" style="height: 280px; margin-bottom: 12px;"></div>

    <template v-if="homestay">

      <!-- ========== 基本信息区 ========== -->
      <div class="tj-detail-section tj-detail-base" style="padding: 16px;">
        <!-- 标题 -->
        <div class="tj-detail-title">{{ homestay.title }}</div>

        <!-- 评分行 -->
        <div class="tj-detail-meta">
          <div class="tj-detail-meta__rating">
            <van-icon name="star" color="#FFB800" size="15" />
            <span class="tj-detail-meta__score">{{ homestay.rating?.toFixed(1) || '5.0' }}</span>
            <span class="tj-detail-meta__count">({{ homestay.reviewCount || 0 }}条评价)</span>
          </div>
          <span v-if="landlord?.isSuperhost" class="tj-detail-superhost">
            <van-icon name="medal-o" size="11" /> 超赞房东
          </span>
        </div>

        <!-- 位置 -->
        <div class="tj-detail-location">
          <van-icon name="location-o" size="13" color="#999" />
          <span class="tj-detail-location__text">{{ homestay.address }}</span>
          <span class="tj-detail-location__map">
            地图
            <van-icon name="arrow" size="10" />
          </span>
        </div>

        <!-- 基本参数 -->
        <div class="tj-detail-params">
          <div class="tj-detail-param">
            <van-icon name="user-o" size="14" color="#999" />
            <span>可住{{ homestay.maxGuests }}人</span>
          </div>
          <div class="tj-detail-param">
            <van-icon name="cluster-o" size="14" color="#999" />
            <span>{{ homestay.area }}㎡ · {{ homestay.roomCount }}室</span>
          </div>
          <div class="tj-detail-param">
            <van-icon name="wap-home-o" size="14" color="#999" />
            <span>{{ homestay.facilities?.length || 0 }}项设施</span>
          </div>
        </div>
      </div>

      <!-- 分割线 -->
      <div class="tj-divider" style="margin: 0 16px;"></div>

      <!-- ========== 房东卡片 ========== -->
      <div class="tj-landlord" v-if="landlord">
        <div class="tj-landlord__avatar-wrap">
          <img
            :src="landlord.avatar || defaultAvatar"
            :alt="landlord.nickname"
            class="tj-landlord__avatar"
          />
          <div class="tj-landlord__online"></div>
        </div>
        <div class="tj-landlord__info">
          <div class="tj-landlord__name">
            {{ landlord.nickname || '房东' }}
            <span v-if="landlord.isSuperhost" class="tj-tag tj-tag--orange">超赞房东</span>
          </div>
          <div class="tj-landlord__meta">
            回复率 {{ landlord.responseRate || 98 }}%
          </div>
        </div>
        <button class="tj-landlord__btn" @click="contactLandlord">联系房东</button>
      </div>

      <!-- 分割线 -->
      <div class="tj-divider" style="margin: 0 16px;"></div>

      <!-- ========== 房源描述 ========== -->
      <div class="tj-detail-section" style="padding: 16px;">
        <div class="tj-detail-section__title">房源介绍</div>
        <div
          class="tj-detail-desc"
          :class="{ 'tj-detail-desc--collapsed': !showFullDesc }"
        >
          {{ homestay.description || '暂无描述' }}
        </div>
        <div class="tj-detail-desc__toggle" @click="showFullDesc = !showFullDesc">
          {{ showFullDesc ? '收起' : '展开全部' }}
          <van-icon :name="showFullDesc ? 'arrow-up' : 'arrow-down'" size="12" color="#FF9645" />
        </div>
      </div>

      <!-- 分割线 -->
      <div class="tj-divider" style="margin: 0 16px;"></div>

      <!-- ========== 设施服务 ========== -->
      <div class="tj-detail-section" style="padding: 16px;" v-if="homestay.facilities?.length">
        <div class="tj-detail-section__head">
          <span class="tj-detail-section__title">房源设施</span>
          <span class="tj-detail-section__more">
            全部设施
            <van-icon name="arrow" size="10" color="#999" />
          </span>
        </div>

        <!-- 设施网格（5列） -->
        <div class="tj-facility-grid">
          <div
            v-for="facility in displayedFacilities"
            :key="facility.name"
            class="tj-facility-item"
            :class="{ 'is-active': activeFacility === facility.name }"
            @click="toggleFacility(facility.name)"
          >
            <div class="tj-facility-item__icon">{{ facility.icon }}</div>
            <div class="tj-facility-item__name">{{ facility.name }}</div>
          </div>
        </div>
      </div>

      <!-- 分割线 -->
      <div class="tj-divider" style="margin: 0 16px;" v-if="homestay.facilities?.length"></div>

      <!-- ========== 评价预览 ========== -->
      <div class="tj-detail-section" style="padding: 16px;">
        <div class="tj-detail-section__head">
          <span class="tj-detail-section__title">评分评价</span>
          <div class="tj-detail-rating-block">
            <span class="tj-detail-rating-block__score">{{ homestay.rating?.toFixed(1) || '5.0' }}</span>
            <div class="tj-detail-rating-block__stars">
              <van-rate
                :model-value="homestay.rating || 5"
                readonly
                size="12"
                color="#FFB800"
                void-color="#E0E0E0"
              />
            </div>
          </div>
        </div>

        <!-- 评价列表 -->
        <div v-if="reviews.length" class="tj-review-list">
          <div v-for="review in reviews.slice(0, 3)" :key="review.reviewId" class="tj-review-item">
            <div class="tj-review-item__header">
              <img
                :src="review.user?.avatar || `https://picsum.photos/68/68?random=${review.reviewId}`"
                class="tj-review-item__avatar"
                alt=""
              />
              <div class="tj-review-item__info">
                <div class="tj-review-item__name">{{ review.user?.nickname || '匿名用户' }}</div>
                <van-rate
                  :model-value="review.rating"
                  readonly
                  size="11"
                  color="#FFB800"
                  void-color="#E0E0E0"
                />
              </div>
              <div class="tj-review-item__date">{{ formatDate(review.createdAt) }}</div>
            </div>
            <div class="tj-review-item__content">{{ review.content }}</div>
          </div>
        </div>

        <div v-else class="tj-detail-empty">暂无评价</div>

        <van-button
          v-if="reviews.length > 3"
          block
          round
          plain
          size="small"
          class="tj-detail-more-btn"
        >
          查看全部 {{ reviews.length }} 条评价
        </van-button>
      </div>

      <!-- 底部占位（给悬浮栏留空间） -->
      <div style="height: 84px;"></div>
    </template>

    <!-- ========== 底部悬浮预订栏 ========== -->
    <div class="tj-booking-bar" v-if="homestay">
      <div class="tj-booking-bar__price">
        <div class="tj-booking-bar__price-row">
          <span class="tj-price__symbol">¥</span>
          <span class="tj-price__amount" style="font-size: 20px;">{{ homestay.price }}</span>
          <span class="tj-price__unit">/晚</span>
        </div>
        <div class="tj-booking-bar__dates">{{ checkInText || '选择入住日期' }}</div>
      </div>
      <div class="tj-booking-bar__hint">
        <van-icon name="passed" size="12" color="#52C41A" />
        免费取消
      </div>
      <button class="tj-booking-bar__btn" @click="goBooking">立即预订</button>
    </div>

    <!-- 日期选择 -->
    <van-calendar
      v-model:show="showDatePicker"
      type="range"
      :min-date="today"
      color="#FF9645"
      @confirm="onDateConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import type { Homestay } from '@/types';
import type { Review } from '@/types';
import { getHomestayDetail, getHomestayReviews, addFavorite, removeFavorite } from '../api/mobileApi';
import { useOrderStore } from '../stores/orderStore';

const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();

const homestayId = Number(route.params.id);
const homestay = ref<Homestay | null>(null);
const reviews = ref<Review[]>([]);
const currentImageIndex = ref(0);
const showFullDesc = ref(false);
const showDatePicker = ref(false);
const activeFacility = ref('');
const isFavorited = ref(false);
const today = new Date();
const windowWidth = window.innerWidth;
const defaultAvatar = 'https://picsum.photos/96/96?random=999';

const checkInText = computed(() => {
  if (!orderStore.checkInDate || !orderStore.checkOutDate) return '';
  return `${orderStore.checkInDate.slice(5)} - ${orderStore.checkOutDate.slice(5)}`;
});

const displayedFacilities = computed(() => {
  const all = getAllFacilities();
  return all.slice(0, 10);
});

function getAllFacilities() {
  return (homestay.value?.facilities || []).map(name => ({
    name,
    icon: getFacilityIcon(name),
  }));
}

function getFacilityIcon(name: string): string {
  const map: Record<string, string> = {
    'WiFi': '📶', '空调': '❄️', '24h热水': '🚿', '冰箱': '🧊',
    '洗衣机': '🧺', '厨房': '🍳', '停车位': '🚗', '电梯': '🏗️',
    '电视': '📺', '吹风机': '💨', '毛巾': '🛁', '拖鞋': '🩴',
  };
  return map[name] || '✔️';
}

function toggleFacility(name: string) {
  activeFacility.value = activeFacility.value === name ? '' : name;
}

function onDateConfirm(values: [Date, Date]) {
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  orderStore.setDateRange(fmt(values[0]), fmt(values[1]));
  showDatePicker.value = false;
}

function goBooking() {
  if (!homestay.value) return;
  orderStore.initBooking(homestay.value);
  router.push(`/booking/${homestayId}`);
}

function onShare() { showToast('分享功能开发中'); }

function contactLandlord() { showToast('联系房东功能开发中'); }

async function toggleFavorite() {
  try {
    if (isFavorited.value) {
      await removeFavorite(homestayId);
      isFavorited.value = false;
    } else {
      await addFavorite(homestayId);
      isFavorited.value = true;
      showToast('已添加到收藏');
    }
  } catch {
    router.push('/login');
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

async function loadDetail() {
  try {
    const res = await getHomestayDetail(homestayId);
    if (res.code === 200 && res.data) {
      homestay.value = res.data;
      loadMockLandlord();
    } else {
      loadMockDetail();
    }
  } catch {
    loadMockDetail();
  }
}

function loadMockLandlord() {
  // landlord loaded in mock detail
}

function loadMockDetail() {
  homestay.value = {
    homestayId,
    title: '春熙路近地铁轻奢两居室·超赞房东',
    description: '这是一间温馨舒适的大床房，位于成都市中心高层，窗外视野开阔，夜可观星，晨可看日出。房间配备独立卫浴、中央空调、100M高速WiFi、小冰箱、洗衣机等设施齐全。步行5分钟可达地铁站，周边商场、餐厅、便利店一应俱全。无论是出差还是旅行，这里都是您的理想之选。房间采用现代简约风格装修，乳胶床垫、高品质床品保证您的睡眠质量。房东热情好客，可提供当地旅游攻略，帮助您规划行程。',
    address: '成都市·锦江区·春熙路太古里',
    cityCode: 'chengdu',
    price: 328,
    rating: 4.9,
    reviewCount: 128,
    maxGuests: 4,
    area: 85,
    roomCount: 2,
    facilities: ['WiFi', '空调', '24h热水', '冰箱', '洗衣机', '厨房', '停车位', '电梯', '电视', '吹风机', '毛巾', '拖鞋'],
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=750&h=500&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=750&h=500&fit=crop',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=750&h=500&fit=crop',
      'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=750&h=500&fit=crop',
    ],
    auditStatus: 1,
    status: 1,
    landlordId: 1,
    location: { lat: 0, lng: 0 },
    createdAt: new Date().toISOString(),
  };
  reviews.value = [
    {
      reviewId: 1,
      orderId: 1,
      userId: 1,
      homestayId,
      rating: 5,
      content: '房间非常干净整洁，房东热情周到，位置绝佳，下次来还住这里！',
      images: [],
      auditStatus: 1,
      createdAt: '2026-03-10T10:00:00Z',
      user: { nickname: '旅行者小明', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face', userId: 1, role: 'guest' as const },
    },
    {
      reviewId: 2,
      orderId: 2,
      userId: 2,
      homestayId,
      rating: 4,
      content: '性价比很高，设施齐全，就是隔音稍差一些。',
      images: [],
      auditStatus: 1,
      createdAt: '2026-03-08T14:30:00Z',
      user: { nickname: '背包客阿花', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face', userId: 2, role: 'guest' as const },
    },
    {
      reviewId: 3,
      orderId: 3,
      userId: 3,
      homestayId,
      rating: 5,
      content: '超赞房东！提前告知了很多实用信息，还推荐了周边美食，太贴心了！',
      images: [],
      auditStatus: 1,
      createdAt: '2026-03-05T09:15:00Z',
      user: { nickname: '都市白领', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face', userId: 3, role: 'guest' as const },
    },
  ];
}

const landlord = ref<{
  nickname?: string;
  avatar?: string;
  isSuperhost?: boolean;
  responseRate?: string;
} | null>(null);

async function loadReviews() {
  try {
    const res = await getHomestayReviews(homestayId);
    if (res.code === 200 && res.data) {
      reviews.value = res.data;
    }
  } catch {
    // reviews loaded in mock
    landlord.value = {
      nickname: '房东小李',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
      isSuperhost: true,
      responseRate: '98',
    };
  }
}

onMounted(async () => {
  await Promise.all([loadDetail(), loadReviews()]);
  landlord.value = {
    nickname: '房东小李',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    isSuperhost: true,
    responseRate: '98',
  };
});
</script>

<style scoped>
.tj-detail-page {
  background: var(--tj-bg-page);
  padding-bottom: calc(72px + var(--tj-safe-bottom));
}

/* ========== 图片轮播 ========== */
.tj-detail-swipe {
  position: relative;
  width: 100%;
  background: #1A1A1A;
}

.tj-detail-swipe__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.tj-detail-swipe__indicator {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  color: #fff;
  font-size: 11px;
  padding: 3px 12px;
  border-radius: 999px;
  z-index: 2;
}

.tj-detail-swipe__topbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 3;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px 14px;
  padding-top: calc(10px + var(--tj-safe-top));
  background: linear-gradient(180deg, rgba(0,0,0,0.38) 0%, transparent 100%);
}

.tj-detail-swipe__back,
.tj-detail-swipe__action {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s, opacity 0.15s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}

.tj-detail-swipe__back:active,
.tj-detail-swipe__action:active {
  transform: scale(0.9);
  opacity: 0.8;
}

.tj-detail-swipe__actions { display: flex; gap: 8px; }
.tj-detail-swipe__action.is-active { background: rgba(255, 150, 69, 0.15); }

/* ========== 详情内容 ========== */
.tj-detail-section {
  background: var(--tj-bg-card);
}

.tj-detail-section__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.tj-detail-section__title {
  font-size: var(--tj-fs-lg);
  font-weight: 700;
  color: var(--tj-text-title);
}

.tj-detail-section__more {
  font-size: var(--tj-fs-sm);
  color: var(--tj-text-hint);
  display: flex;
  align-items: center;
  gap: 2px;
  cursor: pointer;
}

/* 标题 */
.tj-detail-title {
  font-size: var(--tj-fs-xl);
  font-weight: 700;
  color: var(--tj-text-title);
  line-height: 1.5;
  margin-bottom: 10px;
  letter-spacing: 0.3px;
}

/* 评分行 */
.tj-detail-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.tj-detail-meta__rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tj-detail-meta__score {
  font-size: var(--tj-fs-md);
  font-weight: 700;
  color: var(--tj-text-title);
}

.tj-detail-meta__count {
  font-size: var(--tj-fs-xs);
  color: var(--tj-text-hint);
}

.tj-detail-superhost {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: var(--tj-fs-xs);
  color: #fff;
  background: linear-gradient(135deg, #FF8C3B, #FF6B00);
  padding: 2px 7px;
  border-radius: 3px;
  font-weight: 600;
}

/* 位置 */
.tj-detail-location {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 12px;
}

.tj-detail-location__text {
  flex: 1;
  font-size: var(--tj-fs-sm);
  color: var(--tj-text-hint);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tj-detail-location__map {
  font-size: var(--tj-fs-xs);
  color: var(--tj-orange);
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  cursor: pointer;
}

/* 参数 */
.tj-detail-params {
  display: flex;
  gap: 16px;
}

.tj-detail-param {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: var(--tj-fs-sm);
  color: var(--tj-text-body);
}

/* 描述 */
.tj-detail-desc {
  font-size: var(--tj-fs-md);
  color: var(--tj-text-body);
  line-height: 1.8;
}

.tj-detail-desc--collapsed {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.tj-detail-desc__toggle {
  margin-top: 8px;
  font-size: var(--tj-fs-sm);
  color: var(--tj-orange);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
}

/* 评分块 */
.tj-detail-rating-block {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.tj-detail-rating-block__score {
  font-size: var(--tj-fs-2xl);
  font-weight: 800;
  color: var(--tj-orange);
}

/* 评价 */
.tj-review-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.tj-review-item__avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.tj-detail-empty {
  text-align: center;
  color: var(--tj-text-hint);
  font-size: var(--tj-fs-sm);
  padding: 20px 0;
}

.tj-detail-more-btn {
  margin-top: 14px;
  color: var(--tj-orange) !important;
  border-color: var(--tj-orange) !important;
}

/* ========== 底部悬浮预订栏 ========== */
.tj-booking-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 500;
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: var(--tj-shadow-bar);
  padding: 10px 16px calc(10px + var(--tj-safe-bottom));
  display: flex;
  align-items: center;
  gap: 8px;
}

.tj-booking-bar__price {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tj-booking-bar__price-row {
  display: flex;
  align-items: baseline;
  gap: 1px;
}

.tj-booking-bar__dates {
  font-size: var(--tj-fs-sm);
  color: var(--tj-text-hint);
}

.tj-booking-bar__hint {
  flex: 1;
  font-size: var(--tj-fs-xs);
  color: var(--tj-success);
  display: flex;
  align-items: center;
  gap: 3px;
}

.tj-booking-bar__btn {
  height: 44px;
  padding: 0 28px;
  border-radius: 22px;
  background: linear-gradient(135deg, #FF9645, #FF8C3B);
  color: #fff;
  font-size: var(--tj-fs-md);
  font-weight: 700;
  border: none;
  box-shadow: var(--tj-shadow-btn);
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  letter-spacing: 0.3px;
}

.tj-booking-bar__btn:active {
  opacity: 0.88;
  transform: scale(0.97);
  box-shadow: 0 2px 8px rgba(255, 150, 69, 0.2);
}
</style>
