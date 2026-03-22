<template>
  <div class="detail-page" v-if="homestay">
    <!-- Image Gallery -->
    <div class="gallery-container">
      <div class="gallery-main" @click="openImageViewer(0)">
        <el-image :src="homestay.images[0]" fit="cover" />
      </div>
      <div class="gallery-sub">
        <div v-for="(img, index) in homestay.images.slice(1, 5)" :key="index" class="gallery-item" @click="openImageViewer(index + 1)">
          <el-image :src="img" fit="cover" />
          <div class="gallery-overlay" v-if="index === 3 && homestay.images.length > 5">
            查看全部 {{ homestay.images.length }} 张照片
          </div>
        </div>
      </div>
    </div>

    <div class="main-container">
      <!-- Left Column: Info -->
      <div class="info-column">
        <div class="title-section">
          <h1>{{ homestay.title }}</h1>
          <div class="subtitle">
            <span class="rating">
              <el-icon color="#FF5A5F"><StarFilled /></el-icon>
              {{ homestay.rating }} · {{ homestay.reviewCount }}条评价
            </span>
            <span class="dot">·</span>
            <span class="location">{{ homestay.cityCode }}, {{ homestay.address }}</span>
          </div>
        </div>

        <el-divider />

        <div class="host-section">
            <div class="host-info">
              <h3>房东</h3>
              <p>优质房东，欢迎入住</p>
            </div>
            <el-avatar :size="56" :src="homestay.images[0]" />
          </div>

        <el-divider />

        <div class="description-section">
          <h3>房源介绍</h3>
          <p class="description-text" :class="{ collapsed: !isDescriptionExpanded }">
            {{ homestay.description }}
          </p>
          <el-button link type="primary" @click="isDescriptionExpanded = !isDescriptionExpanded">
            {{ isDescriptionExpanded ? '收起' : '查看更多' }}
            <el-icon><ArrowDown v-if="!isDescriptionExpanded" /><ArrowUp v-else /></el-icon>
          </el-button>
        </div>

        <el-divider />

        <div class="facilities-section">
          <h3>设施服务</h3>
          <div class="facilities-grid">
            <div v-for="fac in homestay.facilities" :key="fac" class="facility-item">
              <el-icon><Check /></el-icon>
              <span>{{ fac }}</span>
            </div>
          </div>
        </div>

        <el-divider />

        <div class="reviews-section">
          <h3>
            <el-icon color="#FF5A5F"><StarFilled /></el-icon>
            {{ homestay.rating }} · {{ homestay.reviewCount }}条评价
          </h3>
          <div class="review-list">
             <div v-for="review in reviews" :key="review.reviewId" class="review-item">
               <div class="reviewer">
                 <el-avatar :src="review.user?.avatar" />
                 <div class="reviewer-info">
                   <div class="name">{{ review.user?.nickname }}</div>
                   <div class="date">{{ review.createdAt }}</div>
                 </div>
               </div>
               <div class="review-content">{{ review.content }}</div>
             </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Booking Card (Sticky) -->
      <div class="booking-column">
        <div class="booking-card">
          <div class="card-header">
            <div class="price">
              <span class="amount">¥{{ homestay.price }}</span>
              <span class="unit"> / 晚</span>
            </div>
            <div class="rating">
              <el-icon><StarFilled /></el-icon> {{ homestay.rating }}
            </div>
          </div>

          <div class="booking-form">
            <div class="date-picker-wrapper">
              <el-date-picker
                v-model="dates"
                type="daterange"
                range-separator="→"
                start-placeholder="入住日期"
                end-placeholder="退房日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :disabled-date="disabledDate"
                style="width: 100%"
              />
            </div>
            
            <div class="guests-picker">
              <div class="label">人数</div>
              <el-input-number v-model="guests" :min="1" :max="homestay.maxGuests" style="width: 100%" />
            </div>

            <el-button type="primary" size="large" class="book-btn" @click="handleBook" :loading="bookingLoading">
              {{ dates && dates.length === 2 ? '申请预订' : '检查可订状态' }}
            </el-button>
            
            <p class="tip">您暂时不会被收费</p>

            <div class="price-breakdown" v-if="dates && dates.length === 2">
              <div class="row">
                <span>¥{{ homestay.price }} x {{ nightCount }}晚</span>
                <span>¥{{ basePrice }}</span>
              </div>
              <div class="row">
                <span>清洁费</span>
                <span>¥{{ cleaningFee }}</span>
              </div>
              <div class="row">
                <span>服务费</span>
                <span>¥{{ serviceFee }}</span>
              </div>
              <el-divider style="margin: 12px 0" />
              <div class="row total">
                <span>总价</span>
                <span>¥{{ totalPrice }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Viewer -->
    <el-image-viewer 
      v-if="showImageViewer" 
      :url-list="homestay.images" 
      :initial-index="imageIndex"
      @close="showImageViewer = false" 
    />
  </div>
</template>

<script setup lang="ts">
// 对应论文第5章5.4节
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBookingStore } from '@/stores/booking';
import { useUserStore } from '@/stores/user';
import { StarFilled, Check, ArrowDown, ArrowUp } from '@element-plus/icons-vue';
import { homestayApi } from '@/api/modules/homestay';
import { reviewApi } from '@/api/modules/review';
import type { Homestay, Review } from '@/types';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const bookingStore = useBookingStore();
const userStore = useUserStore();

