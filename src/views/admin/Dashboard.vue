<template>
  <div class="admin-dashboard">
    <!-- 页面头部：标题 + 自动刷新 -->
    <div class="dashboard-header">
      <h2>数据概览</h2>
      <div class="header-actions">
        <span class="refresh-label">自动刷新</span>
        <el-switch v-model="autoRefresh" @change="handleRefreshToggle" />
        <el-button v-if="autoRefresh" type="primary" link size="small">
          {{ refreshCountdown }}s 后刷新
        </el-button>
        <el-button type="primary" :icon="Refresh" @click="refreshData" :loading="loading">
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 骨架屏加载状态 -->
    <div v-if="loading" class="skeleton-wrap">
      <el-row :gutter="20">
        <el-col :span="6" v-for="i in 4" :key="i"><el-skeleton :rows="3" animated /></el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="16" v-for="i in 1" :key="i"><el-skeleton :rows="6" animated /></el-col>
        <el-col :span="8" v-for="i in 1" :key="i"><el-skeleton :rows="6" animated /></el-col>
      </el-row>
    </div>

    <template v-else>
      <!-- 顶部数据卡片 -->
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover" class="data-card blue" @click="router.push('/admin/users')">
            <div class="card-title">平台总用户数</div>
            <div class="card-value">{{ stats.users.toLocaleString() }}</div>
            <div class="card-footer">
              <span class="trend-icon"><ArrowUp /></span>
              较昨日 <span class="up">+{{ stats.usersDiff }}</span>
            </div>
            <el-icon class="bg-icon"><User /></el-icon>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="data-card green" @click="showTodayOrders">
            <div class="card-title">今日 GMV</div>
            <div class="card-value">¥{{ stats.gmv.toLocaleString() }}</div>
            <div class="card-footer">
              <span class="trend-icon"><ArrowUp /></span>
              较昨日 <span class="up">+{{ stats.gmvRate }}</span>
            </div>
            <el-icon class="bg-icon"><Money /></el-icon>
          </el-card>
        </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card purple" @click="router.push('/admin/orders?date=today')">
          <div class="card-title">今日订单数</div>
          <div class="card-value">{{ stats.orders }}</div>
          <div class="card-footer">
            <span :class="stats.ordersTrend < 0 ? 'trend-icon-down' : 'trend-icon'">
              {{ stats.ordersTrend < 0 ? '↓' : '↑' }}
            </span>
            较昨日
            <span :class="stats.ordersTrend < 0 ? 'down' : 'up'">
              {{ stats.ordersTrend < 0 ? stats.ordersRate : '+' + stats.ordersRate }}
            </span>
          </div>
          <el-icon class="bg-icon"><Tickets /></el-icon>
        </el-card>
      </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="data-card orange" @click="router.push('/admin/audit')">
            <div class="card-title">待审核事项</div>
            <div class="card-value">{{ stats.pendingAudit }}</div>
            <div class="card-footer">
              <span class="pulse-dot" />
              需尽快处理
            </div>
            <el-icon class="bg-icon"><Stamp /></el-icon>
          </el-card>
        </el-col>
      </el-row>

      <!-- 中间图表区 -->
      <el-row :gutter="20" class="charts-row">
        <!-- 交易趋势图 -->
        <el-col :span="16">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>近7日交易趋势</span>
                <div class="header-right">
                  <el-button-group size="small">
                    <el-button :type="timeRange === '7d' ? 'primary' : 'default'" @click="setTimeRange('7d')">近7天</el-button>
                    <el-button :type="timeRange === '30d' ? 'primary' : 'default'" @click="setTimeRange('30d')">近30天</el-button>
                    <el-button :type="timeRange === 'month' ? 'primary' : 'default'" @click="setTimeRange('month')">本月</el-button>
                    <el-button @click="showDatePicker = true">自定义</el-button>
                  </el-button-group>
                  <el-button type="primary" link :icon="Download" @click="exportReport">导出报表</el-button>
                </div>
              </div>
            </template>
            <v-chart class="chart-line" :option="lineOption" autoresize />
          </el-card>
        </el-col>

        <!-- 用户分布图 -->
        <el-col :span="8">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>{{ pieTitle }}</span>
                <el-radio-group v-model="pieType" size="small" @change="switchPieType">
                  <el-radio-button value="age">年龄</el-radio-button>
                  <el-radio-button value="gender">性别</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <v-chart class="chart-pie" :option="pieOption" autoresize />
          </el-card>
        </el-col>
      </el-row>

      <!-- 底部热门城市 -->
      <el-card class="bottom-card">
        <template #header>
          <div class="card-header">
            <span>热门城市 TOP5</span>
            <el-button type="primary" link :icon="View" @click="router.push('/admin/cities')">
              查看全部城市
            </el-button>
          </div>
        </template>
        <el-table :data="cityData" stripe style="width: 100%" :header-cell-style="{ background: '#f5f7fa' }">
          <el-table-column prop="rank" label="排名" width="80" align="center">
            <template #default="{ row }">
              <span :class="row.rank <= 3 ? `rank rank-${row.rank}` : 'rank'">{{ row.rank }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="city" label="城市" />
          <el-table-column prop="listings" label="房源数" align="right">
            <template #default="{ row }">{{ row.listings.toLocaleString() }}</template>
          </el-table-column>
          <el-table-column prop="orders" label="订单数" align="right">
            <template #default="{ row }">{{ row.orders.toLocaleString() }}</template>
          </el-table-column>
          <el-table-column prop="share" label="占比" align="center">
            <template #default="{ row }">{{ row.share }}</template>
          </el-table-column>
          <el-table-column prop="trend" label="趋势" align="center">
            <template #default="{ row }">
              <span :class="row.trend > 0 ? 'trend-up' : 'trend-down'">
                {{ row.trend > 0 ? '↑' : '↓' }}{{ Math.abs(row.trend) }}%
              </span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </template>

    <!-- 今日GMV订单明细抽屉 -->
    <el-drawer v-model="drawerVisible" title="今日订单明细" size="500px" direction="rtl">
      <div class="drawer-summary">
        <el-statistic title="今日GMV" :value="stats.gmv" prefix="¥" />
        <el-statistic title="订单数" :value="stats.orders" />
      </div>
      <el-divider />
      <div class="drawer-list">
        <div v-for="item in todayOrders" :key="item.id" class="order-item">
          <div class="order-left">
            <span class="order-house">{{ item.house }}</span>
            <span class="order-user">{{ item.user }}</span>
          </div>
          <span class="order-amount">¥{{ item.amount.toLocaleString() }}</span>
        </div>
      </div>
    </el-drawer>

    <!-- 日期范围选择弹窗 -->
    <el-dialog v-model="showDatePicker" title="选择日期范围" width="360px">
      <el-date-picker
        v-model="customDateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        style="width: 100%"
      />
      <template #footer>
        <el-button @click="showDatePicker = false">取消</el-button>
        <el-button type="primary" @click="applyCustomRange">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  User, Money, Tickets, Stamp, ArrowUp, Refresh, Download, View
} from '@element-plus/icons-vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, PieChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';

