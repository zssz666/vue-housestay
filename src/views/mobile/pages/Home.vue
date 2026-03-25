<template>
  <div class="page-container tj-home-page">

    <!-- ========== Banner 轮播（底层，160px） ========== -->
    <van-swipe
      v-if="banners.length"
      :autoplay="3000"
      :height="160"
      :show-indicators="banners.length > 1"
      indicator-color="#FF9645"
      class="tj-home-banner"
    >
      <van-swipe-item
        v-for="banner in banners"
        :key="banner.id"
        @click="onBannerClick(banner)"
      >
        <img :src="banner.image" :alt="banner.title" class="tj-home-banner__img" />
      </van-swipe-item>
    </van-swipe>
    <div v-else class="tj-home-banner tj-skeleton" style="height: 160px;"></div>

    <!-- ========== 途家搜索大卡（城市 | 关键词 | 我的附近 + 日期 + 筛选项 + 快捷标签） ========== -->
    <div class="tj-search-wrap">
      <div class="tj-search-card">

        <!-- 1. 城市 + 竖线 + 关键词 + 我的附近 -->
        <div class="tj-search-loc-row">
          <div class="tj-search-loc-row__city" @click="showCityPicker = true">
            <span
              class="tj-search-loc-row__city-text"
              :class="{ 'is-placeholder': !selectedCity }"
            >{{ selectedCity || '选择城市' }}</span>
            <van-icon name="arrow-down" size="10" color="#999" class="tj-search-loc-row__tri" />
          </div>
          <div class="tj-search-loc-row__vline" aria-hidden="true" />
          <input
            v-model="keywordDraft"
            type="search"
            class="tj-search-loc-row__input"
            placeholder="位置/民宿名/编号"
            enterkeyhint="search"
            @keyup.enter="onSearch"
          />
          <div class="tj-search-loc-row__near" @click="onNearMe">
            <van-icon name="location-o" size="22" color="#333" />
            <span class="tj-search-loc-row__near-text">我的附近</span>
          </div>
        </div>

        <div class="tj-search-line" />

        <!-- 2. 入住 — 离店 + 共X晚 -->
        <div class="tj-search-date-row" @click="showDatePicker = true">
          <div class="tj-search-date-row__cell">
            <span class="tj-search-date-row__num">
              {{ checkInDate ? formatDateDisplay(checkInDate) : '选择入住' }}
            </span>
            <span v-if="checkInDate" class="tj-search-date-row__tag">{{ getDateTag(checkInDate) }}</span>
          </div>
          <span class="tj-search-date-row__dash">—</span>
          <div class="tj-search-date-row__cell tj-search-date-row__cell--end">
            <span class="tj-search-date-row__num">
              {{ checkOutDate ? formatDateDisplay(checkOutDate) : '选择离店' }}
            </span>
            <span v-if="checkOutDate" class="tj-search-date-row__tag">{{ getDateTag(checkOutDate) }}</span>
          </div>
          <span class="tj-search-date-row__nights">共{{ nightsCount }}晚</span>
        </div>

        <div class="tj-search-line" />

        <!-- 3. 居室数 / 床数 / 人数 -->
        <div class="tj-search-filter-row" @click="showGuestSheet = true">
          <span class="tj-search-filter-row__text">{{ filterRowLabel }}</span>
          <van-icon name="arrow-down" size="12" color="#999" />
        </div>

        <div class="tj-search-line" />

        <!-- 4. 快捷标签 -->
        <div class="tj-search-tags">
          <button
            v-for="tag in quickTags"
            :key="tag.text"
            type="button"
            class="tj-search-tag"
            @click="onQuickTag(tag)"
          >
            <van-icon v-if="tag.icon" :name="tag.icon" size="14" class="tj-search-tag__icon" />
            <span>{{ tag.text }}</span>
          </button>
        </div>

        <!-- 5. 开始搜索 -->
        <van-button
          type="primary"
          block
          round
          class="tj-search-btn"
          @click="onSearch"
        >
          开始搜索
        </van-button>
      </div>
    </div>

    <!-- ========== 精选民宿标题 ========== -->
    <div class="tj-home-section-head">
      <span class="tj-home-section-head__title">精选民宿</span>
      <span class="tj-home-section-head__sub">品质房源，安心入住</span>
      <button type="button" class="tj-home-refresh-btn" :disabled="refreshing" @click="onRefresh">
        <van-loading v-if="refreshing" type="spinner" size="13" color="#FF9645" />
        <van-icon v-else name="refresh" size="14" color="#FF9645" />
      </button>
    </div>

    <!-- ========== 房源瀑布流 ========== -->
    <div class="tj-waterfall">

        <!-- 左列 -->
        <div class="tj-waterfall__col">
          <div
            v-for="item in leftItems"
            :key="item.homestayId"
            class="tj-home-card tj-animate-in"
            @click="goDetail(item.homestayId)"
          >
            <!-- 图片区 -->
            <div class="tj-home-card__img-wrap">
              <img
                :src="item.images?.[0] || getCardImg(item.homestayId)"
                :alt="item.title"
                class="tj-home-card__img"
                loading="lazy"
              />
              <!-- 左上角精品房源角标 -->
              <div class="tj-home-card__badge" v-if="item.isSuperHost">
                <div class="tj-home-card__badge-inner">精品房源</div>
              </div>
              <!-- 右上角收藏 -->
              <div
                class="tj-home-card__fav"
                :class="{ 'is-fav': favorites.has(item.homestayId) }"
                @click.stop="toggleFavorite(item.homestayId)"
              >
                <van-icon
                  :name="favorites.has(item.homestayId) ? 'star' : 'star-o'"
                  :color="favorites.has(item.homestayId) ? '#FF9645' : '#999'"
                  size="15"
                  :class="{ 'tj-animate-heart': justFavorited === item.homestayId }"
                />
              </div>
            </div>

            <!-- 内容区 -->
            <div class="tj-home-card__body">
              <div class="tj-home-card__type" v-if="item.roomType">{{ item.roomType }}</div>
              <div class="tj-home-card__title">{{ item.title }}</div>
              <div class="tj-home-card__location">
                <van-icon name="location-o" size="11" color="#999" />
                {{ item.address }}
              </div>
              <div class="tj-home-card__rating">
                <van-icon name="star" color="#FFB800" size="12" />
                <span class="tj-home-card__rating-score">{{ item.rating?.toFixed(1) || '5.0' }}</span>
                <span class="tj-home-card__rating-count">({{ item.reviewCount || 0 }}条评价)</span>
              </div>
              <div class="tj-home-card__footer">
                <div class="tj-price">
                  <span class="tj-price__symbol">¥</span>
                  <span class="tj-price__amount">{{ item.price }}</span>
                  <span class="tj-price__unit">/晚</span>
                </div>
                <div class="tj-home-card__promo" v-if="item.promoAmount">
                  已减{{ item.promoAmount }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右列 -->
        <div class="tj-waterfall__col">
          <div
            v-for="item in rightItems"
            :key="item.homestayId"
            class="tj-home-card tj-animate-in"
            @click="goDetail(item.homestayId)"
          >
            <div class="tj-home-card__img-wrap">
              <img
                :src="item.images?.[0] || getCardImg(item.homestayId)"
                :alt="item.title"
                class="tj-home-card__img"
                loading="lazy"
              />
              <div class="tj-home-card__badge" v-if="item.isSuperHost">
                <div class="tj-home-card__badge-inner">超赞房东</div>
              </div>
              <div
                class="tj-home-card__fav"
                :class="{ 'is-fav': favorites.has(item.homestayId) }"
                @click.stop="toggleFavorite(item.homestayId)"
              >
                <van-icon
                  :name="favorites.has(item.homestayId) ? 'star' : 'star-o'"
                  :color="favorites.has(item.homestayId) ? '#FF9645' : '#999'"
                  size="15"
                  :class="{ 'tj-animate-heart': justFavorited === item.homestayId }"
                />
              </div>
            </div>
            <div class="tj-home-card__body">
              <div class="tj-home-card__type" v-if="item.roomType">{{ item.roomType }}</div>
              <div class="tj-home-card__title">{{ item.title }}</div>
              <div class="tj-home-card__location">
                <van-icon name="location-o" size="11" color="#999" />
                {{ item.address }}
              </div>
              <div class="tj-home-card__rating">
                <van-icon name="star" color="#FFB800" size="12" />
                <span class="tj-home-card__rating-score">{{ item.rating?.toFixed(1) || '5.0' }}</span>
                <span class="tj-home-card__rating-count">({{ item.reviewCount || 0 }}条评价)</span>
              </div>
              <div class="tj-home-card__footer">
                <div class="tj-price">
                  <span class="tj-price__symbol">¥</span>
                  <span class="tj-price__amount">{{ item.price }}</span>
                  <span class="tj-price__unit">/晚</span>
                </div>
                <div class="tj-home-card__promo" v-if="item.promoAmount">
                  已减{{ item.promoAmount }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载中 -->
      <div v-if="loading" class="tj-home-loading">
        <van-loading type="spinner" size="22" color="#FF9645" />
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && !homestayList.length" class="tj-empty">
        <div class="tj-empty__icon">🏡</div>
        <div class="tj-empty__title">暂无房源</div>
        <div class="tj-empty__desc">换个目的地试试吧</div>
      </div>

      <div style="height: 16px;"></div>

    <!-- ========== 日期选择弹窗 ========== -->
    <van-calendar
      v-model:show="showDatePicker"
      type="range"
      :min-date="today"
      :max-date="maxDate"
      color="#FF9645"
      @confirm="onDateConfirm"
    />

    <!-- ========== 人数选择弹窗 ========== -->
    <van-popup v-model:show="showGuestSheet" position="bottom" round :style="{ height: 'auto' }">
      <div class="tj-guest-sheet">
        <div class="tj-guest-sheet__header">
          <span class="tj-guest-sheet__title">选择入住人数</span>
        </div>
        <div class="tj-guest-sheet__body">
          <div class="tj-guest-sheet__row">
            <span class="tj-guest-sheet__row-label">成人</span>
            <van-stepper v-model="guestCount" min="1" max="10" @change="onGuestChange" theme="round" button-size="30" />
          </div>
          <div class="tj-guest-sheet__row">
            <div>
              <div class="tj-guest-sheet__row-label">儿童</div>
              <div class="tj-guest-sheet__row-sub">2-12岁，不占床位</div>
            </div>
            <van-stepper v-model="childCount" min="0" max="6" theme="round" button-size="30" />
          </div>
        </div>
        <div class="tj-guest-sheet__footer">
          <van-button block round type="primary" class="tj-guest-sheet__confirm" @click="showGuestSheet = false">
            确定 ({{ guestCount + childCount }}人)
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- ========== 城市选择弹窗 ========== -->
    <van-popup v-model:show="showCityPicker" position="bottom" round :style="{ height: '60vh' }">
      <div class="tj-city-sheet">
        <div class="tj-city-sheet__header">
          <span class="tj-city-sheet__title">选择城市</span>
          <van-icon name="cross" size="20" color="#999" @click="showCityPicker = false" />
        </div>
        <div class="tj-city-sheet__body">
          <div class="tj-city-list">
            <div
              v-for="city in cities"
              :key="city.value"
              class="tj-city-item"
              :class="{ 'is-active': selectedCity === city.label }"
              @click="selectCity(city)"
            >
              {{ city.label }}
            </div>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import type { Homestay } from '@/types';
import type { MobileBanner } from '../types';
import { getBanners, addFavorite, removeFavorite } from '../api/mobileApi';
import { useSearchStore } from '../stores/searchStore';

const router = useRouter();
const searchStore = useSearchStore();

// ========== 保留的所有原有状态 ==========
const refreshing = ref(false);
const loading = ref(false);
const homestayList = ref<(Homestay & HomestayExtra)[]>([]);
const favorites = ref(new Set<number>());
const justFavorited = ref<number | null>(null);
const banners = ref<MobileBanner[]>([]);

const imgSeeds = [10, 13, 16, 19, 22, 25, 28, 31, 34, 37];
function getCardImg(id: number): string {
  const seed = imgSeeds[(id - 1) % imgSeeds.length];
  return `https://picsum.photos/375/500?random=${seed}`;
}

interface HomestayExtra {
  isSuperHost?: boolean;
  promoAmount?: number;
  roomType?: string;
}

// ========== 途家搜索卡片相关状态 ==========
const selectedCity = ref('');
const showCityPicker = ref(false);
const showDatePicker = ref(false);
const showGuestSheet = ref(false);

const guestCount = ref(1);
const childCount = ref(0);
const keywordDraft = ref('');
const filterRowLabel = '居室数 / 床数 / 人数';

const quickTags = [
  { icon: 'gift-o', text: '积分当钱花' },
  { text: '文殊院', keyword: '文殊院' },
  { text: '青羊区', keyword: '青羊区' },
];

const today = new Date();
const maxDate = new Date(Date.now() + 365 * 24 * 3600 * 1000);

const cities = [
  { label: '成都', value: 'chengdu' },
  { label: '大理', value: 'dali' },
  { label: '杭州', value: 'hangzhou' },
  { label: '厦门', value: 'xiamen' },
  { label: '西安', value: 'xian' },
  { label: '丽江', value: 'lijiang' },
  { label: '桂林', value: 'guilin' },
  { label: '三亚', value: 'sanya' },
];

// 计算属性
const checkInDate = computed(() => searchStore.checkIn);
const checkOutDate = computed(() => searchStore.checkOut);

const nightsCount = computed(() => {
  if (!checkInDate.value || !checkOutDate.value) return 1;
  const diff = new Date(checkOutDate.value).getTime() - new Date(checkInDate.value).getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

const leftItems = computed(() => homestayList.value.filter((_, i) => i % 2 === 0));
const rightItems = computed(() => homestayList.value.filter((_, i) => i % 2 === 1));

// 格式化日期（3月22日）
function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

// 获取日期标签（今天/明天/周X）
function getDateTag(dateStr: string): string {
  const d = new Date(dateStr);
  const todayStr = today.toISOString().slice(0, 10);
  const tomorrowStr = new Date(today.getTime() + 86400000).toISOString().slice(0, 10);
  if (dateStr === todayStr) return '今天';
  if (dateStr === tomorrowStr) return '明天';
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return weekdays[d.getDay()] as string;
}

// ========== 原有方法（保留） ==========
function goDetail(id: number) { router.push(`/homestay/${id}`); }
function onBannerClick(_banner: MobileBanner) {}

async function toggleFavorite(id: number) {
  try {
    if (favorites.value.has(id)) {
      await removeFavorite(id);
      favorites.value.delete(id);
    } else {
      await addFavorite(id);
      favorites.value.add(id);
      justFavorited.value = id;
      setTimeout(() => { justFavorited.value = null; }, 500);
    }
  } catch {
    router.push('/login');
    showToast('请先登录');
  }
}

async function loadBanners() {
  try {
    const res = await getBanners();
    if (res.code === 200 && res.data?.length) banners.value = res.data;
    else banners.value = getMockBanners();
  } catch { banners.value = getMockBanners(); }
}

function getMockBanners(): MobileBanner[] {
  return [
    { id: 1, title: '夏日特惠', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=750&h=360&fit=crop' },
    { id: 2, title: '海边度假', image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=750&h=360&fit=crop' },
    { id: 3, title: '亲子游', image: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=750&h=360&fit=crop' },
  ];
}

async function loadHomestays() {
  loading.value = true;
  try {
    const res = await import('../api/mobileApi').then(m => m.getHomestayList({
      cityCode: searchStore.cityCode || undefined,
      keyword: searchStore.keyword || undefined,
      page: 1,
      size: 20,
    }));
    if (res.code === 200 && res.data?.length) homestayList.value = enrichList(res.data);
    else homestayList.value = getMockHomestays();
  } catch { homestayList.value = getMockHomestays(); }
  loading.value = false;
}

function enrichList(list: Homestay[]): (Homestay & HomestayExtra)[] {
  return list.map((item, i) => ({
    ...item,
    isSuperHost: i % 4 === 0,
    promoAmount: i % 3 === 0 ? Math.floor(Math.random() * 80 + 20) : undefined,
    roomType: ['整套出租', '独立房间', '合住房间'][item.homestayId % 3],
  }));
}

function getMockHomestays(): (Homestay & HomestayExtra)[] {
  const areas = ['春熙路', '洱海边', '西湖畔', '鼓浪屿', '古城墙', '古城中心', '漓江边', '海棠湾'];
  const titles = [
    '春熙路近地铁轻奢两居室', '洱海日出·一线海景大床房', '西湖畔禅意小院·静享时光',
    '鼓浪屿复古花园洋房套房', '古城墙下现代轻奢公寓', '竹林深处私汤温泉别墅',
    '海边礁石浪漫蜜月套房', '山谷幽居自然氧吧民宿', '都市高层俯瞰城市夜景',
    '老街深处民俗文化体验',
  ];
  const roomTypes = ['整套出租', '独立房间', '合住房间'];
  return titles.map((title, i) => ({
    homestayId: i + 1, title,
    address: `${areas[i % areas.length]}·近地铁站`,
    cityCode: `city_${i % 8}`, price: Math.floor(Math.random() * 500) + 158,
    rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)),
    reviewCount: Math.floor(Math.random() * 200) + 10, maxGuests: 2, area: 60,
    images: [], facilities: [],
    isSuperHost: i % 4 === 0,
    promoAmount: i % 3 === 0 ? Math.floor(Math.random() * 80 + 20) : undefined,
    roomType: roomTypes[i % 3],
    description: '', auditStatus: 1 as const, status: 1 as const, landlordId: 1,
    roomCount: 2, location: { lat: 0, lng: 0 },
    createdAt: new Date().toISOString(),
  }));
}

async function onRefresh() {
  await Promise.all([loadBanners(), loadHomestays()]);
  refreshing.value = false;
}

// ========== 搜索卡片交互方法 ==========
function onSearch() {
  searchStore.setKeyword(keywordDraft.value.trim());
  const hit = cities.find((c) => c.label === selectedCity.value);
  if (hit) {
    searchStore.setCity(hit.value);
  } else {
    searchStore.setCity('');
  }
  router.push('/search');
}

function onNearMe() {
  selectedCity.value = '';
  searchStore.setCity('');
  showToast('已切换为我的附近');
}

function onQuickTag(tag: { icon?: string; text: string; keyword?: string }) {
  if (tag.keyword) {
    keywordDraft.value = tag.keyword;
    return;
  }
  if (tag.text === '积分当钱花') {
    showToast('积分可抵现，下单时选择使用');
  }
}

function onServiceRule() {
  showToast('详见预订须知与服务承诺');
}

function selectCity(city: { label: string; value: string }) {
  selectedCity.value = city.label;
  searchStore.setCity(city.value);
  showCityPicker.value = false;
}

function setToday() {
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const tomorrow = new Date(today.getTime() + 86400000);
  searchStore.setDateRange(fmt(today), fmt(tomorrow));
}

function onDateConfirm(values: [Date, Date]) {
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  searchStore.setDateRange(fmt(values[0]), fmt(values[1]));
  showDatePicker.value = false;
}

function onGuestChange(_val: number) {
  searchStore.setGuests(guestCount.value + childCount.value);
}

onMounted(async () => {
  if (searchStore.cityCode) {
    const c = cities.find((x) => x.value === searchStore.cityCode);
    selectedCity.value = c?.label ?? '';
  } else {
    selectedCity.value = '成都';
    searchStore.setCity('chengdu');
  }
  if (!searchStore.checkIn || !searchStore.checkOut) {
    setToday();
  }
  keywordDraft.value = searchStore.keyword;

  await Promise.all([loadBanners(), loadHomestays()]);
});
</script>

<style scoped lang="scss">
/* ========== 途家大卡片搜索区（压在轮播图上） ========== */
.tj-search-wrap {
  padding: 0 16px;
  margin-top: -52px;
  position: relative;
  z-index: 10;
}

.tj-search-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 18px 16px 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.09);
}

/* 1. 城市 | 竖线 | 关键词 | 我的附近 */
.tj-search-loc-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
}

.tj-search-loc-row__city {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  max-width: 72px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:active {
    opacity: 0.65;
  }
}

.tj-search-loc-row__city-text {
  font-size: 16px;
  font-weight: 700;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &.is-placeholder {
    font-weight: 600;
    color: #999;
  }
}

.tj-search-loc-row__tri {
  flex-shrink: 0;
  transform: rotate(0deg);
}

.tj-search-loc-row__vline {
  width: 1px;
  height: 22px;
  background: #eeeeee;
  flex-shrink: 0;
}

.tj-search-loc-row__input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #333;
  padding: 6px 0;

  &::placeholder {
    color: #c9c9c9;
  }
}

.tj-search-loc-row__near {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 52px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:active {
    opacity: 0.65;
  }
}

.tj-search-loc-row__near-text {
  font-size: 10px;
  color: #666;
  margin-top: 2px;
  line-height: 1.2;
  text-align: center;
}

.tj-search-line {
  height: 1px;
  background: #f5f5f5;
  margin: 4px 0 0;
}

/* 2. 日期行 */
.tj-search-date-row {
  display: flex;
  align-items: center;
  padding: 14px 0 12px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:active {
    opacity: 0.85;
  }
}

.tj-search-date-row__cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-width: 0;

  &--end {
    align-items: flex-end;
    text-align: right;
  }
}

