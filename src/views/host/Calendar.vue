<template>
  <div class="calendar-page">
    <div class="header">
      <el-select v-model="currentMonth" placeholder="选择月份" size="large">
        <el-option label="2023年10月" value="2023-10" />
        <el-option label="2023年11月" value="2023-11" />
      </el-select>
      <el-button type="primary" @click="batchEdit">批量设置</el-button>
    </div>

    <el-calendar v-model="currentDate" class="host-calendar">
      <template #date-cell="{ data }">
        <div class="cell-content" :class="getStatusClass(data.day)" @click="handleDateClick(data)">
          <div class="day">{{ data.day.split('-').slice(2).join('') }}</div>
          <div class="price">¥{{ getPrice(data.day) }}</div>
          <div class="status-dot"></div>
        </div>
      </template>
    </el-calendar>

    <el-dialog v-model="editDialogVisible" title="房态设置" width="400px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="日期">
          <span>{{ editForm.date }}</span>
        </el-form-item>
        <el-form-item label="价格">
          <el-input v-model="editForm.price" type="number">
            <template #prefix>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="editForm.status">
            <el-radio label="available">可订</el-radio>
            <el-radio label="blocked">维护</el-radio>
            <el-radio label="booked" disabled>已订</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveDateSetting">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';

const currentDate = ref(new Date());
const currentMonth = ref('2023-10');
const editDialogVisible = ref(false);

const editForm = reactive({
  date: '',
  price: 0,
  status: 'available'
});

const getPrice = (day: string) => {
  // Mock logic
  const d = new Date(day).getDay();
  return d === 0 || d === 6 ? 580 : 380;
};

const getStatusClass = (_day: string) => {
  // Mock logic
  if (Math.random() > 0.8) return 'is-booked';
  if (Math.random() > 0.9) return 'is-blocked';
  return 'is-available';
};

const handleDateClick = (data: { day: string }) => {
  editForm.date = data.day;
  editForm.price = getPrice(data.day);
  editForm.status = getStatusClass(data.day).replace('is-', '');
  editDialogVisible.value = true;
};

const saveDateSetting = () => {
  editDialogVisible.value = false;
  ElMessage.success('设置已保存');
};

const batchEdit = () => {
  ElMessage.info('批量设置功能待开发');
};
</script>

<style scoped lang="scss">
.calendar-page {
  background: white;
  padding: 24px;
  border-radius: 2px;
  
  .header {
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
  }
  
  .host-calendar {
    :deep(.el-calendar-table .el-calendar-day) {
      padding: 0;
      height: 100px;
    }
  }

  .cell-content {
    height: 100%;
    padding: 8px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: background 0.2s;
    
    &:hover { background-color: #f0f7ff; }
    
    &.is-booked { background-color: #fff1f0; border-left: 4px solid #ff4d4f; }
    &.is-blocked { background-color: #f5f5f5; color: #999; }
    &.is-available { border-left: 4px solid #52c41a; }
    
    .price { font-weight: bold; color: #1890ff; }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; align-self: flex-end; }
  }
}
</style>
