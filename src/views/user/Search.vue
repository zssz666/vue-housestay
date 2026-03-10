<template>
  <div class="search-page">
    <div class="search-container">
      <!-- Filter Sidebar (Fixed Left) -->
      <aside class="sidebar-wrapper">
        <FilterSidebar @filter-change="handleFilterChange" />
      </aside>

      <!-- Results List (Scrollable Right) -->
      <main class="results-wrapper">
        <div class="results-header">
          <div class="results-count">
            共 {{ homestayList.length }} 套房源
          </div>
          <div class="results-tools">
            <el-select v-model="sortBy" placeholder="排序" size="default" style="width: 150px">
              <el-option label="综合排序" value="default" />
              <el-option label="价格从低到高" value="price_asc" />
              <el-option label="价格从高到低" value="price_desc" />
              <el-option label="评分最高" value="rating_desc" />
            </el-select>
            
            <el-button-group class="view-toggle">
              <el-button :type="viewType === 'list' ? 'primary' : 'default'" @click="viewType = 'list'">
                <el-icon><Menu /></el-icon>
              </el-button>
              <el-button :type="viewType === 'map' ? 'primary' : 'default'" @click="viewType = 'map'">
                <el-icon><Location /></el-icon>
              </el-button>
            </el-button-group>
          </div>
        </div>

        <div class="results-list" v-loading="loading">
          <template v-if="homestayList.length > 0">
            <HomestayCard 
              v-for="item in homestayList" 
              :key="item.homestayId" 
              :homestay="item" 
              layout="horizontal"
              class="result-item"
            />
          </template>
          <el-empty v-else description="暂无符合条件的房源" />
        </div>

        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            layout="prev, pager, next"
            background
          />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
// 对应论文第5章5.3节
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import FilterSidebar from '@/components/business/FilterSidebar.vue';
import HomestayCard from '@/components/business/HomestayCard.vue';
import { Menu, Location } from '@element-plus/icons-vue';
import { homestays } from '@/mock/data';
import { debounce } from 'lodash';

const route = useRoute();
const loading = ref(false);
const viewType = ref('list');
const sortBy = ref('default');
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(homestays.length);
const homestayList = ref(homestays);

const handleFilterChange = debounce((filters: any) => {
  loading.value = true;
  // Mock filter logic
  setTimeout(() => {
    let filtered = [...homestays];
    
    // Filter by price
    filtered = filtered.filter(h => h.price >= filters.priceRange[0] && h.price <= filters.priceRange[1]);
    
    // Filter by facilities
    if (filters.facilities.length > 0) {
      filtered = filtered.filter(h => filters.facilities.every((f: string) => h.facilities.includes(f)));
    }
    
    // Sort
    if (sortBy.value === 'price_asc') filtered.sort((a, b) => a.price - b.price);
    else if (sortBy.value === 'price_desc') filtered.sort((a, b) => b.price - a.price);
    else if (sortBy.value === 'rating_desc') filtered.sort((a, b) => b.rating - a.rating);

    homestayList.value = filtered;
    total.value = filtered.length;
    loading.value = false;
  }, 500);
}, 500);

// Sync with URL query
watch(() => route.query, (newQuery) => {
  // If query changes, reload list
  console.log('Query changed:', newQuery);
}, { immediate: true });

onMounted(() => {
  // Initial fetch
});
</script>

<style scoped lang="scss">
.search-page {
  padding-top: 80px;
  background-color: white;
  min-height: 100vh;
}

.search-container {
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  padding: 0 40px;
}

.sidebar-wrapper {
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 80px;
  height: calc(100vh - 80px);
  overflow-y: auto;
  border-right: 1px solid #eee;
  padding-right: 24px;
}

.results-wrapper {
  flex: 1;
  padding: 24px 0 24px 40px;

  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .results-count {
      font-size: 16px;
      font-weight: 600;
      color: #222;
    }

    .results-tools {
      display: flex;
      align-items: center;
      gap: 16px;
    }
  }

  .results-list {
    .result-item {
      margin-bottom: 24px;
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 40px;
    padding-bottom: 40px;
  }
}
</style>