.tj-search-date-row__num {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  line-height: 1.1;
  letter-spacing: 0.2px;
}

.tj-search-date-row__tag {
  font-size: 11px;
  color: #999;
  line-height: 1.2;
}

.tj-search-date-row__dash {
  color: #ddd;
  font-size: 14px;
  margin: 0 10px 0 8px;
  flex-shrink: 0;
  padding-top: 2px;
}

.tj-search-date-row__nights {
  margin-left: auto;
  flex-shrink: 0;
  font-size: 12px;
  color: #999;
  padding-top: 4px;
  white-space: nowrap;
}

/* 3. 居室数 / 床数 / 人数 */
.tj-search-filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0 10px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:active {
    opacity: 0.75;
  }
}

.tj-search-filter-row__text {
  font-size: 14px;
  color: #333;
}

/* 4. 快捷标签 */
.tj-search-tags {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0 14px;
  margin: 0 -2px;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.tj-search-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  background: #f5f5f5;
  font-size: 12px;
  color: #666;
  font-family: inherit;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:active {
    opacity: 0.8;
    background: #ebebeb;
  }
}

.tj-search-tag__icon {
  color: #ff9645;
}

/* 5. 搜索按钮 */
.tj-search-btn {
  height: 46px;
  font-size: 17px;
  font-weight: 700;
  background: linear-gradient(135deg, #ff9645 0%, #ff7a3c 100%) !important;
  border: none !important;
  border-radius: 24px !important;
  box-shadow: 0 6px 18px rgba(255, 150, 69, 0.38);
  letter-spacing: 2px;

  &:active {
    opacity: 0.92;
    transform: scale(0.985);
    box-shadow: 0 3px 10px rgba(255, 150, 69, 0.28);
  }
}

/* 6. 服务说明 */
.tj-service-tip {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-top: 14px;
  padding: 0 4px;
  line-height: 1.5;
}

.tj-service-tip__high {
  font-size: 12px;
  color: #ff4d4f;
  font-weight: 700;
}

.tj-service-tip__norm {
  font-size: 12px;
  color: #666;
}

.tj-service-tip__rule {
  font-size: 12px;
  color: #999;
  margin-left: 2px;
  cursor: pointer;

  &:active {
    opacity: 0.65;
  }
}

/* ========== Banner ========== */
.tj-home-banner {
  margin: 0;
  border-radius: 0;

  :deep(.van-swipe__indicator) {
    background-color: rgba(255, 255, 255, 0.55);
    opacity: 1;
    width: 5px;
    height: 5px;
    border-radius: 3px;
    margin: 0 2px;

    &.van-swipe__indicator--active {
      background-color: #FF9645;
      width: 13px;
      border-radius: 3px;
    }
  }
}

.tj-home-banner__img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
}

