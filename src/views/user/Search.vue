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
import { homestayApi } from '@/api/modules/homestay';
import { debounce } from 'lodash';
import type { Homestay } from '@/types';

const route = useRoute();
const loading = ref(false);
const viewType = ref('list');
const sortBy = ref('default');
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const homestayList = ref<Homestay[]>([]);

// 搜索参数
const searchParams = ref({
  keyword: '',
  cityCode: '',
  startDate: '',
  endDate: '',
  guestCount: 0,
  minPrice: 0,
  maxPrice: 10000,
  facilities: [] as string[]
});

// 加载房源数据
const loadHomestays = async () => {
  loading.value = true;
  try {
    const res = await homestayApi.search({
      keyword: searchParams.value.keyword,
      cityCode: searchParams.value.cityCode,
      startDate: searchParams.value.startDate,
      endDate: searchParams.value.endDate,
      minPrice: searchParams.value.minPrice,
      maxPrice: searchParams.value.maxPrice,
      facilities: searchParams.value.facilities.length > 0 ? searchParams.value.facilities : undefined,
      page: currentPage.value,
      pageSize: pageSize.value
    });
    homestayList.value = res.list;
    total.value = res.total;
  } catch (error) {
    console.error('搜索房源失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleFilterChange = debounce((filters: any) => {
  searchParams.value.minPrice = filters.priceRange[0];
  searchParams.value.maxPrice = filters.priceRange[1];
  searchParams.value.facilities = filters.facilities;
  currentPage.value = 1;
  loadHomestays();
}, 500);

// Sync with URL query
watch(() => route.query, (newQuery) => {
  searchParams.value.keyword = newQuery.q as string || '';
  searchParams.value.guestCount = parseInt(newQuery.guests as string) || 0;
  loadHomestays();
}, { immediate: true });

onMounted(() => {
  // Initial fetch - handled by watch
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
