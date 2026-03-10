<template>
  <div class="wishlist-page">
    <h2 class="page-title">我的收藏</h2>
    
    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="3" animated />
    </div>

    <div v-else-if="wishlist.length > 0" class="wishlist-grid">
      <HomestayCard 
        v-for="item in wishlist" 
        :key="item.homestayId" 
        :homestay="item" 
      />
    </div>

    <div v-else class="empty-state">
      <el-empty description="暂无收藏房源">
        <el-button type="primary" @click="router.push('/')">去发现心仪房源</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { homestays } from '@/mock/data';
import HomestayCard from '@/components/business/HomestayCard.vue';
import type { Homestay } from '@/types';

const router = useRouter();
const wishlist = ref<Homestay[]>([]);
const loading = ref(true);

onMounted(() => {
  setTimeout(() => {
    // Mock: just pick first 3 homestays as wishlist
    wishlist.value = homestays.slice(0, 3);
    loading.value = false;
  }, 500);
});
</script>

<style scoped lang="scss">
.wishlist-page {
  padding: 24px;
  background: white;
  border-radius: 12px;
  min-height: 500px;

  .page-title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 32px;
    color: #222;
  }
}

.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.empty-state {
  padding: 60px 0;
  text-align: center;
}
</style>
