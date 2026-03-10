<template>
  <div class="admin-dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="data-card blue">
          <div class="card-title">平台总用户数</div>
          <div class="card-value">12,458</div>
          <div class="card-footer">
            较昨日 <span class="up">+128</span>
          </div>
          <el-icon class="bg-icon"><User /></el-icon>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card green">
          <div class="card-title">今日 GMV</div>
          <div class="card-value">¥84,520</div>
          <div class="card-footer">
            较昨日 <span class="up">+5.2%</span>
          </div>
          <el-icon class="bg-icon"><Money /></el-icon>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card purple">
          <div class="card-title">今日订单数</div>
          <div class="card-value">342</div>
          <div class="card-footer">
            较昨日 <span class="down">-2.1%</span>
          </div>
          <el-icon class="bg-icon"><Tickets /></el-icon>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card orange">
          <div class="card-title">待审核事项</div>
          <div class="card-value">15</div>
          <div class="card-footer">
            需尽快处理
          </div>
          <el-icon class="bg-icon"><Stamp /></el-icon>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <el-col :span="16">
        <el-card header="近7日交易趋势">
          <v-chart class="chart-line" :option="lineOption" autoresize />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card header="用户年龄分布">
          <v-chart class="chart-pie" :option="pieOption" autoresize />
        </el-card>
      </el-col>
    </el-row>

    <el-card header="全国房源分布热力图" class="map-card">
      <div class="map-placeholder">
        <el-empty description="地图组件加载中..." />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { User, Money, Tickets, Stamp } from '@element-plus/icons-vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, PieChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components';

use([CanvasRenderer, LineChart, PieChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent]);

const lineOption = ref({
  tooltip: { trigger: 'axis' },
  legend: { data: ['订单数', 'GMV'] },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: [
    { type: 'value', name: '订单数' },
    { type: 'value', name: 'GMV', position: 'right' }
  ],
  series: [
    {
      name: '订单数',
      type: 'line',
      smooth: true,
      data: [120, 132, 101, 134, 90, 230, 210]
    },
    {
      name: 'GMV',
      type: 'line',
      smooth: true,
      yAxisIndex: 1,
      data: [22000, 18200, 19100, 23400, 29000, 33000, 31000]
    }
  ]
});

const pieOption = ref({
  tooltip: { trigger: 'item' },
  legend: { top: '5%', left: 'center' },
  series: [
    {
      name: '年龄分布',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: { label: { show: true, fontSize: '20', fontWeight: 'bold' } },
      data: [
        { value: 1048, name: '18-25岁' },
        { value: 735, name: '26-35岁' },
        { value: 580, name: '36-45岁' },
        { value: 484, name: '45岁以上' }
      ]
    }
  ]
});
</script>

<style scoped lang="scss">
.admin-dashboard {
  .data-card {
    position: relative;
    overflow: hidden;
    height: 140px;
    margin-bottom: 20px;
    color: white;

    &.blue { background: linear-gradient(135deg, #36cfc9 0%, #13c2c2 100%); }
    &.green { background: linear-gradient(135deg, #73d13d 0%, #52c41a 100%); }
    &.purple { background: linear-gradient(135deg, #9254de 0%, #722ed1 100%); }
    &.orange { background: linear-gradient(135deg, #ffa940 0%, #fa8c16 100%); }

    .card-title { opacity: 0.8; margin-bottom: 8px; font-size: 14px; }
    .card-value { font-size: 32px; font-weight: bold; margin-bottom: 16px; }
    .card-footer { 
      font-size: 12px; opacity: 0.9;
      .up { color: #fff; font-weight: bold; }
      .down { color: #fff; font-weight: bold; }
    }
    
    .bg-icon {
      position: absolute;
      right: 16px;
      bottom: 16px;
      font-size: 64px;
      opacity: 0.2;
    }
  }

  .charts-row {
    margin-bottom: 20px;
    .chart-line { height: 350px; }
    .chart-pie { height: 350px; }
  }

  .map-card {
    .map-placeholder {
      height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f7fa;
    }
  }
}
</style>
