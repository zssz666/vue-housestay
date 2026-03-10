<template>
  <div class="homestay-card" :class="[`homestay-card--${layout}`]" @click="goToDetail">
    <div class="card-image-wrapper">
      <el-carousel 
        trigger="click" 
        height="100%" 
        :autoplay="false" 
        indicator-position="none" 
        arrow="hover"
        class="image-carousel"
      >
        <el-carousel-item v-for="(img, index) in homestay.images" :key="index">
          <el-image :src="img" fit="cover" class="card-image" loading="lazy" />
        </el-carousel-item>
      </el-carousel>
      
      <div class="favorite-btn" @click.stop="toggleFavorite">
        <el-icon :size="24" :color="isFavorite ? '#FF5A5F' : 'white'" class="heart-icon">
          <component :is="isFavorite ? 'StarFilled' : 'Star'" />
        </el-icon>
      </div>
    </div>

    <div class="card-content">
      <div class="row-header">
        <div class="location">
          <el-icon><Location /></el-icon>
          <span>{{ homestay.cityCode }}</span>
        </div>
        <div class="rating">
          <el-icon color="#FF5A5F"><StarFilled /></el-icon>
          <span>{{ homestay.rating }}</span>
          <span class="review-count">({{ homestay.reviewCount }})</span>
        </div>
      </div>

      <h3 class="title">{{ homestay.title }}</h3>
      
      <div class="facilities" v-if="layout === 'horizontal'">
        <el-tag 
          v-for="fac in homestay.facilities.slice(0, 5)" 
          :key="fac" 
          size="small" 
          type="info" 
          effect="plain"
          class="facility-tag"
        >
          {{ fac }}
        </el-tag>
      </div>
      <div class="facilities" v-else>
         <el-tag 
          v-for="fac in homestay.facilities.slice(0, 3)" 
          :key="fac" 
          size="small" 
          type="info" 
          effect="plain" 
          class="facility-tag"
        >
          {{ fac }}
        </el-tag>
      </div>

      <div class="price-row">
        <div class="price">
          <span class="currency">¥</span>
          <span class="amount">{{ homestay.price }}</span>
          <span class="unit">/晚</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Location, StarFilled } from '@element-plus/icons-vue';
import type { Homestay } from '@/types';

const props = withDefaults(defineProps<{
  homestay: Homestay;
  layout?: 'vertical' | 'horizontal';
}>(), {
  layout: 'vertical'
});

const router = useRouter();
const isFavorite = ref(false);

const goToDetail = () => {
  router.push(`/homestay/${props.homestay.homestayId}`);
};

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
  // Call API to toggle favorite
};
</script>

<style scoped lang="scss">
.homestay-card {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background-color: white;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  }

  &--vertical {
    display: flex;
    flex-direction: column;

    .card-image-wrapper {
      width: 100%;
      aspect-ratio: 3/2;
      position: relative;
      border-radius: 12px;
      overflow: hidden;
    }

    .card-content {
      padding: 12px 0;
    }
  }

  &--horizontal {
    display: flex;
    flex-direction: row;
    border: 1px solid #eee;
    
    .card-image-wrapper {
      width: 300px;
      height: 200px;
      flex-shrink: 0;
      position: relative;
    }

    .card-content {
      flex: 1;
      padding: 16px 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
  }

  .image-carousel {
    width: 100%;
    height: 100%;
  }

  .card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  .favorite-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 10;
    transition: transform 0.2s;
    
    &:hover {
      transform: scale(1.1);
    }
    
    .heart-icon {
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    }
  }

  .row-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 14px;
    color: #717171;

    .location {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .rating {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #222;
      font-weight: 500;
    }
  }

  .title {
    font-size: 16px;
    font-weight: 600;
    color: #222;
    margin: 0 0 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .facilities {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 12px;
    
    .facility-tag {
      background-color: #f7f7f7;
      border: none;
      color: #717171;
    }
  }

  .price {
    font-size: 18px;
    font-weight: 700;
    color: var(--color-primary);
    
    .unit {
      font-size: 14px;
      color: #717171;
      font-weight: 400;
      margin-left: 2px;
    }
  }
}
</style>
