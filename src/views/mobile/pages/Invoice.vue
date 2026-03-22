<template>
  <div class="page-container">
    <van-nav-bar
      title="发票管理"
      left-arrow
      fixed
      placeholder
      @click-left="router.back()"
    />

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="invoice-container">
        <!-- 发票列表 -->
        <div
          v-for="invoice in invoices"
          :key="invoice.invoiceId"
          class="invoice-card"
        >
          <div class="invoice-card__header">
            <div class="invoice-card__info">
              <div class="invoice-card__title">{{ invoice.title }}</div>
              <div class="invoice-card__order">订单号：{{ invoice.orderNo }}</div>
              <div class="invoice-card__amount">¥{{ invoice.amount }}</div>
            </div>
            <van-tag :type="invoice.status === 1 ? 'success' : 'warning'" size="medium">
              {{ invoice.status === 1 ? '已开' : '待开' }}
            </van-tag>
          </div>
          <div class="invoice-card__footer" v-if="invoice.status === 0">
            <van-button size="small" round plain type="primary" @click="editInvoice(invoice)">
              修改信息
            </van-button>
            <van-button size="small" round type="primary" @click="submitInvoice(invoice)">
              申请开票
            </van-button>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && !invoices.length" class="empty-state">
          <div class="empty-state__icon">🧾</div>
          <div class="empty-state__text">暂无发票记录</div>
          <div class="empty-state__sub">在订单完成后可申请开发票</div>
          <van-button plain round type="primary" size="small" @click="goToOrders" style="margin-top: 16px">
            查看已完成订单
          </van-button>
        </div>

        <!-- 加载中 -->
        <van-loading v-if="loading" type="spinner" class="loading-container" />
      </div>
    </van-pull-refresh>

    <!-- 申请开票弹窗 -->
    <van-popup v-model:show="showInvoiceSheet" position="bottom" round :style="{ height: 'auto' }">
      <div class="invoice-form">
        <div class="invoice-form__header">
          <span class="invoice-form__title">{{ editingInvoice ? '修改发票信息' : '申请开票' }}</span>
        </div>

        <van-form @submit="handleInvoiceSubmit">
          <van-field
            v-model="invoiceForm.title"
            label="发票抬头"
            placeholder="请输入个人或公司名称"
            :rules="[{ required: true, message: '请输入发票抬头' }]"
          />
          <van-field
            v-model="invoiceForm.taxNo"
            label="税号"
            placeholder="公司发票请输入税号（选填）"
          />

          <div class="invoice-form__info">
            <van-icon name="info-o" size="16" color="#999" />
            <span>发票内容为"住宿服务"，预计3个工作日内开具</span>
          </div>

          <div class="invoice-form__buttons">
            <van-button round block @click="showInvoiceSheet = false">取消</van-button>
            <van-button round block type="primary" native-type="submit">
              确认申请
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import type { MobileInvoice } from '../types';
import { getInvoiceList, applyInvoice } from '../api/mobileApi';

const router = useRouter();

const invoices = ref<MobileInvoice[]>([]);
const loading = ref(false);
const refreshing = ref(false);
const showInvoiceSheet = ref(false);
const editingInvoice = ref<MobileInvoice | null>(null);

const invoiceForm = ref({
  title: '',
  taxNo: '',
});

async function loadInvoices() {
  loading.value = true;
  try {
    const res = await getInvoiceList();
    if (res.code === 200 && res.data) {
      invoices.value = res.data;
    } else {
      loadMockInvoices();
    }
  } catch {
    loadMockInvoices();
  }
  loading.value = false;
}

function loadMockInvoices() {
  invoices.value = [
    {
      invoiceId: 1,
      orderId: 101,
      orderNo: 'ORD20260322001',
      title: '张三',
      amount: 1154,
      status: 0,
      createdAt: '2026-03-22T10:00:00Z',
    },
    {
      invoiceId: 2,
      orderId: 102,
      orderNo: 'ORD20260321002',
      title: '成都某科技有限公司',
      taxNo: '91450100MA5K12345X',
      amount: 726,
      status: 1,
      createdAt: '2026-03-21T14:00:00Z',
    },
  ];
}

async function onRefresh() {
  await loadInvoices();
  refreshing.value = false;
}

function editInvoice(invoice: MobileInvoice) {
  editingInvoice.value = invoice;
  invoiceForm.value = {
    title: invoice.title,
    taxNo: invoice.taxNo || '',
  };
  showInvoiceSheet.value = true;
}

async function submitInvoice(invoice: MobileInvoice) {
  if (!invoiceForm.value.title) {
    editInvoice(invoice);
    return;
  }
  await handleInvoiceSubmit();
}

async function handleInvoiceSubmit() {
  if (!editingInvoice.value) return;
  try {
    await applyInvoice({
      orderId: editingInvoice.value.orderId,
      title: invoiceForm.value.title,
      taxNo: invoiceForm.value.taxNo || undefined,
    });
    showToast('发票申请已提交');
    showInvoiceSheet.value = false;
    onRefresh();
  } catch {
    showToast('模拟申请成功');
    showInvoiceSheet.value = false;
    onRefresh();
  }
}

function goToOrders() {
  router.push('/orders?tab=4');
}

onMounted(async () => {
  await loadInvoices();
});
</script>

<style scoped>
.invoice-container {
  padding: 12px 16px;
}

.invoice-card {
  background: var(--van-white);
  border-radius: var(--van-radius-lg);
  padding: 16px;
  box-shadow: var(--van-shadow-sm);
  margin-bottom: 12px;
}

.invoice-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.invoice-card__title {
  font-size: var(--van-font-size-md);
  font-weight: 600;
  color: var(--van-text-color);
  margin-bottom: 6px;
}

.invoice-card__order {
  font-size: var(--van-font-size-xs);
  color: var(--van-text-color-3);
  margin-bottom: 4px;
}

.invoice-card__amount {
  font-size: var(--van-font-size-lg);
  font-weight: 700;
  color: var(--van-danger-color);
}

.invoice-card__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #F0F0F0;
}

.empty-state__sub {
  font-size: var(--van-font-size-sm);
  color: var(--van-text-color-3);
  margin-top: 4px;
}

/* 发票表单 */
.invoice-form {
  padding: 16px;
}

.invoice-form__header {
  margin-bottom: 16px;
}

.invoice-form__title {
  font-size: var(--van-font-size-lg);
  font-weight: 700;
  color: var(--van-text-color);
}

.invoice-form__info {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 10px 16px;
  background: #F9F9F9;
  border-radius: var(--van-radius-md);
  font-size: var(--van-font-size-sm);
  color: var(--van-text-color-3);
  margin: 12px 0;
}

.invoice-form__buttons {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  padding-bottom: var(--van-safe-area-bottom);
}

.invoice-form__buttons > * {
  flex: 1;
}
</style>