use([CanvasRenderer, LineChart, PieChart, GridComponent, TooltipComponent, LegendComponent]);

const router = useRouter();
const loading = ref(true);
const autoRefresh = ref(false);
const refreshCountdown = ref(60);
let refreshTimer: ReturnType<typeof setInterval> | null = null;

// 统计数据
const stats = ref({
  users: 12458,
  usersDiff: 128,
  gmv: 84520,
  gmvRate: '5.2%',
  orders: 342,
  ordersRate: '2.1%',
  ordersTrend: -1,
  pendingAudit: 15
});

// 今日订单明细
const drawerVisible = ref(false);
const todayOrders = ref([
  { id: 1, house: '成都·海景阳光公寓', user: '用户 张三', amount: 458 },
  { id: 2, house: '大理·洱海日出民宿', user: '用户 李四', amount: 680 },
  { id: 3, house: '丽江·古城客栈', user: '用户 王五', amount: 320 },
  { id: 4, house: '杭州·西湖畔小筑', user: '用户 赵六', amount: 520 },
  { id: 5, house: '厦门·鼓浪屿民宿', user: '用户 陈七', amount: 390 }
]);

// 时间范围筛选
const timeRange = ref('7d');
const showDatePicker = ref(false);
const customDateRange = ref<[Date, Date] | null>(null);

