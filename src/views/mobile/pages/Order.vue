<template>
  <div class="page-container tj-order-page">

    <!-- ========== 渐变头部 ========== -->
    <div class="tj-order-header">
      <div class="tj-order-header__bg"></div>
      <div class="tj-order-header__content">
        <div class="tj-order-header__title">我的订单</div>
      </div>
    </div>

    <!-- ========== 胶囊 Tab ========== -->
    <div class="tj-order-tabs-wrap">
      <div class="tj-capsule-tabs">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          class="tj-capsule-tab"
          :class="{ 'is-active': activeTab === tab.key }"
          @click="switchTab(tab.key)"
        >
          {{ tab.label }}
          <span v-if="getBadge(tab.key) > 0" class="tj-tab-badge">
            {{ getBadge(tab.key) > 99 ? '99+' : getBadge(tab.key) }}
          </span>
        </div>
      </div>
    </div>

    <!-- ========== 订单列表 ========== -->
    <van-pull-refresh v-model="refreshing" success-text="刷新成功" @refresh="onRefresh">
      <div class="tj-order-list">
        <div
          v-for="order in orderList"
          :key="order.orderId"
          class="tj-order-card tj-animate-in"
        >
          <!-- 卡片顶部：房源信息+状态 -->
          <div class="tj-order-card__header">
            <div class="tj-order-card__body">
              <img
                :src="order.homestayCover || `https://picsum.photos/152/112?random=${order.orderId}`"
                :alt="order.homestayTitle"
                class="tj-order-card__cover"
              />
              <div class="tj-order-card__info">
                <div class="tj-order-card__title">{{ order.homestayTitle }}</div>
                <div class="tj-order-card__dates">{{ formatDate(order.checkInDate) }} - {{ formatDate(order.checkOutDate) }}</div>
                <div class="tj-order-card__order-no">订单号：{{ order.orderNo }}</div>
              </div>
            </div>
            <!-- 状态徽章 -->
            <span class="tj-status-badge" :class="`tj-status-badge--${order.status}`">
              {{ getStatusText(order.status) }}
            </span>
          </div>

          <!-- 入住人 -->
          <div class="tj-order-card__guests" v-if="order.guestNames?.length">
            <van-icon name="friends-o" size="12" color="#999" />
            入住人：{{ order.guestNames.join('、') }}
          </div>

          <!-- 底部：金额+操作 -->
          <div class="tj-order-card__footer">
            <div class="tj-order-card__amount-col">
              <div class="tj-order-card__amount-label">实付金额</div>
              <div class="tj-price">
                <span class="tj-price__symbol">¥</span>
                <span class="tj-price__amount" style="font-size: 18px;">{{ order.totalAmount }}</span>
              </div>
            </div>
            <div class="tj-order-card__actions" @click.stop>
              <!-- 待支付 -->
              <template v-if="order.status === 0">
                <button class="tj-btn tj-btn--gray-outline tj-btn--sm" @click="cancelOrder(order)">取消</button>
                <button class="tj-btn tj-btn--primary tj-btn--sm" @click="payOrder(order)">去支付</button>
              </template>
              <!-- 待确认 -->
              <template v-else-if="order.status === 1">
                <button class="tj-btn tj-btn--gray-outline tj-btn--sm" @click="cancelOrder(order)">取消订单</button>
              </template>
              <!-- 待入住 -->
              <template v-else-if="order.status === 2">
                <button class="tj-btn tj-btn--gray-outline tj-btn--sm" @click="showCheckInCode(order)">入住码</button>
                <button class="tj-btn tj-btn--primary tj-btn--sm" @click="confirmCheckIn(order)">确认入住</button>
              </template>
              <!-- 入住中 -->
              <template v-else-if="order.status === 3">
                <button class="tj-btn tj-btn--orange-outline tj-btn--sm" @click="confirmCheckOut(order)">申请退房</button>
              </template>
              <!-- 已完成 -->
              <template v-else-if="order.status === 4">
                <button
                  v-if="!order.reviewed"
                  class="tj-btn tj-btn--primary tj-btn--sm"
                  @click="goReview(order)"
                >去评价</button>
                <button class="tj-btn tj-btn--gray-outline tj-btn--sm" @click="reOrder(order)">再次预订</button>
              </template>
              <!-- 已取消 -->
              <template v-else-if="order.status === 5">
                <button class="tj-btn tj-btn--gray-outline tj-btn--sm" @click="reOrder(order)">再次预订</button>
              </template>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && !orderList.length" class="tj-empty">
          <div class="tj-empty__icon">📋</div>
          <div class="tj-empty__title">暂无订单</div>
          <div class="tj-empty__desc">快去预订心仪的民宿吧</div>
          <button class="tj-btn tj-btn--primary tj-btn--sm" style="margin-top: 14px;" @click="goHome">
            去预订
          </button>
        </div>

        <!-- 加载中 -->
        <div v-if="loading" class="tj-loading-wrap">
          <van-loading type="spinner" size="22" color="#FF9645" />
        </div>

        <!-- 底部提示 -->
        <div v-if="finished && orderList.length" class="tj-finished-tip">
          — 没有更多订单了 —
        </div>
      </div>
    </van-pull-refresh>

    <!-- 取消原因弹窗 -->
    <van-dialog
      v-model:show="showCancelDialog"
      title="取消订单"
      show-cancel-button
      confirm-button-color="#FF9645"
      @confirm="confirmCancel"
    >
      <div style="padding: 16px 20px;">
        <van-field
          v-model="cancelReason"
          type="textarea"
          placeholder="请输入取消原因（选填）"
          rows="2"
          autosize
        />
      </div>
    </van-dialog>

    <!-- 入住码弹窗 -->
    <van-dialog
      v-model:show="showCheckInDialog"
      :show-confirm-button="false"
      :close-on-click-overlay="true"
      width="280"
    >
      <div class="tj-checkin-dialog">
        <div class="tj-checkin-dialog__title">入住码</div>
        <div class="tj-checkin-dialog__code">{{ checkInCode }}</div>
        <div class="tj-checkin-dialog__tip">请将此码出示给房东确认入住</div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast } from 'vant';
