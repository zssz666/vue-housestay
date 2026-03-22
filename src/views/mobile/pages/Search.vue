<template>
  <div class="page-container tj-search-page">

    <!-- ========== 顶部导航+搜索 ========== -->
    <div class="tj-nav tj-nav--sticky">
      <!-- 返回 -->
      <div class="tj-nav-back" @click="router.back()">
        <van-icon name="arrow-left" size="20" color="#333" />
      </div>
      <!-- 搜索框 -->
      <div class="tj-nav-search-input" @click="focusSearch">
        <van-icon name="search" size="14" color="#999" />
        <input
          ref="searchInput"
          v-model="keyword"
          type="search"
          placeholder="搜索目的地/民宿名称"
          class="tj-nav-search-input__field"
          @search="onSearch"
          @keydown.enter="onSearch"
        />
        <van-icon v-if="keyword" name="clear" size="14" color="#CCC" @click.stop="clearKeyword" />
      </div>
    </div>

    <!-- 顶部占位 -->
    <div style="height: 44px;"></div>

    <!-- ========== 筛选栏 ========== -->
    <div class="tj-search-filter-bar">
      <div
        v-for="item in filterItems"
        :key="item.key"
        class="tj-search-filter-item"
        :class="{ 'is-active': activeFilter === item.key }"
        @click="toggleFilter(item.key)"
      >
        {{ item.label }}
        <van-icon :name="activeFilter === item.key ? 'arrow-up' : 'arrow-down'" size="10" color="#999" />
      </div>
      <div class="tj-search-filter-item" @click="toggleMapMode">
        <van-icon :name="viewMode === 'map' ? 'location-o' : 'map-o'" size="16" color="#666" />
      </div>
    </div>

    <!-- 结果统计 -->
    <div class="tj-search-result-info" v-if="!loading">
      <span>共找到 <strong>{{ total }}</strong> 套房源</span>
    </div>

    <!-- ========== 房源列表 ========== -->
    <van-pull-refresh v-model="refreshing" success-text="刷新成功" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        :finished-text="finished && list.length ? '— 没有更多了 —' : ''"
        @load="onLoad"
      >
        <!-- 单列大图结果 -->
        <div
          v-for="item in list"
          :key="item.homestayId"
          class="tj-search-result-item tj-animate-in"
          @click="goDetail(item.homestayId)"
        >
          <!-- 封面图 -->
          <div class="tj-search-result-item__cover-wrap">
            <img
              :src="item.images?.[0] || `https://picsum.photos/400/300?random=${item.homestayId}`"
              :alt="item.title"
              class="tj-search-result-item__cover"
              loading="lazy"
            />
            <!-- 角标 -->
            <div class="tj-search-result-item__badge" v-if="item.isSuperHost">
              <div class="tj-home-card__badge-inner" style="font-size: 10px;">超赞房东</div>
            </div>
          </div>

          <!-- 信息 -->
          <div class="tj-search-result-item__info">
            <!-- 标题 -->
            <div class="tj-search-result-item__title tj-ellipsis-2">{{ item.title }}</div>

            <!-- 位置 -->
            <div class="tj-search-result-item__meta">
              <van-icon name="location-o" size="12" color="#999" />
              {{ item.address }}
            </div>

            <!-- 设施标签 -->
            <div class="tj-search-result-item__tags" v-if="item.facilities?.length">
              <span class="tj-tag tj-tag--dot" v-for="fac in item.facilities.slice(0, 2)" :key="fac">{{ fac }}</span>
            </div>

            <!-- 底部价格+评分 -->
            <div class="tj-search-result-item__footer">
              <div class="tj-price">
                <span class="tj-price__symbol">¥</span>
                <span class="tj-price__amount">{{ item.price }}</span>
                <span class="tj-price__unit">/晚</span>
              </div>
              <div class="tj-search-result-item__rating">
                <van-icon name="star" color="#FFB800" size="12" />
                {{ item.rating?.toFixed(1) || '5.0' }}
              </div>
            </div>
          </div>
        </div>
      </van-list>

      <!-- 空状态 -->
      <div v-if="!loading && !list.length && !refreshing" class="tj-empty">
        <div class="tj-empty__icon">🔍</div>
        <div class="tj-empty__title">没有找到符合条件的房源</div>
        <div class="tj-empty__desc">试试调整筛选条件吧</div>
        <button class="tj-btn tj-btn--orange-outline tj-btn--sm" style="margin-top: 14px;" @click="resetFilters">
          清空筛选
        </button>
      </div>
    </van-pull-refresh>

    <!-- ========== 筛选弹窗 ========== -->
    <van-popup v-model:show="showFilter" position="top" round :style="{ height: '70vh' }">
      <div class="tj-filter-sheet">
        <!-- 头部 -->
        <div class="tj-filter-sheet__header">
          <span class="tj-filter-sheet__title">筛选条件</span>
          <span class="tj-filter-sheet__reset" @click="resetFilters">重置</span>
        </div>

        <!-- 价格区间 -->
        <div class="tj-filter-section">
          <div class="tj-filter-section__label">价格区间（元/晚）</div>
          <div class="tj-price-range-inputs">
            <input
              v-model="localMinPrice"
              type="number"
              placeholder="最低价"
              class="tj-filter-input"
              @change="onPriceChange"
            />
            <span class="tj-price-range-sep">-</span>
            <input
              v-model="localMaxPrice"
              type="number"
              placeholder="最高价"
              class="tj-filter-input"
              @change="onPriceChange"
            />
          </div>
          <van-slider
            v-model="localPriceRange"
            range
            :min="0"
            :max="3000"
            active-color="#FF9645"
            inactive-color="#E8E8E8"
            @update:model-value="onSliderChange"
          />
        </div>

        <!-- 房型 -->
        <div class="tj-filter-section">
          <div class="tj-filter-section__label">房型</div>
          <div class="tj-filter-chips">
            <div
              v-for="type in roomTypes"
              :key="type.value"
              class="tj-filter-chip"
              :class="{ 'is-active': localRoomType === type.value }"
              @click="localRoomType = localRoomType === type.value ? '' : type.value"
            >
              {{ type.label }}
            </div>
          </div>
        </div>

        <!-- 设施 -->
        <div class="tj-filter-section">
          <div class="tj-filter-section__label">设施服务</div>
          <div class="tj-filter-facilities">
            <div
              v-for="fac in facilityOptions"
              :key="fac"
              class="tj-filter-facility"
              :class="{ 'is-active': localFacilities.includes(fac) }"
              @click="toggleLocalFacility(fac)"
            >
              {{ fac }}
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="tj-filter-sheet__footer">
          <button class="tj-btn tj-btn--block tj-btn--orange-outline tj-btn--md" @click="showFilter = false">
            取消
          </button>
          <button class="tj-btn tj-btn--block tj-btn--primary tj-btn--md" @click="applyFilters">
            应用筛选
          </button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Homestay } from '@/types';