// 饼图类型
const pieType = ref<'age' | 'gender'>('age');
const pieTitle = computed(() => pieType.value === 'age' ? '用户年龄分布' : '用户性别分布');

function setTimeRange(range: string) {
  timeRange.value = range;
  showDatePicker.value = false;
  refreshData();
}

function applyCustomRange() {
  if (customDateRange.value) {
    timeRange.value = 'custom';
    refreshData();
  }
  showDatePicker.value = false;
}

// 饼图数据
const ageData = [
  { value: 1048, name: '18-25岁' },
  { value: 735, name: '26-35岁' },
  { value: 580, name: '36-45岁' },
  { value: 484, name: '45岁以上' }
];

const genderData = [
  { value: 6200, name: '男性' },
  { value: 5800, name: '女性' },
  { value: 458, name: '未知' }
];

function switchPieType() {
  // 切换时饼图 option 会通过计算属性自动更新
}

// 折线图数据
const lineOption = computed(() => {
  let xData: string[], orders: number[], gmv: number[];

  if (timeRange.value === '7d') {
    xData = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    orders = [120, 132, 101, 134, 90, 230, 210];
    gmv = [22000, 18200, 19100, 23400, 29000, 33000, 31000];
  } else if (timeRange.value === '30d') {
    xData = Array.from({ length: 30 }, (_, i) => `${i + 1}日`);
    orders = Array.from({ length: 30 }, () => Math.floor(Math.random() * 200) + 80);
    gmv = orders.map(v => v * 210 + Math.floor(Math.random() * 2000));
  } else {
    const now = new Date();
    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    xData = Array.from({ length: days }, (_, i) => `${i + 1}日`);
    orders = Array.from({ length: days }, () => Math.floor(Math.random() * 200) + 80);
    gmv = orders.map(v => v * 210 + Math.floor(Math.random() * 2000));
  }

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,0,0,0.75)',
      borderColor: 'transparent',
      textStyle: { color: '#fff' }
    },
    legend: {
      data: ['订单数', 'GMV'],
      top: 0
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xData
    },
    yAxis: [
      { type: 'value', name: '订单数', axisLabel: { formatter: '{value}' } },
      { type: 'value', name: 'GMV', position: 'right', axisLabel: { formatter: (v: number) => `¥${(v / 1000).toFixed(0)}k` } }
    ],
    series: [
      {
        name: '订单数',
        type: 'line',
        smooth: true,
        itemStyle: { color: '#5470c6' },
        areaStyle: { color: 'rgba(84, 112, 198, 0.15)' },
        data: orders
      },
      {
        name: 'GMV',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        itemStyle: { color: '#91cc75' },
        data: gmv
      }
    ]
  };
});

const pieOption = computed(() => {
  const data = pieType.value === 'age' ? ageData : genderData;
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      backgroundColor: 'rgba(0,0,0,0.75)',
      borderColor: 'transparent',
      textStyle: { color: '#fff' }
    },
    legend: { top: '5%', left: 'center' },
    series: [
      {
        name: pieType.value === 'age' ? '年龄分布' : '性别分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: true, formatter: '{b}\n{d}%', fontSize: 11 },
        emphasis: {
          label: { show: true, fontSize: '18', fontWeight: 'bold' }
        },
        data
      }
    ]
  };
});

// 热门城市数据
const cityData = ref([
  { rank: 1, city: '成都', listings: 1234, orders: 5678, share: '23%', trend: 12 },
  { rank: 2, city: '大理', listings: 892, orders: 3456, share: '18%', trend: 8 },
  { rank: 3, city: '丽江', listings: 756, orders: 2890, share: '14%', trend: -3 },
  { rank: 4, city: '杭州', listings: 645, orders: 2340, share: '11%', trend: 5 },
  { rank: 5, city: '厦门', listings: 534, orders: 1890, share: '9%', trend: 15 }
]);