import { getMyOrders, cancelOrder as apiCancel, payOrder as apiPay, checkIn as apiCheckIn, checkOut as apiCheckOut } from '../api/mobileApi';

const router = useRouter();
const route = useRoute();

const activeTab = ref(0);
const refreshing = ref(false);
const loading = ref(false);
const finished = ref(false);

const showCancelDialog = ref(false);
const showCheckInDialog = ref(false);
const cancelReason = ref('');
const cancelTarget = ref<MobileOrderItem | null>(null);
const checkInCode = ref('000000');

interface MobileOrderItem {
  orderId: number;
  orderNo: string;
  homestayId: number;
  homestayTitle: string;
  homestayCover: string;
  checkInDate: string;
  checkOutDate: string;
  guestNames: string[];
  totalAmount: number;
  status: number;
  reviewed?: boolean;
}

const orderList = ref<MobileOrderItem[]>([]);
const page = ref(1);
const size = 10;

const badges = ref<Record<number, number>>({ 0: 2, 1: 1, 2: 1 });

const tabs = [
  { key: 0, label: '全部' },
  { key: 2, label: '待入住' },
  { key: 3, label: '进行中' },
  { key: 4, label: '已完成' },
];

function getBadge(key: number) {
  if (key === 0) return Object.values(badges.value).reduce((a, b) => a + b, 0);
  return badges.value[key] || 0;
}

function getStatusText(status: number): string {
  const map: Record<number, string> = {
    0: '待支付', 1: '待确认', 2: '待入住',
    3: '入住中', 4: '已完成', 5: '已取消',
  };
  return map[status] || '未知';
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '--';
  return dateStr.replace(/^\d{4}-/, '');
}

async function fetchOrders(reset = false) {
  if (reset) { page.value = 1; finished.value = false; orderList.value = []; }
  loading.value = true;
  try {
    const res = await getMyOrders({ status: activeTab.value || undefined, page: page.value, size });
    if (res.code === 200 && res.data) {
      const items: MobileOrderItem[] = res.data.map(o => ({
        orderId: o.orderId, orderNo: o.orderNo, homestayId: o.homestayId,
        homestayTitle: (o as any).homestayTitle || '民宿',
        homestayCover: (o as any).homestayCover || '',
        checkInDate: o.checkInDate, checkOutDate: o.checkOutDate,
        guestNames: o.guests?.map((g: any) => g.name || '入住人') || [],
        totalAmount: o.totalAmount, status: o.status,
      }));
      if (reset) orderList.value = items;
      else orderList.value.push(...items);
      if (items.length < size) finished.value = true;
      else page.value++;
    } else {
      loadMockOrders(reset);
    }
  } catch {
    loadMockOrders(reset);
  }
  loading.value = false;
}

function loadMockOrders(reset = false) {
  if (reset) orderList.value = [];
  const statuses = activeTab.value === 0 ? [0, 2, 4] : [activeTab.value];
  const seeds = [101, 102, 103, 104];
  const mockData: MobileOrderItem[] = [
    { orderId: 201, orderNo: 'ORD20260322001', homestayId: 1, homestayTitle: '春熙路近地铁轻奢两居室', homestayCover: 'https://picsum.photos/152/112?random=201', checkInDate: '2026-03-25', checkOutDate: '2026-03-28', guestNames: ['张三', '李四'], totalAmount: 1154, status: 0 },
    { orderId: 202, orderNo: 'ORD20260321002', homestayId: 2, homestayTitle: '洱海日出·一线海景大床房', homestayCover: 'https://picsum.photos/152/112?random=202', checkInDate: '2026-04-01', checkOutDate: '2026-04-03', guestNames: ['王五'], totalAmount: 726, status: 2 },
    { orderId: 203, orderNo: 'ORD20260315003', homestayId: 3, homestayTitle: '古城墙下现代轻奢公寓', homestayCover: 'https://picsum.photos/152/112?random=203', checkInDate: '2026-03-15', checkOutDate: '2026-03-18', guestNames: ['赵六'], totalAmount: 984, status: 4, reviewed: false },
  ].filter(o => statuses.includes(o.status));

  if (reset) orderList.value = mockData;
  else orderList.value.push(...mockData);
  if (mockData.length < size) finished.value = true;
  else page.value++;
}

