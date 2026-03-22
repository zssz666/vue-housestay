<template>
  <div class="settings-page">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="参数配置" name="params">
        <el-form label-width="120px" style="max-width: 600px">
          <el-form-item label="平台服务费">
            <el-input v-model="config.serviceFee" type="number">
              <template #append>%</template>
            </el-input>
          </el-form-item>
          <el-form-item label="最低提现金额">
            <el-input v-model="config.minWithdraw" type="number">
              <template #prefix>¥</template>
            </el-input>
          </el-form-item>
          <el-form-item label="默认押金">
            <el-input v-model="config.defaultDeposit" type="number">
              <template #prefix>¥</template>
            </el-input>
          </el-form-item>
          <el-form-item label="退款规则">
            <div class="refund-slider">
              <span>7天前退款比例</span>
              <el-slider v-model="config.refund7Days" :step="10" show-stops />
            </div>
            <div class="refund-slider">
              <span>3-7天退款比例</span>
              <el-slider v-model="config.refund3Days" :step="10" show-stops />
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveConfig">保存配置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="公告管理" name="notice">
        <el-form label-width="80px">
          <el-form-item label="标题">
            <el-input v-model="notice.title" />
          </el-form-item>
          <el-form-item label="内容">
            <el-input v-model="notice.content" type="textarea" :rows="6" placeholder="支持Markdown语法..." />
          </el-form-item>
          <el-form-item label="发布范围">
            <el-checkbox-group v-model="notice.scope">
              <el-checkbox value="guest">所有房客</el-checkbox>
              <el-checkbox value="host">所有房东</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="publishNotice">发布公告</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="操作日志" name="logs">
        <el-table :data="logs" style="width: 100%" height="500">
          <el-table-column prop="time" label="时间" width="180" />
          <el-table-column prop="operator" label="操作人" width="120" />
          <el-table-column prop="type" label="类型" width="120">
            <template #default="{ row }">
              <el-tag size="small">{{ row.type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="content" label="操作内容" />
          <el-table-column prop="ip" label="IP地址" width="140" />
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';

const activeTab = ref('params');

const config = reactive({
  serviceFee: 10,
  minWithdraw: 100,
  defaultDeposit: 200,
  refund7Days: 100,
  refund3Days: 50
});

const notice = reactive({
  title: '',
  content: '',
  scope: ['guest', 'host']
});

const logs = ref([
  { time: '2023-10-05 10:00:00', operator: 'admin', type: '审核', content: '通过房东[王强]的资质申请', ip: '192.168.1.1' },
  { time: '2023-10-05 09:30:00', operator: 'admin', type: '配置', content: '修改平台服务费率为10%', ip: '192.168.1.1' },
  { time: '2023-10-04 15:20:00', operator: 'super_admin', type: '仲裁', content: '强制执行订单[ORDER20231001]退款', ip: '10.0.0.1' },
]);

const saveConfig = () => {
  console.log('配置修改日志:', config);
  ElMessage.success('系统参数已更新');
};

const publishNotice = () => {
  if (!notice.title || !notice.content) {
    ElMessage.warning('请填写完整公告信息');
    return;
  }
  console.log('公告发布日志:', notice);
  ElMessage.success('公告已发布');
  // Reset
  notice.title = '';
  notice.content = '';
};
</script>

<style scoped lang="scss">
.settings-page {
  background: white;
  padding: 24px;
  border-radius: 4px;
  min-height: 500px;
  
  .refund-slider {
    width: 100%;
    margin-bottom: 12px;
    span { font-size: 12px; color: #666; }
  }
}
</style>