import { getHomestayList } from '../api/mobileApi';
import { useSearchStore } from '../stores/searchStore';

const route = useRoute();
const router = useRouter();
const searchStore = useSearchStore();

const keyword = ref(searchStore.keyword || '');
const searchInput = ref<HTMLInputElement | null>(null);
const activeFilter = ref('');
const viewMode = ref<'list' | 'map'>('list');
const showFilter = ref(false);
const refreshing = ref(false);
const loading = ref(false);
const finished = ref(false);
const total = ref(0);
const page = ref(1);
const size = 10;

const list = ref<Homestay[]>([]);

// Local filter state
const localMinPrice = ref('');
const localMaxPrice = ref('');
const localPriceRange = ref<[number, number]>([0, 3000]);
const localRoomType = ref('');
const localFacilities = ref<string[]>([]);

const filterItems = [
  { key: 'price', label: '价格' },
  { key: 'type', label: '房型' },
  { key: 'facility', label: '设施' },
];

const roomTypes = [
  { label: '不限', value: '' },
  { label: '整套出租', value: 'whole' },
  { label: '独立房间', value: 'private' },
  { label: '合住房间', value: 'shared' },
];

const facilityOptions = ['WiFi', '空调', '24h热水', '厨房', '停车位', '洗衣机', '冰箱', '电梯'];

function toggleFilter(key: string) {
  if (activeFilter.value === key) {
    activeFilter.value = '';
    showFilter.value = false;
  } else {
    activeFilter.value = key;
    showFilter.value = true;
  }
}

function toggleMapMode() {
  viewMode.value = viewMode.value === 'list' ? 'map' : 'list';
}

function focusSearch() {
  searchInput.value?.focus();
}

function clearKeyword() {
  keyword.value = '';
  searchStore.setKeyword('');
  fetchList(true);
}

function onSearch() {
  searchStore.setKeyword(keyword.value);
  fetchList(true);
}

function onPriceChange() {
  if (localMinPrice.value || localMaxPrice.value) {
    localPriceRange.value = [
      Number(localMinPrice.value) || 0,
      Number(localMaxPrice.value) || 3000,
    ];
  }
}

function onSliderChange(val: [number, number]) {
  localMinPrice.value = String(val[0]);
  localMaxPrice.value = String(val[1]);
}

function toggleLocalFacility(fac: string) {
  const idx = localFacilities.value.indexOf(fac);
  if (idx === -1) localFacilities.value.push(fac);
  else localFacilities.value.splice(idx, 1);
}