// 显示今日GMV抽屉
function showTodayOrders() {
  drawerVisible.value = true;
}

// 自动刷新
function handleRefreshToggle(val: boolean) {
  if (val) {
    refreshCountdown.value = 60;
    refreshTimer = setInterval(() => {
      refreshCountdown.value--;
      if (refreshCountdown.value <= 0) {
        refreshData();
        refreshCountdown.value = 60;
      }
    }, 1000);
  } else {
    if (refreshTimer) clearInterval(refreshTimer);
  }
}

function refreshData() {
  loading.value = true;
  ElMessage.success('数据已更新');
  setTimeout(() => {
    stats.value = { ...stats.value };
    loading.value = false;
  }, 800);
}

function exportReport() {
  ElMessage.success('报表导出中，请稍候...');
  setTimeout(() => ElMessage.success('报表导出成功'), 1500);
}

onMounted(() => {
  setTimeout(() => { loading.value = false; }, 600);
});

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
});
</script>

<style scoped lang="scss">
.admin-dashboard {
  padding: 20px;
  background: #f0f2f5;
  min-height: calc(100vh - 64px);

  .dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #303133;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;

      .refresh-label {
        font-size: 13px;
        color: #606266;
      }
    }
  }

  .skeleton-wrap {
    padding: 0 4px;
  }

  // 数据卡片
  .data-card {
    position: relative;
    overflow: hidden;
    height: 140px;
    margin-bottom: 20px;
    color: white;
    cursor: pointer;
    border: none;
    transition: transform 0.25s ease, box-shadow 0.25s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25) !important;
    }

    &.blue { background: linear-gradient(135deg, #36cfc9 0%, #13c2c2 100%); }
    &.green { background: linear-gradient(135deg, #73d13d 0%, #52c41a 100%); }
    &.purple { background: linear-gradient(135deg, #9254de 0%, #722ed1 100%); }
    &.orange { background: linear-gradient(135deg, #ffa940 0%, #fa8c16 100%); }

    .card-title {
      opacity: 0.85;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .card-value {
      font-size: 30px;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .card-footer {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      opacity: 0.9;

      .up { font-weight: bold; }
      .down { font-weight: bold; }
    }

    .trend-icon {
      display: inline-flex;
      align-items: center;
      font-size: 12px;
      font-weight: bold;
    }

    .trend-icon-down {
      display: inline-flex;
      align-items: center;
      font-size: 12px;
      font-weight: bold;
    }

    .pulse-dot {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: white;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.3); }
    }

    .bg-icon {
      position: absolute;
      right: 16px;
      bottom: 16px;
      font-size: 64px;
      opacity: 0.18;
      pointer-events: none;
    }
  }

  // 图表卡片
  .charts-row {
    margin-bottom: 20px;

    .chart-card {
      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;

        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
      }

      .chart-line { height: 350px; }
      .chart-pie { height: 350px; }
    }
  }

  // 底部卡片
  .bottom-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    // 排名样式
    .rank {
      display: inline-block;
      width: 22px;
      height: 22px;
      line-height: 22px;
      border-radius: 50%;
      background: #e4e7ed;
      color: #606266;
      font-size: 12px;
      font-weight: bold;
      text-align: center;

      &.rank-1 { background: #ffd700; color: #fff; }
      &.rank-2 { background: #c0c4cc; color: #fff; }
      &.rank-3 { background: #cd7f32; color: #fff; }
    }

    .trend-up { color: #52c41a; font-weight: bold; }
    .trend-down { color: #ff4d4f; font-weight: bold; }
  }

  // 抽屉
  .drawer-summary {
    display: flex;
    gap: 32px;
  }

  .drawer-list {
    .order-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      .order-left {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .order-house { font-weight: 500; color: #303133; }
        .order-user { font-size: 12px; color: #909399; }
      }

      .order-amount {
        font-size: 16px;
        font-weight: bold;
        color: #f56c6c;
      }
    }
  }
}
</style>
