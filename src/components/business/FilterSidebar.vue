<template>
  <div class="filter-sidebar">
    <div class="filter-section">
      <h3 class="filter-title">价格范围</h3>
      <div class="price-range">
        <el-slider 
          v-model="priceRange" 
          range 
          :min="100" 
          :max="5000" 
          :step="100"
          @change="handleFilterChange"
        />
        <div class="price-inputs">
          <span>¥{{ priceRange[0] }}</span>
          <span>-</span>
          <span>¥{{ priceRange[1] }}</span>
        </div>
      </div>
    </div>

    <div class="filter-divider"></div>

    <div class="filter-section">
      <h3 class="filter-title">房源类型</h3>
      <el-checkbox-group v-model="roomTypes" @change="handleFilterChange">
        <div class="checkbox-item" v-for="type in roomTypeOptions" :key="type.value">
          <el-checkbox :value="type.value">{{ type.label }}</el-checkbox>
          <span class="count">({{ type.count }})</span>
        </div>
      </el-checkbox-group>
    </div>

    <div class="filter-divider"></div>

    <div class="filter-section">
      <h3 class="filter-title">设施服务</h3>
      <div class="facilities-tags">
        <div 
          v-for="fac in facilityOptions" 
          :key="fac" 
          class="facility-tag"
          :class="{ active: selectedFacilities.includes(fac) }"
          @click="toggleFacility(fac)"
        >
          {{ fac }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits(['filter-change']);

const priceRange = ref([200, 1500]);
const roomTypes = ref([]);
const selectedFacilities = ref<string[]>([]);

const roomTypeOptions = [
  { label: '整套房源', value: 'entire', count: 120 },
  { label: '独立房间', value: 'private', count: 45 },
  { label: '合住房间', value: 'shared', count: 12 },
];

const facilityOptions = ['wifi', 'ac', 'washer', 'kitchen', 'parking', 'tv', 'pool', 'gym'];

const handleFilterChange = () => {
  emit('filter-change', {
    priceRange: priceRange.value,
    roomTypes: roomTypes.value,
    facilities: selectedFacilities.value
  });
};

const toggleFacility = (fac: string) => {
  const index = selectedFacilities.value.indexOf(fac);
  if (index > -1) {
    selectedFacilities.value.splice(index, 1);
  } else {
    selectedFacilities.value.push(fac);
  }
  handleFilterChange();
};
</script>

<style scoped lang="scss">
.filter-sidebar {
  padding: 24px 0;
  width: 100%;

  .filter-section {
    margin-bottom: 24px;
    
    .filter-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #222;
    }
  }

  .filter-divider {
    height: 1px;
    background-color: #eee;
    margin: 24px 0;
  }

  .price-range {
    padding: 0 12px;
    .price-inputs {
      display: flex;
      justify-content: space-between;
      margin-top: 12px;
      font-size: 14px;
      color: #717171;
    }
  }

  .checkbox-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .count {
      font-size: 12px;
      color: #717171;
    }
  }

  .facilities-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .facility-tag {
      padding: 6px 12px;
      border: 1px solid #ddd;
      border-radius: 20px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
      color: #717171;

      &:hover {
        border-color: #222;
      }

      &.active {
        background-color: var(--color-primary);
        color: white;
        border-color: var(--color-primary);
      }
    }
  }
}
</style>
