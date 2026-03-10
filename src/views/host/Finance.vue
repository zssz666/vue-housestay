<template>
  <div class="finance-page">
    <div class="wallet-card">
      <div class="balance-section">
        <div class="label">可提现余额</div>
        <div class="amount">¥12,450.00</div>
        <el-button type="primary" round @click="withdrawDialogVisible = true">申请提现</el-button>
      </div>
      <div class="stat-section">
        <div class="stat-item">
          <div class="label">本月收入</div>
          <div class="value">¥24,800.00</div>
        </div>
        <div class="stat-item">
          <div class="label">冻结中 (进行中订单)</div>
          <div class="value">¥3,200.00</div>
        </div>
      </div>
    </div>

    <el-card class="record-list" header="提现记录">
      <el-table :data="records" style="width: 100%">
        <el-table-column prop="time" label="申请时间" width="180" />
        <el-table-column prop="amount" label="金额">
          <template #default="{ row }">- ¥{{ row.amount }}</template>
        </el-table-column>
        <el-table-column prop="bank" label="提现账户" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'warning'">
              {{ row.status === 'success' ? '已到账' : '处理中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="流水号" width="220" />
      </el-table>
    </el-card>

    <el-dialog v-model="withdrawDialogVisible" title="申请提现" width="500px">
      <el-form :model="withdrawForm" label-width="100px">
        <el-form-item label="提现金额">
          <el-input v-model="withdrawForm.amount" type="number" placeholder="最低100元">
            <template #prefix>¥</template>
          </el-input>
          <div class="fee-tip">手续费: ¥{{ Number(withdrawForm.amount) * 0.001 }} (0.1%)</div>
        </el-form-item>
        <el-form-item label="银行卡">
          <el-select v-model="withdrawForm.card" placeholder="选择到账银行卡" style="width: 100%">
            <el-option label="招商银行 (尾号8888)" value="cmb" />
            <el-option label="建设银行 (尾号6666)" value="ccb" />
          </el-select>
          <el-button link type="primary">+ 添加新卡</el-button>
        </el-form-item>
        <el-form-item label="验证码">
          <el-row :gutter="10">
            <el-col :span="14">
              <el-input v-model="withdrawForm.code" placeholder="短信验证码" />
            </el-col>
            <el-col :span="10">
              <el-button @click="sendCode" :disabled="timer > 0">
                {{ timer > 0 ? `${timer}s` : '获取验证码' }}
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="withdrawDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmWithdraw">确认提现</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';

const withdrawDialogVisible = ref(false);
const timer = ref(0);

const withdrawForm = reactive({
  amount: '',
  card: 'cmb',
  code: ''
});

const records = [
  { id: 'W202310010001', time: '2023-10-01 10:00:00', amount: 5000, bank: '招商银行 (8888)', status: 'success' },
  { id: 'W202309150002', time: '2023-09-15 14:30:00', amount: 8200, bank: '建设银行 (6666)', status: 'success' },
];

const sendCode = () => {
  timer.value = 60;
  const interval = setInterval(() => {
    timer.value--;
    if (timer.value <= 0) clearInterval(interval);
  }, 1000);
  ElMessage.success('验证码已发送');
};

const confirmWithdraw = () => {
  if (!withdrawForm.amount || !withdrawForm.code) {
    ElMessage.warning('请填写完整信息');
    return;
  }
  withdrawDialogVisible.value = false;
  ElMessage.success('提现申请已提交，预计2小时内到账');
};
</script>

<style scoped lang="scss">
.finance-page {
  .wallet-card {
    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
    border-radius: 8px;
    padding: 32px;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
    
    .balance-section {
      .label { opacity: 0.8; margin-bottom: 8px; }
      .amount { font-size: 40px; font-weight: bold; margin-bottom: 16px; }
    }
    
    .stat-section {
      display: flex;
      gap: 48px;
      
      .stat-item {
        .label { opacity: 0.8; font-size: 12px; margin-bottom: 4px; }
        .value { font-size: 20px; font-weight: 600; }
      }
    }
  }
  
  .fee-tip { font-size: 12px; color: #999; margin-top: 4px; }
}
</style>