function applyFilters() {
  searchStore.setPriceRange(
    Number(localMinPrice.value) || 0,
    Number(localMaxPrice.value) || 10000
  );
  if (localRoomType.value) searchStore.setRoomType(localRoomType.value);
  localFacilities.value.forEach(f => searchStore.toggleFacility(f));
  showFilter.value = false;
  fetchList(true);
}

function resetFilters() {
  localMinPrice.value = '';
  localMaxPrice.value = '';
  localPriceRange.value = [0, 3000];
  localRoomType.value = '';
  localFacilities.value = [];
  keyword.value = '';
  searchStore.clearAll();
  fetchList(true);
  showFilter.value = false;
}

async function fetchList(reset = false) {
  if (reset) {
    page.value = 1;
    finished.value = false;
    list.value = [];
  }

  loading.value = true;
  try {
    const res = await getHomestayList({
      keyword: keyword.value || undefined,
      cityCode: searchStore.cityCode || undefined,
      minPrice: localMinPrice.value ? Number(localMinPrice.value) : undefined,
      maxPrice: localMaxPrice.value ? Number(localMaxPrice.value) : undefined,
      roomType: localRoomType.value || undefined,
      facilities: localFacilities.value.length ? localFacilities.value : undefined,
      page: page.value,
      size,
    });
    if (res.code === 200 && res.data) {
      if (reset) list.value = res.data;
      else list.value.push(...res.data);
      total.value = res.data.length;
      if (res.data.length < size) finished.value = true;
      else page.value++;
    } else {
      loadMockList(reset);
    }
  } catch {
    loadMockList(reset);
  }
  loading.value = false;
}

function loadMockList(reset = false) {
  if (reset) list.value = [];
  const seeds = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  const cities = ['成都', '大理', '杭州', '厦门', '西安', '丽江', '桂林', '三亚'];
  const areas = ['春熙路', '洱海边', '西湖畔', '鼓浪屿', '古城墙', '古城中心', '漓江边', '海棠湾'];
  const titles = [
    '春熙路近地铁轻奢两居室', '洱海日出·一线海景大床房', '西湖畔禅意小院套房',
    '鼓浪屿复古花园洋房', '古城墙下现代轻奢公寓', '竹林深处私汤温泉别墅',
    '海边礁石浪漫蜜月套房', '山谷幽居自然氧吧民宿',
  ];

  const mockData: Homestay[] = titles.map((title, i) => ({
    homestayId: page.value * 10 + i,
    title,
    address: `${areas[i % areas.length]}·近地铁站`,
    cityCode: `city_${i}`,
    price: Math.floor(Math.random() * 500) + 158,
    rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)),
    reviewCount: Math.floor(Math.random() * 200) + 10,
    maxGuests: Math.floor(Math.random() * 4) + 2,
    area: Math.floor(Math.random() * 60) + 35,
    images: [`https://picsum.photos/400/300?random=${seeds[i % seeds.length]}`],
    facilities: ['WiFi', '空调', '24h热水'].slice(0, (i % 3) + 1),
    description: '',
    auditStatus: 1 as const,
    status: 1 as const,
    landlordId: 1,
    roomCount: 2,
    location: { lat: 0, lng: 0 },
    createdAt: new Date().toISOString(),
  }));

  if (reset) list.value = mockData;
  else list.value.push(...mockData);
  total.value = list.value.length;
  if (mockData.length < size) finished.value = true;
  else page.value++;
}

function onLoad() { fetchList(); }

async function onRefresh() {
  await fetchList(true);
  refreshing.value = false;
}

function goDetail(id: number) { router.push(`/homestay/${id}`); }

onMounted(async () => {
  if (route.query.roomType) {
    localRoomType.value = route.query.roomType as string;
  }
  await fetchList(true);
});
</script>

<style scoped>
.tj-search-page {
  background: var(--tj-bg-page);
  padding-bottom: calc(56px + var(--tj-safe-bottom));
}

