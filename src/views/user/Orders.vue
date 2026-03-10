<template>
  <div class="orders-page">
    <el-tabs v-model="activeTab" class="order-tabs" @tab-click="handleTabClick">
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane label="待支付" name="pending_payment">
        <template #label>
          待支付 <el-badge is-dot class="tab-badge" v-if="hasPendingPayment" />
        </template>
      </el-tab-pane>
      <el-tab-pane label="待入住" name="upcoming" />
      <el-tab-pane label="入住中" name="checkin" />
      <el-tab-pane label="待评价" name="review" />
      <el-tab-pane label="已完成" name="completed" />
      <el-tab-pane label="已取消" name="cancelled" />
    </el-tabs>

    <div class="order-list" v-loading="loading">
      <div v-if="filteredOrders.length === 0" class="empty-state">
        <el-empty description="暂无相关订单" />
      </div>
      
      <div v-for="order in filteredOrders" :key="order.orderId" class="order-card">
        <div class="card-header">
          <span class="order-no">订单号：{{ order.orderNo }}</span>
          <el-tag :type="getStatusType(order.status)">{{ getStatusText(order.status) }}</el-tag>
        </div>
        
        <div class="card-body" @click="goToDetail(order.homestayId)">
          <el-image :src="order.homestayInfo.images[0]" fit="cover" class="homestay-img" />
          <div class="info-section">
            <h3 class="title">{{ order.homestayInfo.title }}</h3>
            <div class="date-range">
              {{ order.checkInDate }} 至 {{ order.checkOutDate }}
              <span class="nights">({{ getNights(order.checkInDate, order.checkOutDate) }}晚)</span>
            </div>
            <div class="host-info">房东：Verified Host</div>
          </div>
          <div class="price-section">
            <span class="currency">¥</span>
            <span class="amount">{{ order.totalAmount }}</span>
          </div>
        </div>

        <div class="card-footer">
          <!-- Pending Payment -->
          <template v-if="order.status === 0">
            <el-button @click="handleCancel(order)">取消订单</el-button>
            <el-button type="danger" @click="handlePay(order)">立即支付</el-button>
          </template>

          <!-- Upcoming (Confirmed) -->
          <template v-else-if="order.status === 2">
            <el-button @click="handleContactHost(order)">联系房东</el-button>
            <el-button @click="handleRefund(order)">申请退款</el-button>
          </template>

          <!-- Checked In -->
          <template v-else-if="order.status === 3">
            <el-button @click="handleInvoice(order)">申请开票</el-button>
            <el-button type="primary" plain @click="handleCheckOut(order)">确认退房</el-button>
          </template>

          <!-- Completed -->
          <template v-else-if="order.status === 4">
            <el-button @click="router.push(`/homestay/${order.homestayId}`)">再次预订</el-button>
            <el-button type="primary" v-if="!isReviewed(order.orderId)" @click="handleReview(order)">去评价</el-button>
            <el-button v-else disabled>已评价</el-button>
          </template>

          <!-- Cancelled -->
          <template v-else-if="order.status === 5">
            <el-button type="danger" link @click="handleDelete(order)">删除记录</el-button>
          </template>
        </div>
      </div>
    </div>

    <!-- Cancel Dialog -->
    <el-dialog v-model="cancelDialogVisible" title="取消订单" width="400px">
      <div class="cancel-reason">
        <p>请选择取消原因：</p>
        <el-radio-group v-model="cancelReason">
          <el-radio label="行程变更">行程变更</el-radio>
          <el-radio label="找到更好的房源">找到更好的房源</el-radio>
          <el-radio label="不想去了">不想去了</el-radio>
          <el-radio label="其他原因">其他原因</el-radio>
        </el-radio-group>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelDialogVisible = false">暂不取消</el-button>
          <el-button type="primary" @click="confirmCancel">确认取消</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Refund Dialog -->
    <el-dialog v-model="refundDialogVisible" title="申请退款" width="500px">
      <el-form label-position="top">
        <el-form-item label="退款原因">
          <el-select v-model="refundReason" placeholder="请选择退款原因" style="width: 100%">
            <el-option label="行程取消" value="行程取消" />
            <el-option label="房源与描述不符" value="房源与描述不符" />
            <el-option label="房东协商一致" value="房东协商一致" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="补充说明">
          <el-input v-model="refundDesc" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="上传凭证">
          <el-upload
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :limit="3"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="refundDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmRefund">提交申请</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { orders as mockOrders, reviews as mockReviews } from '@/mock/data';
import type { Order } from '@/types';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';

const router = useRouter();
const activeTab = ref('all');
const loading = ref(false);
const orderList = ref<Order[]>([]);

// Dialogs
const cancelDialogVisible = ref(false);
const cancelReason = ref('');
const currentOrder = ref<Order | null>(null);

const refundDialogVisible = ref(false);
const refundReason = ref('');
const refundDesc = ref('');

// Fetch orders
onMounted(() => {
  loading.value = true;
  // Simulate API fetch
  setTimeout(() => {
    orderList.value = JSON.parse(JSON.stringify(mockOrders)); // Deep copy to allow modification
    loading.value = false;
  }, 500);
});

