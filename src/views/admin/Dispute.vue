<template>
  <div class="dispute-page">
    <el-table :data="disputes" style="width: 100%">
      <el-table-column prop="orderId" label="订单号" width="180" />
      <el-table-column prop="guestName" label="客人" width="120" />
      <el-table-column prop="hostName" label="房东" width="120" />
      <el-table-column prop="amount" label="争议金额" width="120">
        <template #default="{ row }">¥{{ row.amount }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="openDetail(row)">仲裁</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-drawer v-model="drawerVisible" title="纠纷仲裁详情" size="600px">
      <div v-if="currentDispute" class="dispute-detail">
        <div class="info-cards">
          <el-card shadow="never" class="info-card">
            <template #header>客人主张</template>
            <p>{{ currentDispute.guestClaim }}</p>
            <div class="evidence">
              <el-image v-for="img in currentDispute.guestEvidence" :key="img" :src="img" style="width: 60px; height: 60px" />
            </div>
          </el-card>
          <el-card shadow="never" class="info-card">
            <template #header>房东主张</template>
            <p>{{ currentDispute.hostClaim }}</p>
            <div class="evidence">
              <el-image v-for="img in currentDispute.hostEvidence" :key="img" :src="img" style="width: 60px; height: 60px" />
            </div>
          </el-card>
        </div>

        <el-timeline style="margin-top: 30px">
          <el-timeline-item timestamp="2023-10-01" placement="top">订单创建</el-timeline-item>
          <el-timeline-item timestamp="2023-10-02" placement="top">客人入住</el-timeline-item>
          <el-timeline-item timestamp="2023-10-03" placement="top" color="#f56c6c">客人发起投诉：房间设施损坏</el-timeline-item>
          <el-timeline-item timestamp="2023-10-03" placement="top">房东拒绝退款</el-timeline-item>
          <el-timeline-item timestamp="2023-10-04" placement="top">申请平台介入</el-timeline-item>
        </el-timeline>

        <div class="verdict-form">
          <h3>裁决结果</h3>
          <el-form :model="verdictForm" label-position="top">
            <el-form-item label="责任判定">
              <el-radio-group v-model="verdictForm.liability">
                <el-radio label="guest">客人全责</el-radio>
                <el-radio label="host">房东全责</el-radio>
                <el-radio label="split">双方分责</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="退款给客人金额">
              <el-input-number v-model="verdictForm.refundAmount" :min="0" :max="currentDispute.amount" />
            </el-form-item>
            <el-form-item label="裁决理由">
              <el-input v-model="verdictForm.reason" type="textarea" :rows="3" />
            </el-form-item>
            <el-button type="danger" style="width: 100%" @click="submitVerdict">执行裁决 (不可撤销)</el-button>
          </el-form>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const drawerVisible = ref(false);
const currentDispute = ref<any>(null);

const disputes = ref([
  { 
    id: 1, 
    orderId: 'ORDER20231001', 
    guestName: '张三', 
    hostName: '李四', 
    amount: 500, 
    status: '待处理',
    guestClaim: '入住时发现空调坏了，要求退一半房费。',
    hostClaim: '入住前检查是好的，是客人弄坏的。',
    guestEvidence: ['https://via.placeholder.com/100'],
    hostEvidence: ['https://via.placeholder.com/100']
  },
]);

const verdictForm = reactive({
  liability: 'split',
  refundAmount: 0,
  reason: ''
});

const getStatusType = (status: string) => {
  return status === '待处理' ? 'warning' : 'success';
};

const openDetail = (row: any) => {
  currentDispute.value = row;
  verdictForm.refundAmount = row.amount / 2; // Default split
  drawerVisible.value = true;
};

const submitVerdict = () => {
  ElMessageBox.confirm('确定执行此裁决吗？操作不可撤销，款项将立即划拨。', '二次确认', {
    type: 'warning',
    confirmButtonText: '立即执行'
  }).then(() => {
    console.log('裁决执行日志:', {
      disputeId: currentDispute.value.id,
      verdict: verdictForm,
      operator: 'admin',
      time: new Date().toISOString()
    });
    ElMessage.success('裁决已执行，纠纷结案');
    drawerVisible.value = false;
    currentDispute.value.status = '已结案';
  });
};
</script>

<style scoped lang="scss">
.dispute-page {
  background: white;
  padding: 24px;
  border-radius: 4px;
  min-height: 500px;
}

.dispute-detail {
  padding: 0 20px;
  
  .info-cards {
    display: flex;
    gap: 20px;
    
    .info-card {
      flex: 1;
      .evidence { margin-top: 10px; display: flex; gap: 8px; }
    }
  }
  
  .verdict-form {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #eee;
    
    h3 { margin-bottom: 20px; }
  }
}
</style>