/* ========== 导航栏 ========== */
.tj-nav--sticky {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.tj-nav-back {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
}

.tj-nav-back:active { background: #EBEBEB; }

.tj-nav-search-input {
  flex: 1;
  height: 34px;
  background: #F0F0F0;
  border-radius: 17px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  cursor: text;
}

.tj-nav-search-input__field {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 13px;
  color: var(--tj-text-title);
  outline: none;
  height: 100%;
  -webkit-appearance: none;
}

.tj-nav-search-input__field::placeholder {
  color: var(--tj-text-placeholder);
}

/* 隐藏浏览器默认搜索取消按钮 */
.tj-nav-search-input__field::-webkit-search-cancel-button {
  display: none;
}

/* ========== 筛选栏 ========== */
.tj-search-filter-bar {
  display: flex;
  align-items: center;
  background: var(--tj-bg-card);
  border-bottom: 1px solid var(--tj-border-light);
  padding: 0;
  position: sticky;
  top: 44px;
  z-index: 90;
}

.tj-search-filter-item {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 12px 14px;
  font-size: var(--tj-fs-sm);
  color: var(--tj-text-body);
  cursor: pointer;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
}

.tj-search-filter-item.is-active {
  color: var(--tj-orange);
  border-bottom-color: var(--tj-orange);
  font-weight: 600;
}

.tj-search-filter-item:last-child {
  margin-left: auto;
  padding: 12px 14px;
}

/* ========== 结果统计 ========== */
.tj-search-result-info {
  padding: 10px 16px 6px;
  font-size: var(--tj-fs-sm);
  color: var(--tj-text-hint);
  background: var(--tj-bg-page);
}

.tj-search-result-info strong {
  color: var(--tj-text-title);
  font-weight: 700;
}

/* ========== 搜索结果项 ========== */
.tj-search-result-item {
  background: var(--tj-bg-card);
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--tj-border-light);
  cursor: pointer;
  transition: background 0.15s;
}

.tj-search-result-item:active {
  background: var(--tj-bg-hover);
}

.tj-search-result-item__cover-wrap {
  position: relative;
  flex-shrink: 0;
}

.tj-search-result-item__cover {
  width: 100px;
  height: 75px;
  border-radius: var(--tj-radius-sm);
  object-fit: cover;
  display: block;
}

.tj-search-result-item__badge {
  position: absolute;
  top: 0;
  left: 0;
}

.tj-search-result-item__badge .tj-home-card__badge-inner {
  background: linear-gradient(135deg, #FF8C3B, #FF6B00);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px 2px 4px;
  border-radius: 0 0 4px 0;
}

.tj-search-result-item__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.tj-search-result-item__title {
  font-size: var(--tj-fs-md);
  font-weight: 500;
  color: var(--tj-text-title);
  line-height: 1.4;
  margin-bottom: 4px;
}

.tj-search-result-item__meta {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: var(--tj-fs-xs);
  color: var(--tj-text-hint);
  margin-bottom: 4px;
}

.tj-search-result-item__tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.tj-search-result-item__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tj-search-result-item__rating {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: var(--tj-fs-sm);
  color: var(--tj-text-body);
}

/* ========== 筛选弹窗 ========== */
.tj-filter-sheet {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.tj-filter-sheet__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tj-filter-sheet__title {
  font-size: var(--tj-fs-lg);
  font-weight: 700;
  color: var(--tj-text-title);
}

.tj-filter-sheet__reset {
  font-size: var(--tj-fs-sm);
  color: var(--tj-orange);
  cursor: pointer;
}

.tj-filter-section {
  margin-bottom: 24px;
}

.tj-filter-section__label {
  font-size: var(--tj-fs-md);
  font-weight: 600;
  color: var(--tj-text-title);
  margin-bottom: 12px;
}

.tj-price-range-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.tj-price-range-sep {
  color: var(--tj-text-hint);
  font-size: var(--tj-fs-md);
}

.tj-filter-input {
  flex: 1;
  height: 36px;
  background: #F5F5F5;
  border: 1px solid var(--tj-border);
  border-radius: var(--tj-radius-sm);
  padding: 0 12px;
  font-size: var(--tj-fs-sm);
  color: var(--tj-text-title);
  outline: none;
  -webkit-appearance: none;
}

.tj-filter-input:focus {
  border-color: var(--tj-orange);
}

.tj-filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tj-filter-chip {
  height: 32px;
  padding: 0 14px;
  border-radius: 16px;
  background: #F5F5F5;
  color: var(--tj-text-body);
  font-size: var(--tj-fs-sm);
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;
}

.tj-filter-chip.is-active {
  background: var(--tj-orange-bg);
  color: var(--tj-orange);
  border-color: var(--tj-orange);
  font-weight: 500;
}

.tj-filter-facilities {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tj-filter-facility {
  height: 32px;
  padding: 0 14px;
  border-radius: 16px;
  background: #F5F5F5;
  color: var(--tj-text-body);
  font-size: var(--tj-fs-sm);
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;
}

.tj-filter-facility.is-active {
  background: var(--tj-orange-bg);
  color: var(--tj-orange);
  border-color: var(--tj-orange);
  font-weight: 500;
}

.tj-filter-sheet__footer {
  display: flex;
  gap: 12px;
  margin-top: auto;
  padding-top: 16px;
}

.tj-filter-sheet__footer > * { flex: 1; }
</style>