const hasPendingPayment = computed(() => {
  return orderList.value.some(o => o.status === 0);
});

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') return orderList.value;
  
  return orderList.value.filter(order => {
    switch (activeTab.value) {
      case 'pending_payment': return order.status === 0;
      case 'upcoming': return order.status === 2 || order.status === 1; // Paid or Confirmed
      case 'checkin': return order.status === 3;
      case 'completed': return order.status === 4;
      case 'cancelled': return order.status === 5;
      case 'review': return order.status === 4 && !isReviewed(order.orderId);
      default: return true;
    }
  });
});

const isReviewed = (orderId: number) => {
  return mockReviews.some(r => r.orderId === orderId);
};

const getStatusText = (status: number) => {
  const map: Record<number, string> = {
    0: '待支付',
    1: '待确认',
    2: '待入住',
    3: '入住中',
    4: '已完成',
    5: '已取消'
  };
  return map[status] || '未知状态';
};

const getStatusType = (status: number): 'success' | 'warning' | 'info' | 'primary' | 'danger' => {
  const map: Record<number, 'success' | 'warning' | 'info' | 'primary' | 'danger'> = {
    0: 'danger',
    1: 'warning',
    2: 'warning',
    3: 'primary',
    4: 'success',
    5: 'info'
  };
  return map[status] || 'info';
};

const getNights = (start: string, end: string) => {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return Math.ceil((e - s) / (1000 * 3600 * 24));
};

// Actions
const handleTabClick = () => {
  // Tab switch logic if needed
};

const goToDetail = (homestayId: number) => {
  router.push(`/homestay/${homestayId}`);
};

const handlePay = (order: Order) => {
  // Simulate pay
  ElMessage.success('跳转支付...');
  setTimeout(() => {
    order.status = 2; // Paid -> Confirmed
    ElMessage.success('支付成功');
  }, 1000);
};

const handleCancel = (order: Order) => {
  currentOrder.value = order;
  cancelReason.value = '';
  cancelDialogVisible.value = true;
};

const confirmCancel = () => {
  if (!currentOrder.value || !cancelReason.value) {
    ElMessage.warning('请选择取消原因');
    return;
  }
  
  // Call API
  currentOrder.value.status = 5;
  currentOrder.value.cancelReason = cancelReason.value;
  cancelDialogVisible.value = false;
  ElMessage.success('订单已取消');
};

const handleRefund = (order: Order) => {
  currentOrder.value = order;
  refundReason.value = '';
  refundDesc.value = '';
  refundDialogVisible.value = true;
};

const confirmRefund = () => {
  if (!refundReason.value) {
    ElMessage.warning('请选择退款原因');
    return;
  }
  // Call API
  refundDialogVisible.value = false;
  ElMessage.success('退款申请已提交，等待审核');
};

const handleContactHost = (order: Order) => {
  ElMessage.info(`正在联系房东：${order.contactPhone}`);
};

const handleInvoice = (order: Order) => {
  router.push({ path: '/user/invoice', query: { orderId: order.orderId } });
};

const handleCheckOut = (order: Order) => {
  ElMessageBox.confirm('确认已办理退房手续？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    order.status = 4; // Completed
    ElMessage.success('退房成功');
  });
};

const handleReview = (order: Order) => {
  router.push({ path: '/review', query: { orderId: order.orderId } });
};

const handleDelete = (order: Order) => {
  ElMessageBox.confirm('确定删除该订单记录吗？', '提示', {
    type: 'warning'
  }).then(() => {
    const index = orderList.value.findIndex(o => o.orderId === order.orderId);
    if (index > -1) {
      orderList.value.splice(index, 1);
      ElMessage.success('删除成功');
    }
  });
};
</script>

<style scoped lang="scss">
.orders-page {
  background: white;
  border-radius: 12px;
  padding: 24px;
  min-height: 500px;
}

.order-card {
  border: 1px solid #eee;
  border-radius: 12px;
  margin-bottom: 24px;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    border-color: #ddd;
  }

  .card-header {
    padding: 12px 24px;
    background: #fcfcfc;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 12px 12px 0 0;

    .order-no {
      font-size: 13px;
      color: #717171;
    }
  }

  .card-body {
    padding: 24px;
    display: flex;
    gap: 24px;
    cursor: pointer;

    .homestay-img {
      width: 120px;
      height: 90px;
      border-radius: 8px;
    }

    .info-section {
      flex: 1;
      .title {
        font-size: 16px;
        margin: 0 0 8px;
        font-weight: 600;
      }
      .date-range {
        color: #484848;
        font-size: 14px;
        margin-bottom: 8px;
        .nights { color: #717171; margin-left: 8px; }
      }
      .host-info {
        font-size: 13px;
        color: #717171;
      }
    }

    .price-section {
      display: flex;
      align-items: center;
      font-size: 20px;
      font-weight: 700;
      color: #222;
      .currency { font-size: 14px; margin-right: 2px; }
    }
  }

  .card-footer {
    padding: 12px 24px;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

.cancel-reason {
  display: flex;
  flex-direction: column;
  gap: 12px;
  .el-radio-group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

.tab-badge {
  margin-top: -8px;
  margin-left: 4px;
}
</style>
