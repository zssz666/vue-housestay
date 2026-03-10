<template>
  <div class="dashboard-page">
    <el-row :gutter="24" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="card-content">
            <div class="title">今日入住</div>
            <div class="value">
              8
              <span class="trend up"><el-icon><CaretTop /></el-icon> 12%</span>
            </div>
            <div class="footer">较昨日 +1</div>
          </div>
          <el-icon class="icon-bg" :size="48" color="#e6f7ff"><House /></el-icon>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="card-content">
            <div class="title">今日退房</div>
            <div class="value">5</div>
            <div class="footer">待查房 2</div>
          </div>
          <el-icon class="icon-bg" :size="48" color="#fff1f0"><Bell /></el-icon>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="card-content">
            <div class="title">本月营收</div>
            <div class="value">¥24,800</div>
            <div class="footer">完成度 82%</div>
          </div>
          <el-icon class="icon-bg" :size="48" color="#f6ffed"><Wallet /></el-icon>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="card-content">
            <div class="title">待处理订单</div>
            <div class="value danger">3</div>
            <div class="footer">需尽快确认</div>
          </div>
          <el-icon class="icon-bg" :size="48" color="#fff7e6"><List /></el-icon>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="24" class="charts-section">
      <el-col :span="16">
        <el-card header="近30天营收趋势">
          <v-chart class="chart-line" :option="lineOption" autoresize />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card header="房源收入占比">
          <v-chart class="chart-pie" :option="pieOption" autoresize />
        </el-card>
      </el-col>
    </el-row>

    <el-card header="待办事项" class="todo-list">
      <el-timeline>
        <el-timeline-item timestamp="10:30" placement="top" type="danger">
          <el-card>
            <h4>新订单待确认</h4>
            <p>客人张三预订了【海景大床房】，入住日期 10-01 至 10-03</p>
            <el-button type="primary" link @click="router.push('/host/orders')">去处理</el-button>
          </el-card>
        </el-timeline-item>
        <el-timeline-item timestamp="12:00" placement="top" type="warning">
          <el-card>
            <h4>退房验房提醒</h4>
            <p>房间【山景套房】客人李四预计今日12:00退房</p>
            <el-button type="primary" link @click="router.push('/host/orders')">查看详情</el-button>
          </el-card>
        </el-timeline-item>
        <el-timeline-item timestamp="14:00" placement="top" type="primary">
          <el-card>
            <h4>入住提醒</h4>
            <p>客人王五预计今日14:00入住【亲子房】，请发送入住指引</p>
            <el-button type="primary" link>发送指引</el-button>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { House, Bell, Wallet, List, CaretTop } from '@element-plus/icons-vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, PieChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components';

use([CanvasRenderer, LineChart, PieChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent]);

const router = useRouter();

const lineOption = ref({
  tooltip: { trigger: 'axis' },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['1日', '5日', '10日', '15日', '20日', '25日', '30日']
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: '营收',
      type: 'line',
      stack: 'Total',
      smooth: true,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: '#1890ff' }, { offset: 1, color: '#fff' }]
        }
      },
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      itemStyle: { color: '#1890ff' }
    }
  ]
});

const pieOption = ref({
  tooltip: { trigger: 'item' },
  legend: { bottom: '0%' },
  series: [
    {
      name: '收入来源',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: { label: { show: true, fontSize: '20', fontWeight: 'bold' } },
      data: [
        { value: 1048, name: '海景房' },
        { value: 735, name: '山景房' },
        { value: 580, name: '城市公寓' },
        { value: 484, name: '树屋' },
        { value: 300, name: '其他' }
      ]
    }
  ]
});
</script>

<style scoped lang="scss">
.dashboard-page {
  .stat-cards {
    margin-bottom: 24px;
    
    .stat-card {
      position: relative;
      overflow: hidden;
      
      .card-content {
        position: relative;
        z-index: 2;
        .title { color: rgba(0,0,0,0.45); font-size: 14px; margin-bottom: 8px; }
        .value { 
          font-size: 30px; 
          font-weight: 700; 
          color: rgba(0,0,0,0.85); 
          margin-bottom: 16px;
          
          &.danger { color: #cf1322; animation: pulse 2s infinite; }
          
          .trend {
            font-size: 14px;
            margin-left: 8px;
            &.up { color: #52c41a; }
            &.down { color: #cf1322; }
          }
        }
        .footer { font-size: 12px; color: rgba(0,0,0,0.45); border-top: 1px solid #f0f0f0; padding-top: 8px; }
      }
      
      .icon-bg {
        position: absolute;
        right: 16px;
        top: 16px;
        opacity: 0.8;
        z-index: 1;
      }
    }
  }

  .charts-section {
    margin-bottom: 24px;
    .chart-line { height: 350px; }
    .chart-pie { height: 350px; }
  }

  .todo-list {
    h4 { margin: 0 0 8px; font-size: 16px; }
    p { color: rgba(0,0,0,0.45); margin-bottom: 8px; }
  }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
</style>
