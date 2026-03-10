<template>
  <div class="orders-kanban">
    <div class="kanban-header">
      <h2>订单管理</h2>
      <el-input placeholder="搜索订单号/房客姓名" prefix-icon="el-icon-search" style="width: 300px" />
    </div>

    <div class="kanban-board">
      <div v-for="status in columns" :key="status.key" class="kanban-column">
        <div class="column-header" :style="{ borderTopColor: status.color }">
          {{ status.label }} <span class="count">({{ getOrderCount(status.key) }})</span>
        </div>
        
        <div class="column-body">
          <div v-for="order in getOrders(status.key)" :key="order.id" class="order-card" draggable="true" @dragstart="dragStart($event, order)">
            <div class="card-top">
              <el-avatar :size="32" :src="order.avatar" />
              <div class="guest-info">
                <div class="name">{{ order.guestName }}</div>
                <div class="homestay">{{ order.homestayTitle }}</div>
              </div>
            </div>
            
            <div class="card-mid">
              <div class="date"><el-icon><Calendar /></el-icon> {{ order.checkIn }} - {{ order.checkOut }}</div>
              <div class="price">¥{{ order.amount }}</div>
            </div>

            <div class="card-actions">
              <template v-if="status.key === 'pending'">
                <el-button type="success" size="small" @click="confirmOrder(order)">接单</el-button>
                <el-button type="danger" size="small" @click="rejectOrder(order)">拒绝</el-button>
              </template>
              <template v-else-if="status.key === 'upcoming'">
                <el-button type="primary" size="small" @click="sendGuide(order)">发指引</el-button>
                <el-button size="small" @click="contactGuest(order)">联系</el-button>
              </template>
              <template v-else-if="status.key === 'staying'">
                <el-button type="warning" size="small" @click="markCheckOut(order)">标记退房</el-button>
              </template>
              <template v-else-if="status.key === 'checkout'">
                <el-button type="primary" size="small" @click="goToCheck(order)">去验房</el-button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Calendar } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();

const columns = [
  { key: 'pending', label: '待确认', color: '#faad14' },
  { key: 'upcoming', label: '待入住', color: '#1890ff' },
  { key: 'staying', label: '入住中', color: '#52c41a' },
  { key: 'checkout', label: '待退房/验房', color: '#f5222d' }
];

// Mock Orders
const orders = ref([
  { id: 1, status: 'pending', guestName: '张三', avatar: 'https://i.pravatar.cc/150?u=1', homestayTitle: '海景大床房', checkIn: '10-01', checkOut: '10-03', amount: 1280 },
  { id: 2, status: 'upcoming', guestName: '李四', avatar: 'https://i.pravatar.cc/150?u=2', homestayTitle: '山景套房', checkIn: '10-05', checkOut: '10-07', amount: 980 },
  { id: 3, status: 'staying', guestName: '王五', avatar: 'https://i.pravatar.cc/150?u=3', homestayTitle: '城市公寓', checkIn: '09-28', checkOut: '10-02', amount: 1560 },
  { id: 4, status: 'checkout', guestName: '赵六', avatar: 'https://i.pravatar.cc/150?u=4', homestayTitle: '树屋', checkIn: '09-25', checkOut: '09-28', amount: 2200 },
]);

const getOrders = (status: string) => orders.value.filter(o => o.status === status);
const getOrderCount = (status: string) => getOrders(status).length;

const dragStart = (event: DragEvent, order: any) => {
  event.dataTransfer?.setData('orderId', order.id.toString());
};

const confirmOrder = (order: any) => {
  order.status = 'upcoming';
  ElMessage.success('已接单');
};

const rejectOrder = (_order: any) => {
  ElMessage.info('已拒绝订单');
  // Remove or update status
};

const sendGuide = (_order: any) => {
  ElMessage.success('入住指引已发送');
};

const contactGuest = (_order: any) => {
  ElMessage.info('正在拨打客人电话...');
};

const markCheckOut = (order: any) => {
  order.status = 'checkout';
  ElMessage.success('已标记为待退房');
};

const goToCheck = (order: any) => {
  router.push(`/host/checkout/${order.id}`);
};
</script>

<style scoped lang="scss">
.orders-kanban {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  padding: 24px;
  
  .kanban-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;
    h2 { margin: 0; font-size: 20px; }
  }
  
  .kanban-board {
    display: flex;
    gap: 24px;
    flex: 1;
    overflow-x: auto;
    
    .kanban-column {
      flex: 1;
      min-width: 280px;
      background: #f5f5f5;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      
      .column-header {
        padding: 12px 16px;
        background: white;
        border-top: 4px solid transparent;
        font-weight: 600;
        border-radius: 4px 4px 0 0;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        display: flex;
        justify-content: space-between;
        
        .count { color: #999; font-weight: 400; }
      }
      
      .column-body {
        padding: 12px;
        flex: 1;
        overflow-y: auto;
        
        .order-card {
          background: white;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 12px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          cursor: grab;
          transition: transform 0.2s;
          
          &:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
          
          .card-top {
            display: flex;
            gap: 12px;
            margin-bottom: 12px;
            
            .guest-info {
              .name { font-weight: 600; font-size: 14px; }
              .homestay { font-size: 12px; color: #666; }
            }
          }
          
          .card-mid {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #666;
            margin-bottom: 12px;
            
            .price { font-weight: 600; color: #333; }
          }
          
          .card-actions {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
          }
        }
      }
    }
  }
}
</style>