/* ========== 区块标题 ========== */
.tj-home-section-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 18px 16px 10px;
}

.tj-home-refresh-btn {
  margin-left: auto;
  padding: 6px 8px;
  border: none;
  background: transparent;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:active {
    opacity: 0.7;
  }

  &:disabled {
    cursor: default;
  }
}

.tj-home-section-head__title {
  font-size: var(--tj-fs-xl);
  font-weight: 700;
  color: var(--tj-text-title);
}

.tj-home-section-head__sub {
  font-size: var(--tj-fs-xs);
  color: var(--tj-text-hint);
}

/* ========== 瀑布流 ========== */
.tj-waterfall {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 0 16px;
  align-items: start;
}

.tj-waterfall__col {
  display: flex;
  flex-direction: column;
}

/* ========== 房源卡片 ========== */
.tj-home-card {
  background: var(--tj-bg-card);
  border-radius: var(--tj-radius-md);
  box-shadow: var(--tj-shadow-card);
  overflow: hidden;
  break-inside: avoid;
  margin-bottom: 10px;
  cursor: pointer;
}

.tj-home-card__img-wrap {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #F0F0F0;
}

.tj-home-card__img-wrap::before {
  content: '';
  display: block;
  padding-top: 133.33%;
}

.tj-home-card__img {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.tj-home-card:active .tj-home-card__img { transform: scale(1.03); }

.tj-home-card__badge {
  position: absolute;
  top: 0; left: 0;
  z-index: 2;
}

.tj-home-card__badge-inner {
  background: linear-gradient(135deg, #FF8C3B, #FF6B00);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px 3px 6px;
  border-radius: 0 0 6px 0;
  letter-spacing: 0.3px;
}

.tj-home-card__fav {
  position: absolute;
  top: 8px; right: 8px;
  z-index: 2;
  width: 30px; height: 30px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);

  &.is-fav { background: #FFE8E0; }
  &:active { transform: scale(1.25); }
}

.tj-home-card__body { padding: 10px 11px 12px; }

.tj-home-card__type {
  display: inline-block;
  font-size: 10px;
  color: var(--tj-text-hint);
  background: var(--tj-bg-hover);
  padding: 2px 5px;
  border-radius: 2px;
  margin-bottom: 5px;
}

.tj-home-card__title {
  font-size: 15px;
  font-weight: 500;
  color: var(--tj-text-title);
  line-height: 1.4;
  margin-bottom: 5px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  min-height: 2.8em;
}

.tj-home-card__location {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  color: var(--tj-text-hint);
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tj-home-card__rating {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: var(--tj-text-body);
  margin-bottom: 7px;
}

.tj-home-card__rating-score { font-weight: 600; color: var(--tj-text-title); }
.tj-home-card__rating-count { color: var(--tj-text-hint); }

.tj-home-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.tj-home-card__promo {
  font-size: 10px;
  color: #fff;
  background: var(--tj-orange);
  padding: 2px 5px;
  border-radius: 2px;
  font-weight: 600;
}

.tj-home-loading {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

/* ========== 人数选择弹窗 ========== */
.tj-guest-sheet {
  padding-bottom: var(--tj-safe-bottom);
}

.tj-guest-sheet__header {
  padding: 16px;
  border-bottom: 1px solid var(--tj-border-light);
  text-align: center;
}

.tj-guest-sheet__title {
  font-size: var(--tj-fs-lg);
  font-weight: 700;
  color: var(--tj-text-title);
}

.tj-guest-sheet__body {
  padding: 16px;
}

.tj-guest-sheet__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--tj-border-light);

  &:last-child { border-bottom: none; }
}

.tj-guest-sheet__row-label {
  font-size: var(--tj-fs-md);
  font-weight: 600;
  color: var(--tj-text-title);
}

.tj-guest-sheet__row-sub {
  font-size: var(--tj-fs-xs);
  color: var(--tj-text-hint);
  margin-top: 3px;
}

.tj-guest-sheet__footer {
  padding: 12px 16px 0;
}

.tj-guest-sheet__confirm {
  height: 44px;
  font-weight: 700;
  background: linear-gradient(135deg, #FF9645, #FF8C3B) !important;
  border: none !important;
}

/* ========== 城市选择弹窗 ========== */
.tj-city-sheet {
  height: 60vh;
  display: flex;
  flex-direction: column;
}

.tj-city-sheet__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--tj-border-light);
}

.tj-city-sheet__title {
  font-size: var(--tj-fs-lg);
  font-weight: 700;
  color: var(--tj-text-title);
}

.tj-city-sheet__body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.tj-city-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 8px 16px;
}

.tj-city-item {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--tj-bg-hover);
  border-radius: var(--tj-radius-sm);
  font-size: var(--tj-fs-sm);
  color: var(--tj-text-body);
  cursor: pointer;
  transition: all 0.15s;
  border: 1.5px solid transparent;

  &.is-active {
    background: var(--tj-orange-bg);
    color: var(--tj-orange);
    border-color: var(--tj-orange);
    font-weight: 600;
  }

  &:active { opacity: 0.8; }
}
</style>
