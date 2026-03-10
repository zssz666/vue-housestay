<template>
  <div class="invoice-page">
    <div class="header">
      <h2>发票管理</h2>
      <p>仅支持已完成订单申请发票</p>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="申请开票" name="apply" />
      <el-tab-pane label="开票记录" name="history" />
    </el-tabs>

    <div v-if="activeTab === 'apply'" class="apply-section">
      <el-table :data="invoicableOrders" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column label="房源信息" width="280">
          <template #default="{ row }">
            <div class="order-info">
              <el-image :src="row.homestayInfo.images[0]" class="thumb" fit="cover" />
              <div>
                <div class="title">{{ row.homestayInfo.title }}</div>
                <div class="date">{{ row.checkInDate }} - {{ row.checkOutDate }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="实付金额" width="120">
          <template #default="{ row }">¥{{ row.totalAmount }}</template>
        </el-table-column>
        <el-table-column prop="orderNo" label="订单号" width="200" />
        <el-table-column label="状态" width="100">
          <el-tag type="success">可开票</el-tag>
        </el-table-column>
      </el-table>

      <div class="invoice-form" v-if="selectedOrders.length > 0">
        <h3>发票信息</h3>
        <el-form :model="form" ref="formRef" :rules="rules" label-width="100px">
          <el-form-item label="发票类型" prop="type">
            <el-radio-group v-model="form.type">
              <el-radio label="electronic">电子普通发票</el-radio>
              <el-radio label="paper">纸质专用发票</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="抬头类型">
            <el-radio-group v-model="form.isCompany">
              <el-radio :label="false">个人</el-radio>
              <el-radio :label="true">企业</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="发票抬头" prop="title">
            <el-input v-model="form.title" placeholder="个人姓名或企业名称" />
          </el-form-item>
          <el-form-item label="税号" prop="taxId" v-if="form.isCompany">
            <el-input v-model="form.taxId" placeholder="企业纳税人识别号" />
          </el-form-item>
          <el-form-item label="接收邮箱" prop="email">
            <el-input v-model="form.email" placeholder="用于接收电子发票" />
          </el-form-item>
          <el-form-item label="开票金额">
            <span class="amount">¥{{ totalAmount }}</span>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitInvoice" :loading="submitting">提交申请</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div v-else class="empty-select-tip">
        请勾选需要开票的订单
      </div>
    </div>

    <div v-else class="history-section">
      <el-empty description="暂无开票记录" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { orders } from '@/mock/data';
import type { Order } from '@/types';
import { ElMessage } from 'element-plus';

const activeTab = ref('apply');
const invoicableOrders = ref<Order[]>([]);
const selectedOrders = ref<Order[]>([]);
const submitting = ref(false);
const formRef = ref();

const form = reactive({
  type: 'electronic',
  title: '',
  taxId: '',
  email: '',
  isCompany: false // Simplified logic for demo
});

const rules = {
  title: [{ required: true, message: '请输入发票抬头', trigger: 'blur' }],
  email: [{ required: true, message: '请输入接收邮箱', trigger: 'blur' }, { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }]
};

const totalAmount = computed(() => {
  return selectedOrders.value.reduce((sum, order) => sum + order.totalAmount, 0);
});

const handleSelectionChange = (val: Order[]) => {
  selectedOrders.value = val;
};

const submitInvoice = async () => {
  if (!formRef.value) return;
  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      submitting.value = true;
      // Simulate API
      setTimeout(() => {
        submitting.value = false;
        ElMessage.success('开票申请已提交，请留意邮箱通知');
        // Reset
        selectedOrders.value = [];
        activeTab.value = 'history';
      }, 1500);
    }
  });
};

onMounted(() => {
  // Mock fetch: orders with status 4 (Completed)
  invoicableOrders.value = orders.filter(o => o.status === 4);
});
</script>

<style scoped lang="scss">
.invoice-page {
  padding: 24px;
  background: white;
  border-radius: 12px;
  min-height: 500px;
}

.header {
  margin-bottom: 24px;
  h2 { margin: 0 0 8px; font-size: 20px; }
  p { margin: 0; color: #717171; font-size: 14px; }
}

.order-info {
  display: flex;
  gap: 12px;
  align-items: center;
  .thumb { width: 60px; height: 40px; border-radius: 4px; }
  .title { font-size: 14px; font-weight: 500; margin-bottom: 4px; }
  .date { font-size: 12px; color: #717171; }
}

.invoice-form {
  margin-top: 32px;
  border-top: 1px solid #eee;
  padding-top: 24px;
  max-width: 600px;
  
  h3 { margin-bottom: 24px; font-size: 18px; }
  
  .amount {
    font-size: 24px;
    font-weight: 700;
    color: var(--color-primary);
  }
}

.empty-select-tip {
  margin-top: 40px;
  text-align: center;
  color: #717171;
  padding: 40px;
  background: #f9f9f9;
  border-radius: 8px;
}
</style>
