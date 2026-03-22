<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <video
        class="hero-video"
        autoplay
        muted
        loop
        playsinline
        poster="/home.png"
      >
        <source :src="homeVideo" type="video/mp4">
      </video>
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">发现独特的住宿体验</h1>
        <p class="hero-subtitle">探索精选民宿，像当地人一样旅行</p>
      </div>
    </section>

    <!-- Category Navigation -->
    <nav class="category-nav" :class="{ 'category-nav--sticky': isSticky }">
      <div class="category-list">
        <div 
          v-for="cat in categories" 
          :key="cat.id" 
          class="category-item" 
          :class="{ active: currentCategory === cat.id }"
          @click="selectCategory(cat.id)"
        >
          <el-icon :size="24"><component :is="cat.icon" /></el-icon>
          <span>{{ cat.name }}</span>
        </div>
      </div>
    </nav>

    <!-- Homestay Grid -->
    <section class="homestay-grid-section">
      <div class="grid-container" v-loading="loading">
        <HomestayCard 
          v-for="item in homestayList" 
          :key="item.homestayId" 
          :homestay="item" 
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// 对应论文第5章5.2节
import { ref, onMounted } from 'vue';
import HomestayCard from '@/components/business/HomestayCard.vue';
import { House, Ship, Sunrise, OfficeBuilding, Grape, Sugar } from '@element-plus/icons-vue';
import { homestayApi } from '@/api/modules/homestay';
import homeVideo from '/home.mp4?url';
import type { Homestay } from '@/types';

const loading = ref(false);
const isSticky = ref(false);
const currentCategory = ref('all');
const homestayList = ref<Homestay[]>([]);

const categories = [
  { id: 'all', name: '全部', icon: House },
  { id: 'sea', name: '海景', icon: Ship },
  { id: 'mountain', name: '山景', icon: Sunrise },
  { id: 'city', name: '城市', icon: OfficeBuilding },
  { id: 'ancient', name: '古镇', icon: Grape },
  { id: 'camping', name: '露营', icon: Sugar },
];

// 加载房源数据
const loadHomestays = async () => {
  loading.value = true;
  try {
    const res = await homestayApi.search({ page: 1, pageSize: 20 });
    homestayList.value = res.list;
  } catch (error) {
    console.error('加载房源失败:', error);
  } finally {
    loading.value = false;
  }
};

const selectCategory = (id: string) => {
  currentCategory.value = id;
  loadHomestays();
};

onMounted(() => {
  loadHomestays();
  window.addEventListener('scroll', () => {
    isSticky.value = window.scrollY > 400;
  });
});
</script>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
}

.hero-section {
  position: relative;
  height: 600px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;

  .hero-video {
    position: absolute;
    top: 50%;
    left: 50%;
    min-width: 100%;
    min-height: 100%;
    width: auto;
    height: auto;
    transform: translate(-50%, -50%);
    object-fit: cover;
    z-index: 0;
  }

  .hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
  }

  .hero-content {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 850px;
    padding: 0 20px;

    .hero-title {
      font-size: 48px;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
      margin-bottom: 16px;
    }

    .hero-subtitle {
      font-size: 24px;
      font-weight: 500;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
      margin-bottom: 40px;
    }
  }
}

.category-nav {
  position: sticky;
  top: 80px; // Below header
  z-index: 900;
  background: white;
  border-bottom: 1px solid #eee;
  padding: 20px 0;
  transition: all 0.3s ease;
  
  &.category-nav--sticky {
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }

  .category-list {
    max-width: 1440px;
    margin: 0 auto;
    display: flex;
    gap: 40px;
    overflow-x: auto;
    padding: 0 40px;
    scrollbar-width: none;
    
    &::-webkit-scrollbar { display: none; }

    .category-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      color: #717171;
      min-width: 64px;
      padding-bottom: 10px;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;

      &:hover {
        color: #222;
        border-bottom-color: #ddd;
      }

      &.active {
        color: #222;
        font-weight: 600;
        border-bottom-color: var(--color-primary);
      }
      
      span { font-size: 12px; }
    }
  }
}

.homestay-grid-section {
  max-width: 1440px;
  margin: 40px auto;
  padding: 0 40px;

  .grid-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;

    @media (max-width: 1200px) {
      grid-template-columns: repeat(3, 1fr);
    }
    @media (max-width: 900px) {
      grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  }
}
</style>