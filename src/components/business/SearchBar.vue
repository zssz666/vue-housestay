<template>
  <div class="search-bar" :class="{ 'search-bar--mini': mini, 'search-bar--expanded': !mini }">
    <!-- Destination -->
    <div class="search-item destination">
      <div class="label">地点</div>
      <el-autocomplete
        v-model="searchForm.destination"
        :fetch-suggestions="querySearch"
        placeholder="去哪里？"
        class="search-input"
        :trigger-on-focus="false"
      />
    </div>

    <div class="divider"></div>

    <!-- Date Range -->
    <div class="search-item dates">
      <div class="label">入住退房日期</div>
      <el-date-picker
        v-model="searchForm.dates"
        type="daterange"
        range-separator="-"
        start-placeholder="入住"
        end-placeholder="退房"
        format="MM/DD"
        value-format="YYYY-MM-DD"
        :prefix-icon="Calendar"
        class="date-picker-custom"
      />
    </div>

    <div class="divider"></div>

    <!-- Guests -->
    <div class="search-item guests">
      <div class="label">人数</div>
      <el-popover placement="bottom" :width="300" trigger="click">
        <template #reference>
          <div class="guest-trigger">
            {{ guestSummary }}
          </div>
        </template>
        <div class="guest-selector">
          <div class="guest-row">
            <span>成人</span>
            <el-input-number v-model="searchForm.adults" :min="1" :max="16" size="small" />
          </div>
          <div class="guest-row">
            <span>儿童</span>
            <el-input-number v-model="searchForm.children" :min="0" :max="5" size="small" />
          </div>
        </div>
      </el-popover>
    </div>

    <!-- Search Button -->
    <button class="search-btn" @click="handleSearch">
      <el-icon :size="18" color="white"><Search /></el-icon>
      <span v-if="!mini" class="search-text">搜索</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Search, Calendar } from '@element-plus/icons-vue';
import { useHomestayStore } from '@/stores/homestay';

const props = defineProps<{
  mini?: boolean;
}>();

const router = useRouter();
const homestayStore = useHomestayStore();

const searchForm = ref({
  destination: '',
  dates: [] as unknown as [string, string],
  adults: 1,
  children: 0
});

const guestSummary = computed(() => {
  const total = searchForm.value.adults + searchForm.value.children;
  return `${total} 位房客`;
});

const querySearch = (_queryString: string, cb: any) => {
  const results = [
    { value: '成都', cityCode: 'chengdu' },
    { value: '大理', cityCode: 'dali' },
    { value: '杭州', cityCode: 'hangzhou' },
    { value: '厦门', cityCode: 'xiamen' },
    { value: '西安', cityCode: 'xian' },
  ];
  cb(results);
};

const handleSearch = () => {
  // Update store
  homestayStore.updateSearchParams({
    keyword: searchForm.value.destination,
    guestCount: searchForm.value.adults + searchForm.value.children,
    // dates would need conversion to Date objects if store expects Date[], but here we used string in component
  });
  
  router.push({
    path: '/search',
    query: {
      q: searchForm.value.destination,
      guests: searchForm.value.adults + searchForm.value.children
    }
  });
};
</script>

<style scoped lang="scss">
.search-bar {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #ddd;
  border-radius: 32px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: all 0.2s ease;
  max-width: 850px;
  margin: 0 auto;
  position: relative;

  &--expanded {
    height: 66px;
    padding: 0 10px;
    
    .search-item {
      padding: 14px 24px;
      cursor: pointer;
      border-radius: 32px;
      &:hover { background-color: #f7f7f7; }
      
      .label {
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.04em;
        margin-bottom: 2px;
      }
    }
  }

  &--mini {
    height: 48px;
    padding: 0 8px;
    transform: scale(0.8);
    transform-origin: right center;
    
    .search-item {
      padding: 0 12px;
      .label { display: none; }
    }
  }

  .divider {
    width: 1px;
    height: 32px;
    background-color: #ddd;
  }

  .search-input {
    :deep(.el-input__wrapper) {
      box-shadow: none !important;
      padding: 0;
      background: transparent;
    }
    :deep(.el-input__inner) {
      font-weight: 600;
      color: #222;
      &::placeholder { color: #717171; font-weight: 400; }
    }
  }

  .guest-trigger {
    font-size: 14px;
    color: #717171;
    min-width: 80px;
  }

  .search-btn {
    background-color: var(--color-primary);
    border: none;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-left: auto;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.05);
      background-color: #FF385C;
    }

    .search-text {
      display: none; // Icon only for now to match Airbnb style mostly
    }
  }
}

.guest-selector {
  padding: 10px;
  .guest-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    &:last-child { margin-bottom: 0; }
  }
}

:deep(.el-date-editor.date-picker-custom) {
  width: 220px;
  .el-input__wrapper { box-shadow: none; padding: 0; background: transparent; }
  .el-range-separator { display: none; }
}
</style>