const homestay = ref<Homestay | null>(null);
const reviews = ref<Review[]>([]);
const loading = ref(true);
const showImageViewer = ref(false);
const imageIndex = ref(0);
const isDescriptionExpanded = ref(false);
const dates = ref<[string, string] | null>(null);
const guests = ref(1);
const bookingLoading = ref(false);

// 加载房源详情和评论
const loadData = async () => {
  loading.value = true;
  try {
    const id = Number(route.params.id);
    const [homestayData, reviewsData] = await Promise.all([
      homestayApi.getDetail(id),
      reviewApi.getByHomestay(id, 1, 10)
    ]);
    homestay.value = homestayData;
    reviews.value = reviewsData.list;
  } catch (error) {
    console.error('加载房源详情失败:', error);
    ElMessage.error('加载房源详情失败');
  } finally {
    loading.value = false;
  }
};

const nightCount = computed(() => {
  if (!dates.value) return 0;
  const start = new Date(dates.value[0]);
  const end = new Date(dates.value[1]);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
});

const basePrice = computed(() => (homestay.value?.price || 0) * nightCount.value);
const cleaningFee = 50;
const serviceFee = computed(() => Math.round(basePrice.value * 0.1));
const totalPrice = computed(() => basePrice.value + cleaningFee + serviceFee.value);

const openImageViewer = (index: number) => {
  imageIndex.value = index;
  showImageViewer.value = true;
};

const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7; // Disable past dates
};

const handleBook = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    // router.push('/login'); // In real app
    // For demo, just simulate login or warn
    return;
  }

  if (!dates.value) {
    ElMessage.warning('请选择入住日期');
    return;
  }

  bookingLoading.value = true;
  
  // Update store
  if (homestay.value) {
    bookingStore.initBooking(
      homestay.value, 
      dates.value[0], 
      dates.value[1], 
      guests.value, 
      0
    );
    
    setTimeout(() => {
      router.push('/book/create');
    }, 500);
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.detail-page {
  padding-top: 80px;
  max-width: 1120px;
  margin: 0 auto;
  padding-bottom: 80px;
}

.gallery-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 8px;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 32px;
  cursor: pointer;

  .gallery-main {
    height: 100%;
    .el-image { width: 100%; height: 100%; }
  }

  .gallery-sub {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 8px;
    height: 100%;

    .gallery-item {
      position: relative;
      width: 100%;
      height: 100%;
      .el-image { width: 100%; height: 100%; }

      .gallery-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.5);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
      }
    }
  }
}

.main-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 80px;
  position: relative;
}

.info-column {
  .title-section {
    margin-bottom: 24px;
    h1 { font-size: 26px; margin-bottom: 8px; }
    .subtitle { color: #717171; display: flex; align-items: center; gap: 8px; }
  }

  .host-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 0;
  }

  .description-section {
    padding: 24px 0;
    .description-text {
      line-height: 1.6;
      margin-bottom: 16px;
      &.collapsed {
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }
  }

  .facilities-section {
    padding: 24px 0;
    .facilities-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      .facility-item {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }
  }
  
  .reviews-section {
    padding: 24px 0;
    .review-list {
      margin-top: 24px;
      .review-item {
        margin-bottom: 24px;
        .reviewer {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
          .reviewer-info {
            .name { font-weight: 600; }
            .date { font-size: 12px; color: #717171; }
          }
        }
      }
    }
  }
}

.booking-column {
  position: relative;
  
  .booking-card {
    position: sticky;
    top: 100px;
    border: 1px solid #ddd;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 6px 16px rgba(0,0,0,0.12);
    background: white;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 24px;
      
      .price {
        .amount { font-size: 22px; font-weight: 700; }
        .unit { color: #717171; }
      }
    }

    .booking-form {
      .date-picker-wrapper { margin-bottom: 16px; }
      .guests-picker { margin-bottom: 16px; }
      
      .book-btn {
        width: 100%;
        background-color: var(--color-primary);
        border-color: var(--color-primary);
        font-weight: 600;
        margin-bottom: 16px;
      }
      
      .tip { text-align: center; color: #717171; font-size: 12px; margin-bottom: 24px; }
      
      .price-breakdown {
        .row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          color: #717171;
          
          &.total {
            color: #222;
            font-weight: 700;
            font-size: 16px;
            margin-top: 16px;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .main-container { grid-template-columns: 1fr; gap: 40px; }
  .booking-column { display: none; } // Hide sidebar on mobile, use bottom bar instead (omitted for brevity)
  .gallery-container { height: 250px; }
}
</style>