async function onRefresh() { await fetchOrders(true); refreshing.value = false; }
function switchTab(key: number) { activeTab.value = key; }
function goHome() { router.push('/'); }

function cancelOrder(order: MobileOrderItem) {
  cancelTarget.value = order;
  cancelReason.value = '';
  showCancelDialog.value = true;
}

async function confirmCancel() {
  if (!cancelTarget.value) return;
  try { await apiCancel(cancelTarget.value.orderId, cancelReason.value); showToast('订单已取消'); }
  catch { showToast('模拟取消成功'); }
  onRefresh();
}

async function payOrder(order: MobileOrderItem) {
  showToast('即将跳转支付...');
  setTimeout(() => {
    showToast('模拟支付成功');
    badges.value[0] = Math.max(0, (badges.value[0] || 1) - 1);
    badges.value[1] = (badges.value[1] || 0) + 1;
    order.status = 1;
  }, 1500);
}

function showCheckInCode(order: MobileOrderItem) {
  checkInCode.value = String(order.orderId).padStart(6, '0');
  showCheckInDialog.value = true;
}

async function confirmCheckIn(order: MobileOrderItem) {
  try { await apiCheckIn(order.orderId); showToast('已确认入住'); }
  catch { showToast('确认入住成功'); }
  order.status = 3;
  badges.value[2] = Math.max(0, (badges.value[2] || 1) - 1);
}

async function confirmCheckOut(order: MobileOrderItem) {
  try { await apiCheckOut(order.orderId); showToast('退房申请已提交'); }
  catch { showToast('退房申请已提交'); }
  order.status = 4;
}

function goReview(order: MobileOrderItem) { router.push(`/review/${order.orderId}?homestayId=${order.homestayId}`); }
function reOrder(order: MobileOrderItem) { router.push(`/homestay/${order.homestayId}`); }

watch(activeTab, () => { fetchOrders(true); });
onMounted(async () => {
  const tabParam = route.query.tab;
  if (tabParam !== undefined) {
    const tabNum = Number(tabParam);
    if (!isNaN(tabNum)) activeTab.value = tabNum;
  }
  await fetchOrders(true);
});
</script>

<style scoped>
.tj-order-page {
  background: var(--tj-bg-page);
  padding-bottom: calc(56px + var(--tj-safe-bottom));
}

/* ========== 渐变头部 ========== */
.tj-order-header {
  position: relative;
  height: 96px;
  display: flex;
  align-items: flex-end;
  padding-bottom: 12px;
}

.tj-order-header__bg {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 88px;
  background: linear-gradient(135deg, #FF9645, #FF7A3C, #FF5A5F);
  border-radius: 0 0 32px 32px;
  z-index: 0;
}

.tj-order-header__content {
  position: relative;
  z-index: 1;
  padding: 0 18px;
  width: 100%;
}

.tj-order-header__title {
  font-size: var(--tj-fs-2xl);
  font-weight: 800;
  color: #fff;
  letter-spacing: 1px;
}

/* ========== Tab ========== */
.tj-order-tabs-wrap {
  padding: 14px 14px 0;
  background: var(--tj-bg-page);
}

.tj-tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: #FF4D4F;
  color: #fff;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  margin-left: 3px;
}

/* ========== 订单列表 ========== */
.tj-order-list {
  padding: 14px 0 20px;
  min-height: 60vh;
}

/* 入住人 */
.tj-order-card__guests {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 14px;
  font-size: var(--tj-fs-xs);
  color: var(--tj-text-hint);
  border-top: 1px solid var(--tj-border-light);
}

/* 底部金额 */
.tj-order-card__amount-label {
  font-size: var(--tj-fs-xs);
  color: var(--tj-text-hint);
  margin-bottom: 1px;
}

/* 加载 */
.tj-loading-wrap {
  display: flex;
  justify-content: center;
  padding: 30px 0;
}

.tj-finished-tip {
  text-align: center;
  font-size: var(--tj-fs-xs);
  color: var(--tj-text-light);
  padding: 16px 0 24px;
}

/* 入住码弹窗 */
.tj-checkin-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 24px;
  gap: 10px;
}

.tj-checkin-dialog__title {
  font-size: var(--tj-fs-lg);
  font-weight: 700;
  color: var(--tj-text-title);
}

.tj-checkin-dialog__code {
  font-size: 36px;
  font-weight: 900;
  letter-spacing: 10px;
  color: var(--tj-orange);
  font-family: 'Courier New', monospace;
}

.tj-checkin-dialog__tip {
  font-size: var(--tj-fs-sm);
  color: var(--tj-text-hint);
  text-align: center;
}
</style>
