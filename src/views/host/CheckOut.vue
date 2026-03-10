<template>
  <div class="checkout-page">
    <div class="header">
      <el-page-header @back="router.back()" content="退房验房" />
    </div>

    <div class="content-wrapper">
      <div class="order-info-card">
        <h3>订单信息</h3>
        <p><strong>订单号：</strong> {{ orderId }}</p>
        <p><strong>客人：</strong> 张三</p>
        <p><strong>房源：</strong> 海景大床房</p>
        <p><strong>押金：</strong> <span class="deposit">¥500</span></p>
      </div>

      <el-form :model="form" label-position="top" class="check-form">
        <h3>房间检查清单</h3>
        <div class="checklist-group">
          <el-checkbox v-model="form.checks.key" label="钥匙/门卡归还" />
          <el-checkbox v-model="form.checks.electric" label="电器完好（电视/空调/洗衣机）" />
          <el-checkbox v-model="form.checks.furniture" label="家具无损坏" />
          <el-checkbox v-model="form.checks.clean" label="基本卫生状况良好" />
          <el-checkbox v-model="form.checks.consumables" label="消耗品无过度使用" />
        </div>

        <h3>损坏申报</h3>
        <div class="damage-report">
          <el-switch v-model="form.hasDamage" active-text="有损坏/丢失物品" inactive-text="无损坏" />
          
          <div v-if="form.hasDamage" class="damage-detail">
            <el-form-item label="损坏描述">
              <el-input v-model="form.damageDesc" type="textarea" placeholder="请详细描述损坏情况..." />
            </el-form-item>
            <el-form-item label="赔偿金额">
              <el-input-number v-model="form.compensation" :min="0" :max="500" />
              <span class="tip">将从押金中扣除</span>
            </el-form-item>
            <el-form-item label="现场照片">
              <el-upload action="#" list-type="picture-card" :auto-upload="false">
                <el-icon><Plus /></el-icon>
              </el-upload>
            </el-form-item>
          </div>
        </div>

        <div class="summary-card">
          <div class="row">
            <span>总押金</span>
            <span>¥500</span>
          </div>
          <div class="row deduct">
            <span>扣除赔偿</span>
            <span>- ¥{{ form.compensation }}</span>
          </div>
          <el-divider />
          <div class="row total">
            <span>应退金额</span>
            <span class="refund-amount">¥{{ 500 - form.compensation }}</span>
          </div>
        </div>

        <div class="actions">
          <el-button @click="router.back()">取消</el-button>
          <el-button type="primary" @click="submitCheckOut">确认退房并退款</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const route = useRoute();
const router = useRouter();
const orderId = route.params.id;

const form = reactive({
  checks: {
    key: false,
    electric: false,
    furniture: false,
    clean: false,
    consumables: false
  },
  hasDamage: false,
  damageDesc: '',
  compensation: 0
});

const submitCheckOut = () => {
  if (!Object.values(form.checks).every(Boolean) && !form.hasDamage) {
    ElMessage.warning('请确认所有检查项');
    return;
  }

  ElMessageBox.confirm(
    `确认退还押金 ¥${500 - form.compensation} 吗？`,
    '退房确认',
    {
      confirmButtonText: '确认退款',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('退房成功，押金已原路退回');
    router.push('/host/orders');
  });
};
</script>

<style scoped lang="scss">
.checkout-page {
  background: white;
  padding: 24px;
  min-height: calc(100vh - 100px);
  
  .header { margin-bottom: 24px; }
  
  .content-wrapper {
    max-width: 800px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 40px;
    
    .order-info-card {
      background: #f9f9f9;
      padding: 24px;
      border-radius: 8px;
      height: fit-content;
      
      h3 { margin-top: 0; }
      p { margin-bottom: 12px; color: #666; }
      .deposit { font-size: 18px; font-weight: bold; color: #1890ff; }
    }
    
    .check-form {
      h3 { font-size: 16px; margin-bottom: 16px; border-left: 4px solid #1890ff; padding-left: 8px; }
      
      .checklist-group {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 32px;
      }
      
      .damage-report {
        background: #fff1f0;
        padding: 16px;
        border-radius: 4px;
        border: 1px solid #ffccc7;
        margin-bottom: 32px;
        
        .damage-detail {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #ffccc7;
        }
        
        .tip { font-size: 12px; color: #999; margin-left: 8px; }
      }
      
      .summary-card {
        background: #f0f2f5;
        padding: 24px;
        border-radius: 8px;
        margin-bottom: 32px;
        
        .row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          
          &.deduct { color: #cf1322; }
          &.total { font-weight: bold; font-size: 16px; margin-top: 16px; }
          
          .refund-amount { color: #52c41a; font-size: 20px; }
        }
      }
      
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 16px;
      }
    }
  }
}
</style>
