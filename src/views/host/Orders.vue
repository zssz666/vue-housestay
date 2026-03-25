<template>
  <div class="orders-page">

    <!-- ====== 顶部横幅：待办提醒 ====== -->
    <transition name="slide-down">
      <div v-if="urgentCount > 0" class="urgent-banner">
        <el-icon color="#faad14" size="16"><WarningFilled /></el-icon>
        <span>
          您有 <strong>{{ getStatusCount(1) }}</strong> 个待确认订单，
          <strong>{{ getStatusCount(2) }}</strong> 个今日入住订单待核销，
          请尽快处理 →
        </span>
        <el-button size="small" type="warning" plain @click="urgentBannerDismissed = true">我知道了</el-button>
      </div>
    </transition>

    <!-- ====== 顶部操作栏 ====== -->
    <div class="page-toolbar">
      <div class="toolbar-left">
        <!-- 搜索 -->
        <el-input
          v-model="searchKeyword"
          placeholder="订单号/房客姓名"
          clearable
          class="search-input"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>

        <!-- 房源筛选 -->
        <el-select v-model="filterHomestay" placeholder="房源" clearable style="width: 160px">
          <el-option v-for="h in homestayOptions" :key="h.homestayId" :label="h.title" :value="h.homestayId" />
        </el-select>

        <!-- 日期范围 -->
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="入住日期"
          end-placeholder="退房日期"
          value-format="YYYY-MM-DD"
          style="width: 240px"
        />
      </div>

      <div class="toolbar-right">
        <el-button :icon="Download" @click="handleExport">导出</el-button>
        <el-badge :value="newOrderCount" :hidden="newOrderCount === 0" type="danger">
          <el-button :icon="Refresh" @click="handleRefresh">刷新</el-button>
        </el-badge>
      </div>
    </div>

    <!-- ====== 左右分栏 ====== -->
    <div class="page-body" :class="{ 'has-detail': !!selectedOrder }">

      <!-- ====== 左侧看板（70%） ====== -->
      <div class="kanban-wrapper">
        <div class="kanban-board">
          <div
            v-for="col in columns"
            :key="col.key"
            class="kanban-column"
            :class="{ 'is-active-col': activeCol === col.key }"
            @dragover.prevent="activeCol = col.key"
          >
            <!-- 列头 -->
            <div class="column-header" :style="{ borderTopColor: col.color }">
              <div class="col-title">
                <span class="col-dot" :style="{ background: col.color }" />
                {{ col.label }}
                <span class="col-count">{{ getFilteredCount(col.key) }}</span>
              </div>
              <!-- 批量操作 -->
              <div v-if="selectedCardIds.length > 0 && col.batchOps" class="batch-actions">
                <el-button size="small" type="primary" plain @click="batchConfirm">
                  批量确认({{ selectedCardIds.length }})
                </el-button>
              </div>
            </div>

            <!-- 卡片列表 -->
            <div class="column-body" @dragover.prevent>
              <!-- 空状态 -->
              <div v-if="getFilteredOrders(col.key).length === 0" class="col-empty">
                <el-icon size="28" color="#d9d9d9"><Calendar /></el-icon>
                <span>{{ col.emptyText }}</span>
              </div>

              <!-- 订单卡片 -->
              <div
                v-for="order in getFilteredOrders(col.key)"
                :key="order.orderId"
                class="order-card"
                :class="{
                  'is-selected': selectedOrder?.orderId === order.orderId,
                  'is-checked': selectedCardIds.includes(order.orderId)
                }"
                draggable="true"
                @dragstart="onDragStart(order)"
                @dragend="onDragEnd"
                @click="openDetail(order)"
              >
                <!-- 选择框（批量） -->
                <div class="card-check" @click.stop>
                  <el-checkbox
                    :model-value="selectedCardIds.includes(order.orderId)"
                    size="small"
                    @change="(val) => toggleSelected(order.orderId, val)"
                  />
                </div>

                <!-- 卡片头部 -->
                <div class="card-top">
                  <div class="guest-info">
                    <el-avatar :size="32" :src="getAvatar(order)" />
                    <div>
                      <div class="guest-name">{{ getGuestName(order) }}</div>
                      <div class="order-no">No.{{ order.orderNo }}</div>
                    </div>
                  </div>
                  <!-- 状态角标 -->
                  <div class="status-tag" :style="{ background: col.color + '22', color: col.color }">
                    {{ col.label }}
                  </div>
                </div>

                <!-- 房源信息 -->
                <div class="card-homestay" @click.stop>
                  <el-image
                    v-if="getHomestayImage(order)"
                    :src="getHomestayImage(order)"
                    fit="cover"
                    class="homestay-thumb"
                  />
                  <div class="homestay-info">
                    <div class="homestay-title">{{ getHomestayTitle(order) }}</div>
                    <div class="homestay-address">{{ getHomestayAddress(order) }}</div>
                  </div>
                </div>

                <!-- 日期 -->
                <div class="card-dates">
                  <div class="date-range">
                    <el-icon color="#8c8c8c" size="13"><Calendar /></el-icon>
                    <span>{{ formatDate(order.checkInDate) }} - {{ formatDate(order.checkOutDate) }}</span>
                    <el-tag size="small" type="info">{{ getNights(order) }}晚</el-tag>
                  </div>
                </div>

                <!-- 倒计时（待确认状态） -->
                <div v-if="col.key === 1 && order.autoCancelAt" class="card-countdown">
                  <span class="countdown-label">自动取消：</span>
                  <span class="countdown-time">{{ countdownMap[order.orderId] || getCountdown(order.autoCancelAt) }}</span>
                </div>

                <!-- 金额 -->
                <div class="card-footer">
                  <div class="amount">
                    <span class="yen">¥</span>
                    <span class="price">{{ getTotalAmount(order).toLocaleString() }}</span>
                  </div>
                  <!-- 卡片快捷操作 -->
                  <div class="card-quick-actions" @click.stop>
                    <el-tooltip content="拨打电话" placement="top">
                      <el-button size="small" circle :icon="Phone" @click="callGuest(order)" />
                    </el-tooltip>
                    <el-tooltip content="发送消息" placement="top">
                      <el-button size="small" circle :icon="ChatDotRound" @click="sendMsg(order)" />
                    </el-tooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ====== 订单详情卡片 ====== -->
      <transition name="modal-fade">
        <div v-if="detailDrawerVisible" class="detail-modal-overlay" @click.self="detailDrawerVisible = false">
          <div class="detail-card" :class="{ 'detail-card--open': detailDrawerVisible }">
            <!-- 卡片头部 -->
            <div class="detail-card-header" :style="{ '--statusColor': selectedOrder ? getStatusColor(selectedOrder.status) : '#1890ff' }">
              <div class="card-header-top">
                <div class="card-header-left">
                  <el-tag v-if="selectedOrder" :color="getStatusColor(selectedOrder.status)" size="large" effect="dark" style="border: none">
                    {{ selectedOrder ? getStatusText(selectedOrder.status) : '' }}
                  </el-tag>
                  <div class="card-order-info">
                    <div class="order-no-detail">{{ selectedOrder?.orderNo }}</div>
                    <div class="order-time">下单：{{ selectedOrder?.createdAt }}</div>
                  </div>
                </div>
                <el-button class="close-btn" circle :icon="Close" @click="detailDrawerVisible = false" />
              </div>

              <!-- 操作按钮组 -->
              <div class="detail-actions">
                <!-- 待确认：接单/拒绝 -->
                <template v-if="selectedOrder?.status === 1">
                  <el-button type="success" @click="handleConfirmOrder(selectedOrder)">
                    <el-icon><Check /></el-icon> 确认接单
                  </el-button>
                  <el-button type="danger" plain @click="openRejectDialog(selectedOrder)">
                    <el-icon><Close /></el-icon> 拒绝订单
                  </el-button>
                </template>

                <!-- 待入住：发指引/核销 -->
                <template v-else-if="selectedOrder?.status === 2">
                  <el-button type="primary" @click="openGuideDialog(selectedOrder)">
                    <el-icon><Message /></el-icon> 入住指引
                  </el-button>
                  <el-button type="warning" @click="openCheckinDialog(selectedOrder)">
                    <el-icon><Key /></el-icon> 核销入住
                  </el-button>
                </template>

                <!-- 入住中：退房验房 -->
                <template v-else-if="selectedOrder?.status === 3">
                  <el-button type="warning" @click="openCheckoutDialog(selectedOrder)">
                    <el-icon><House /></el-icon> 办理退房
                  </el-button>
                </template>

                <!-- 待退房/验房 -->
                <template v-else-if="selectedOrder?.status === 4">
                  <el-button type="primary" @click="openCheckoutDialog(selectedOrder)">
                    <el-icon><House /></el-icon> 完成验房
                  </el-button>
                </template>

                <!-- 已完成 -->
                <template v-else-if="selectedOrder?.status === 5">
                  <el-button @click="viewReview">查看评价</el-button>
                </template>
              </div>
            </div>

            <!-- 卡片内容区 -->
            <el-scrollbar class="detail-card-body">

              <!-- ===== 房源信息卡片 ===== -->
              <div class="info-card">
                <div class="info-card-title">
                  <el-icon color="#1890ff"><House /></el-icon> 房源信息
                </div>
                <div class="homestay-detail">
                  <el-image
                    v-if="selectedOrder && getHomestayImage(selectedOrder)"
                    :src="getHomestayImage(selectedOrder)"
                    fit="cover"
                    class="detail-homestay-img"
                    :preview-src-list="[getHomestayImage(selectedOrder)]"
                    preview-teleported
                  />
                  <div class="homestay-detail-info">
                    <div class="detail-homestay-title" @click="selectedOrder && router.push(`/homestay/${selectedOrder.homestayId}`)">
                      {{ selectedOrder ? getHomestayTitle(selectedOrder) : '' }}
                    </div>
                    <div class="detail-homestay-addr">
                      <el-icon color="#8c8c8c" size="12"><LocationInformation /></el-icon>
                      {{ selectedOrder ? getHomestayAddress(selectedOrder) : '' }}
                    </div>
                    <div class="detail-dates">
                      <el-icon color="#1890ff" size="14"><Calendar /></el-icon>
                      {{ selectedOrder ? formatDate(selectedOrder.checkInDate) : '' }}
                      <span class="date-sep">至</span>
                      {{ selectedOrder ? formatDate(selectedOrder.checkOutDate) : '' }}
                      <el-tag size="small" type="info" style="margin-left: 8px">{{ selectedOrder ? getNights(selectedOrder) : 0 }}晚</el-tag>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ===== 房客信息卡片 ===== -->
              <div class="info-card">
                <div class="info-card-title">
                  <el-icon color="#52c41a"><User /></el-icon> 房客信息
                </div>
                <div class="guest-detail">
                  <div class="guest-avatar-row">
                    <el-avatar :size="48" :src="selectedOrder ? getAvatar(selectedOrder) : ''" />
                    <div class="guest-detail-info">
                      <div class="guest-detail-name">{{ selectedOrder ? getGuestName(selectedOrder) : '' }}</div>
                      <div class="guest-phone">
                        <span>{{ selectedOrder ? maskPhone(getContactPhone(selectedOrder)) : '' }}</span>
                        <el-button
                          v-if="selectedOrder"
                          size="small"
                          type="primary"
                          circle
                          :icon="Phone"
                          @click="callGuest(selectedOrder)"
                        >
                          拨打电话
                        </el-button>
                      </div>
                    </div>
                  </div>
                  <!-- 入住人列表 -->
                  <div v-if="selectedOrder?.guests?.length" class="guest-list">
                    <div v-for="(g, idx) in selectedOrder.guests" :key="idx" class="guest-item">
                      <el-icon color="#8c8c8c"><User /></el-icon>
                      <span>{{ g.name }}</span>
                      <span class="guest-idcard">{{ maskIdCard(g.idCard) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ===== 金额明细卡片 ===== -->
              <div class="info-card">
                <div class="info-card-title">
                  <el-icon color="#faad14"><Money /></el-icon> 金额明细
                </div>
                <div class="pricing-table">
                  <div class="price-row">
                    <span class="price-label">房费</span>
                    <span class="price-desc">¥{{ selectedOrder ? getNightlyRate(selectedOrder) : 0 }} × {{ selectedOrder ? getNights(selectedOrder) : 0 }}晚</span>
                    <span class="price-val">¥{{ selectedOrder ? getNightlyTotal(selectedOrder) : 0 }}</span>
                  </div>
                  <div class="price-row">
                    <span class="price-label">清洁费</span>
                    <span class="price-desc"></span>
                    <span class="price-val">¥{{ selectedOrder?.homestayInfo?.area || 50 }}</span>
                  </div>
                  <div class="price-row">
                    <span class="price-label">押金</span>
                    <span class="price-desc price-tip">退房无损坏后退还</span>
                    <span class="price-val deposit">¥{{ selectedOrder?.depositAmount || 0 }}</span>
                  </div>
                  <div class="price-divider" />
                  <div class="price-row total-row">
                    <span class="price-label">实付金额</span>
                    <span class="price-desc"></span>
                    <span class="price-val total">¥{{ selectedOrder ? getTotalAmount(selectedOrder).toLocaleString() : 0 }}</span>
                  </div>
                </div>
              </div>

              <!-- ===== 订单时间轴卡片 ===== -->
              <div class="info-card">
                <div class="info-card-title">
                  <el-icon color="#722ed1"><Timer /></el-icon> 订单进度
                </div>
                <el-timeline class="order-timeline">
                  <el-timeline-item
                    v-for="(item, idx) in selectedOrder ? buildTimeline(selectedOrder) : []"
                    :key="idx"
                    :color="item.color"
                    :type="item.type"
                    :hollow="item.hollow"
                    :timestamp="item.time"
                    placement="top"
                  >
                    <div class="timeline-content" :class="{ 'is-current': item.isCurrent }">
                      <span class="timeline-event">{{ item.event }}</span>
                      <span v-if="item.desc" class="timeline-desc">{{ item.desc }}</span>
                    </div>
                  </el-timeline-item>
                </el-timeline>
              </div>

              <!-- ===== 特殊信息卡片 ===== -->
              <div class="info-card">
                <div class="info-card-title">
                  <el-icon color="#1890ff"><ChatLineSquare /></el-icon> 备注信息
                </div>
                <div class="remark-section">
                  <div class="remark-item">
                    <div class="remark-label">房客备注</div>
                    <div class="remark-value">
                      {{ selectedOrder?.remark || '无' }}
                    </div>
                  </div>
                  <div class="remark-item">
                    <div class="remark-label">房东备注 <span class="landlord-only">(仅房东可见)</span></div>
                    <el-input
                      v-model="landlordRemark"
                      type="textarea"
                      :rows="2"
                      placeholder="添加内部备注..."
                      @blur="saveLandlordRemark"
                    />
                  </div>
                </div>
              </div>

              <!-- 底部操作日志 -->
              <div class="info-card footer-card">
                <div class="footer-meta">
                  <span>订单创建：{{ selectedOrder?.createdAt }}</span>
                  <span v-if="selectedOrder?.payTime">支付时间：{{ selectedOrder?.payTime }}</span>
                </div>
              </div>

            </el-scrollbar>
          </div>
        </div>
      </transition>
    </div>

    <!-- ====== 拒绝订单弹窗 ====== -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝订单" width="480px" destroy-on-close>
      <el-form :model="rejectForm" label-width="90px">
        <el-form-item label="订单号">
          <span class="static-text">{{ selectedOrder?.orderNo }}</span>
        </el-form-item>
        <el-form-item label="拒绝原因" required>
          <el-radio-group v-model="rejectForm.reason">
            <el-radio value="conflict">房态冲突</el-radio>
            <el-radio value="price_error">价格错误</el-radio>
            <el-radio value="other">其他原因</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="补充说明">
          <el-input v-model="rejectForm.note" type="textarea" :rows="3" placeholder="请详细说明..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" :loading="rejectLoading" @click="confirmReject">确认拒绝</el-button>
      </template>
    </el-dialog>

    <!-- ====== 入住指引弹窗 ====== -->
    <el-dialog v-model="guideDialogVisible" title="发送入住指引" width="520px" destroy-on-close>
      <div class="guide-templates">
        <div class="guide-templates-label">选择模板</div>
        <div class="template-list">
          <div
            v-for="tpl in guideTemplates"
            :key="tpl.value"
            class="template-item"
            :class="{ selected: guideForm.template === tpl.value }"
            @click="guideForm.template = tpl.value"
          >
            <el-icon :color="guideForm.template === tpl.value ? '#1890ff' : '#8c8c8c'">
              <component :is="tpl.icon" />
            </el-icon>
            {{ tpl.label }}
          </div>
        </div>
      </div>
      <el-form :model="guideForm" style="margin-top: 16px">
        <el-form-item label="发送方式">
          <el-checkbox-group v-model="guideForm.methods">
            <el-checkbox value="site">站内信</el-checkbox>
            <el-checkbox value="sms">短信</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="消息内容">
          <el-input v-model="guideForm.content" type="textarea" :rows="5" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="guideDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="guideLoading" @click="confirmSendGuide">确认发送</el-button>
      </template>
    </el-dialog>

    <!-- ====== 核销入住弹窗 ====== -->
    <el-dialog v-model="checkinDialogVisible" title="核销入住" width="440px" destroy-on-close>
      <div class="checkin-modes">
        <div class="checkin-mode active">
          <div class="mode-icon"><el-icon size="28" color="#1890ff"><Key /></el-icon></div>
          <div class="mode-label">输入入住码</div>
          <div class="mode-desc">用户提供6位入住码</div>
        </div>
      </div>
      <div class="checkin-code-input">
        <el-input
          v-model="checkinCode"
          maxlength="6"
          placeholder="请输入6位入住码"
          size="large"
          style="letter-spacing: 12px; font-size: 20px; text-align: center"
          @input="checkinCode = checkinCode.replace(/\D/g, '')"
        />
        <div class="code-hint">入住码格式：6位数字</div>
      </div>
      <template #footer>
        <el-button @click="checkinDialogVisible = false">取消</el-button>
        <el-button type="success" :loading="checkinLoading" @click="confirmCheckin">
          确认核销
        </el-button>
      </template>
    </el-dialog>

    <!-- ====== 退房验房弹窗 ====== -->
    <el-dialog v-model="checkoutDialogVisible" title="退房验房" width="560px" destroy-on-close>
      <el-form ref="checkoutFormRef" :model="checkoutForm" :rules="checkoutRules" label-width="90px">
        <el-form-item label="验房检查">
          <div class="checklist">
            <el-checkbox v-for="item in checkItems" :key="item" v-model="checkoutForm.checks" :value="item">
              {{ item }}
            </el-checkbox>
          </div>
        </el-form-item>

        <el-form-item label="损坏上传">
          <el-upload
            v-model:file-list="damagePhotos"
            action="#"
            :auto-upload="false"
            list-type="picture-card"
            :limit="3"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="upload-hint">最多上传3张损坏照片</div>
        </el-form-item>

        <el-form-item label="押金处理">
          <el-radio-group v-model="checkoutForm.depositAction">
            <el-radio value="full">全额退还（¥{{ selectedOrder?.depositAmount || 0 }}）</el-radio>
            <el-radio value="partial">部分扣除</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="checkoutForm.depositAction === 'partial'" label="扣除金额" prop="deductAmount">
          <el-input-number
            v-model="checkoutForm.deductAmount"
            :min="0"
            :max="selectedOrder?.depositAmount || 0"
            :precision="2"
          />
          <span style="margin-left: 8px; color: #8c8c8c">元（押金 ¥{{ selectedOrder?.depositAmount || 0 }}）</span>
        </el-form-item>

        <el-form-item label="扣款原因" v-if="checkoutForm.depositAction === 'partial'" prop="deductReason">
          <el-input v-model="checkoutForm.deductReason" type="textarea" :rows="2" placeholder="请说明扣款原因..." />
        </el-form-item>
      </el-form>

      <!-- 退房摘要 -->
      <div class="checkout-summary">
        <div class="summary-row">
          <span>押金总额</span><span>¥{{ selectedOrder?.depositAmount || 0 }}</span>
        </div>
        <div v-if="checkoutForm.depositAction === 'partial'" class="summary-row highlight">
          <span>扣除金额</span><span>-¥{{ checkoutForm.deductAmount || 0 }}</span>
        </div>
        <div class="summary-row final">
          <span>应退金额</span>
          <span>¥{{ Math.max(0, (selectedOrder?.depositAmount || 0) - (checkoutForm.deductAmount || 0)) }}</span>
        </div>
      </div>

      <template #footer>
        <el-button @click="checkoutDialogVisible = false">取消</el-button>
        <el-button type="warning" :loading="checkoutLoading" @click="confirmCheckout">确认退房</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Calendar, Phone, ChatDotRound, Key, House, Money,
  Timer, User, LocationInformation, Check, Close, Message,
  WarningFilled, Download, Refresh, Plus, Edit
} from '@element-plus/icons-vue'
import { orders as mockOrders } from '@/mock/data'
import { homestays } from '@/mock/data'
import type { Order } from '@/types'

const router = useRouter()

// ==================== 看板列定义 ====================
// status: 0=待支付, 1=待确认, 2=待入住, 3=入住中, 4=待退房, 5=已完成, 6=已取消
const columns = [
  { key: 1, label: '待确认', color: '#ff9c00', emptyText: '暂无待确认订单', batchOps: true },
  { key: 2, label: '待入住', color: '#1890ff', emptyText: '暂无待入住订单' },
  { key: 3, label: '入住中', color: '#52c41a', emptyText: '暂无入住中订单' },
  { key: 4, label: '待退房/验房', color: '#722ed1', emptyText: '暂无待退房订单' },
]

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '待支付', color: '#8c8c8c' },
  1: { label: '待确认', color: '#ff9c00' },
  2: { label: '待入住', color: '#1890ff' },
  3: { label: '入住中', color: '#52c41a' },
  4: { label: '待退房', color: '#722ed1' },
  5: { label: '已完成', color: '#52c41a' },
  6: { label: '已取消', color: '#8c8c8c' },
}

// ==================== 列表数据 ====================
const allOrders = ref<Order[]>([])
const searchKeyword = ref('')
const filterHomestay = ref<number | null>(null)
const dateRange = ref<string[]>([])
const activeCol = ref<number | null>(null)
const selectedCardIds = ref<number[]>([])
const newOrderCount = ref(0)
const urgentBannerDismissed = ref(false)
const landlordRemarks = reactive<Record<number, string>>({})

// 房源选项
const homestayOptions = computed(() =>
  allOrders.value
    .map(o => o.homestayInfo)
    .filter(Boolean)
    .filter((h, i, arr) => arr.findIndex(x => x.homestayId === h!.homestayId) === i)
    .map(h => h!)
)

// 过滤后列表
const filteredOrders = computed(() => {
  let result = [...allOrders.value]
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    result = result.filter(o =>
      o.orderNo.toLowerCase().includes(kw) ||
      getGuestName(o).toLowerCase().includes(kw)
    )
  }
  if (filterHomestay.value) {
    result = result.filter(o => o.homestayId === filterHomestay.value)
  }
  if (dateRange.value?.length === 2) {
    const [start, end] = dateRange.value
    result = result.filter(o => o.checkInDate >= start && o.checkOutDate <= end)
  }
  return result
})

function getFilteredOrders(colKey: number) {
  return filteredOrders.value.filter(o => o.status === colKey)
}

function getFilteredCount(colKey: number) {
  return getFilteredOrders(colKey).length
}

function getStatusCount(status: number) {
  return allOrders.value.filter(o => o.status === status).length
}

const urgentCount = computed(() => {
  if (urgentBannerDismissed.value) return 0
  return getStatusCount(1) + getStatusCount(2)
})

// 拖拽
let draggedOrder: Order | null = null
function onDragStart(order: Order) { draggedOrder = order }
function onDragEnd() { draggedOrder = null; activeCol.value = null }

// 批量操作
function batchConfirm() {
  ElMessageBox.confirm(`确认批量接单 ${selectedCardIds.value.length} 个订单？`, '批量确认', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    selectedCardIds.value.forEach(id => {
      const o = allOrders.value.find(x => x.orderId === id)
      if (o && o.status === 1) o.status = 2
    })
    selectedCardIds.value = []
    ElMessage.success(`已批量确认 ${allOrders.value.filter(o => o.status === 2).length} 个订单`)
  }).catch(() => {})
}

function toggleSelected(id: number, checked: boolean) {
  const idx = selectedCardIds.value.indexOf(id)
  if (checked && idx === -1) selectedCardIds.value.push(id)
  if (!checked && idx !== -1) selectedCardIds.value.splice(idx, 1)
}

// 导出
function handleExport() {
  ElMessage.success('订单数据正在导出...')
}

// 刷新 + 新订单提示
function handleRefresh() {
  ElMessage.success('订单已刷新')
}

// ==================== 详情面板 ====================
const selectedOrder = ref<Order | null>(null)
const landlordRemark = ref('')
const detailDrawerVisible = ref(false)

function openDetail(order: Order) {
  selectedOrder.value = order
  landlordRemark.value = landlordRemarks[order.orderId] || ''
  detailDrawerVisible.value = true
}

function onDetailDrawerClose() {
  selectedOrder.value = null
  landlordRemark.value = ''
  selectedCardIds.value = []
}

// 刷新详情数据
function refreshDetail() {
  if (!selectedOrder.value) return
  const updated = allOrders.value.find(o => o.orderId === selectedOrder.value!.orderId)
  if (updated) selectedOrder.value = updated
}

// ==================== 工具函数 ====================
function getGuestName(order: Order) {
  return order.guests?.[0]?.name || '房客'
}
function getAvatar(order: Order) {
  return `https://i.pravatar.cc/150?u=${order.orderId}`
}
function getContactPhone(order: Order) {
  return order.contactPhone || order.guests?.[0]?.phone || ''
}
function getHomestayTitle(order: Order) {
  return order.homestayInfo?.title || '未知房源'
}
function getHomestayImage(order: Order) {
  return order.homestayInfo?.images?.[0] || ''
}
function getHomestayAddress(order: Order) {
  return order.homestayInfo?.address || ''
}
function getNights(order: Order) {
  if (!order.checkInDate || !order.checkOutDate) return 1
  const a = new Date(order.checkInDate)
  const b = new Date(order.checkOutDate)
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86400000))
}
function getNightlyRate(order: Order) {
  const nights = getNights(order)
  if (!nights) return 0
  const fee = order.homestayInfo?.area || 50
  return Math.round((order.totalAmount - fee) / nights)
}
function getNightlyTotal(order: Order) {
  return getNightlyRate(order) * getNights(order)
}
function getTotalAmount(order: Order) {
  return order.totalAmount
}
function maskPhone(phone: string) {
  if (!phone || phone.length < 7) return phone
  return phone.substring(0, 3) + '****' + phone.substring(phone.length - 4)
}
function maskIdCard(idcard: string) {
  if (!idcard || idcard.length < 8) return idcard
  return idcard.substring(0, 3) + '********' + idcard.substring(idcard.length - 4)
}
function formatDate(dateStr: string) {
  if (!dateStr) return '--'
  return dateStr.replace(/^(\d{4})-(\d{1,2})-(\d{1,2})$/, (_, y, m, d) =>
    `${parseInt(m)}月${parseInt(d)}日`
  )
}

function getStatusColor(status: number) {
  return statusMap[status]?.color || '#8c8c8c'
}
function getStatusText(status: number) {
  return statusMap[status]?.label || '未知'
}

// 倒计时
function getCountdown(targetTime: string) {
  const diff = new Date(targetTime).getTime() - Date.now()
  if (diff <= 0) return '已超时'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return `${h}小时${m}分钟`
}

// 时间轴
function buildTimeline(order: Order) {
  const events = [
    { time: order.createdAt, event: '用户提交订单', color: '#d9d9d9', type: 'default' as const, hollow: false, isCurrent: false },
    { time: '', event: '待房东确认', color: '#ff9c00', type: 'warning' as const, hollow: true, isCurrent: order.status === 1, desc: '' },
    { time: order.payTime || '', event: '用户支付完成', color: '#52c41a', type: 'success' as const, hollow: false, isCurrent: false, desc: '' },
    { time: '', event: '待入住', color: '#1890ff', type: 'primary' as const, hollow: order.status !== 2, isCurrent: order.status === 2, desc: '' },
    { time: '', event: '入住中', color: '#52c41a', type: 'success' as const, hollow: order.status < 3, isCurrent: order.status === 3, desc: '' },
    { time: '', event: '退房验房', color: '#722ed1', type: '' as const, hollow: order.status < 4, isCurrent: order.status === 4, desc: '' },
    { time: '', event: '订单完成', color: '#d9d9d9', type: 'default' as const, hollow: order.status < 5, isCurrent: order.status === 5, desc: '' },
  ]
  return events.filter(e => e.time || e.isCurrent)
}

function callGuest(order: Order) {
  const phone = getContactPhone(order)
  if (!phone) { ElMessage.warning('无联系方式'); return }
  window.open(`tel:${phone}`)
  ElMessage.info(`正在拨打：${phone}`)
}

function sendMsg(order: Order) {
  ElMessage.info(`正在打开与 ${getGuestName(order)} 的聊天...`)
}

function saveLandlordRemark() {
  if (!selectedOrder.value) return
  landlordRemarks[selectedOrder.value.orderId] = landlordRemark.value
  ElMessage.success('备注已保存')
}

// ==================== 待确认：接单/拒绝 ====================
async function handleConfirmOrder(order: Order) {
  try {
    await ElMessageBox.confirm(
      '确认接单后，房态将被锁定，用户将收到确认通知。',
      '确认接单',
      { confirmButtonText: '确认接单', cancelButtonText: '取消', type: 'success' }
    )
    order.status = 2
    order.payStatus = 2
    refreshDetail()
    ElMessage.success('已确认接单，订单已转为待入住状态')
  } catch { /* 用户取消 */ }
}

// 拒绝
const rejectDialogVisible = ref(false)
const rejectLoading = ref(false)
const rejectForm = reactive({ reason: 'conflict', note: '' })

function openRejectDialog(order: Order) {
  selectedOrder.value = order
  rejectForm.reason = 'conflict'
  rejectForm.note = ''
  rejectDialogVisible.value = true
}

async function confirmReject() {
  if (!selectedOrder.value) return
  if (!rejectForm.reason) { ElMessage.warning('请选择拒绝原因'); return }
  rejectLoading.value = true
  await new Promise(r => setTimeout(r, 800))
  rejectLoading.value = false
  selectedOrder.value.status = 6
  rejectDialogVisible.value = false
  refreshDetail()
  ElMessage.warning('订单已拒绝，将触发退款流程')
}

// ==================== 待入住：发指引/核销 ====================
// 入住指引
const guideDialogVisible = ref(false)
const guideLoading = ref(false)
const guideForm = reactive({ template: 'address', methods: ['site', 'sms'] as string[], content: '' })

const guideTemplates = [
  { label: '地址导航', value: 'address', icon: 'LocationInformation' },
  { label: 'WiFi密码', value: 'wifi', icon: 'Connection' },
  { label: '门锁密码', value: 'lock', icon: 'Lock' },
  { label: '交通指南', value: 'traffic', icon: 'Bicycle' },
]

const guideContentMap: Record<string, string> = {
  address: '【入住地址】\n您的房源地址：\n四川省成都市锦江区滨江东路158号\n导航请搜索"滨江国际"，到达后联系房东取钥匙。',
  wifi: '【WiFi信息】\n网络名称：JD_FreeWiFi\n密码：88888888\n如有问题请联系房东。',
  lock: '【智能门锁密码】\n密码：#1234#\n退房时请确保门已锁好。',
  traffic: '【交通指南】\n最近的地铁站：2号线 - 东门大桥站（步行约800米）\n最近的公交站：滨江路站（步行约200米）',
}

function openGuideDialog(order: Order) {
  selectedOrder.value = order
  guideForm.template = 'address'
  guideForm.methods = ['site', 'sms']
  guideForm.content = guideContentMap['address']
  guideDialogVisible.value = true
}

watch(() => guideForm.template, (tpl) => {
  guideForm.content = guideContentMap[tpl] || ''
})

async function confirmSendGuide() {
  if (!guideForm.methods.length) { ElMessage.warning('请选择发送方式'); return }
  guideLoading.value = true
  await new Promise(r => setTimeout(r, 1000))
  guideLoading.value = false
  guideDialogVisible.value = false
  ElMessage.success('入住指引已发送至用户')
}

// 核销
const checkinDialogVisible = ref(false)
const checkinLoading = ref(false)
const checkinCode = ref('')

function openCheckinDialog(order: Order) {
  selectedOrder.value = order
  checkinCode.value = ''
  checkinDialogVisible.value = true
}

async function confirmCheckin() {
  if (checkinCode.value.length !== 6) {
    ElMessage.warning('请输入6位入住码')
    return
  }
  checkinLoading.value = true
  await new Promise(r => setTimeout(r, 1000))
  checkinLoading.value = false
  if (!selectedOrder.value) return
  selectedOrder.value.status = 3
  checkinDialogVisible.value = false
  refreshDetail()
  ElMessage.success('核销成功！用户已入住')
}

// ==================== 退房验房 ====================
const checkoutDialogVisible = ref(false)
const checkoutLoading = ref(false)
const damagePhotos = ref<any[]>([])
const checkoutFormRef = ref()
const checkItems = ['设施完好无损', '卫生清洁良好', '物品齐全无缺']
const checkoutForm = reactive({
  checks: [] as string[],
  depositAction: 'full',
  deductAmount: 0,
  deductReason: ''
})

const checkoutRules = {
  deductAmount: [
    { validator: (_rule: any, val: number, callback: Function) => {
      if (checkoutForm.depositAction === 'partial' && (!val || val <= 0)) {
        callback(new Error('请输入扣除金额'))
      } else callback()
    }, trigger: 'blur' }
  ]
}

function openCheckoutDialog(order: Order) {
  selectedOrder.value = order
  checkoutForm.checks = []
  checkoutForm.depositAction = 'full'
  checkoutForm.deductAmount = 0
  checkoutForm.deductReason = ''
  damagePhotos.value = []
  checkoutDialogVisible.value = true
}

async function confirmCheckout() {
  if (!checkoutFormRef.value) return
  try {
    await checkoutFormRef.value.validate()
  } catch { return }

  checkoutLoading.value = true
  await new Promise(r => setTimeout(r, 1200))
  checkoutLoading.value = false

  if (!selectedOrder.value) return
  selectedOrder.value.status = 5

  const refund = checkoutForm.depositAction === 'full'
    ? selectedOrder.value.depositAmount
    : Math.max(0, selectedOrder.value.depositAmount - checkoutForm.deductAmount)

  checkoutDialogVisible.value = false
  refreshDetail()
  ElMessageBox.alert(
    `退房验房完成！${refund > 0 ? `押金 ¥${refund} 已原路退回` : '无需退还押金'}`,
    '退房成功',
    { confirmButtonText: '好的', type: 'success' }
  )
}

function viewReview() {
  ElMessage.info('评价管理功能开发中...')
}

// ==================== 倒计时更新 ====================
const countdownMap = reactive<Record<number, string>>({})
let countdownTimer: ReturnType<typeof setInterval> | null = null

function updateCountdowns() {
  allOrders.value.forEach(order => {
    if (order.autoCancelAt) {
      countdownMap[order.orderId] = getCountdown(order.autoCancelAt)
    }
  })
}

// 模拟新订单 WebSocket 推送
let wsTimer: ReturnType<typeof setInterval> | null = null
let wsDialogOpen = false

function simulateNewOrder() {
  wsTimer = setInterval(() => {
    if (Math.random() > 0.7 && !wsDialogOpen) {
      newOrderCount.value++
      wsDialogOpen = true
      ElMessageBox.confirm('检测到新订单，是否刷新查看？', '新订单提醒', {
        confirmButtonText: '刷新',
        cancelButtonText: '稍后',
        type: 'info'
      }).then(() => {
        handleRefresh()
        newOrderCount.value = 0
      }).catch(() => {}).finally(() => {
        wsDialogOpen = false
      })
    }
  }, 30000)
}

// ==================== 生命周期 ====================
onMounted(() => {
  // 注入倒计时
  allOrders.value = mockOrders
    .filter(o => [1, 2, 3, 4].includes(o.status))
    .map(o => ({
      ...o,
      autoCancelAt: o.status === 1
        ? new Date(Date.now() + 2 * 3600000).toISOString().replace('T', ' ').substring(0, 19)
        : undefined
    }))

  updateCountdowns()
  countdownTimer = setInterval(updateCountdowns, 1000)
  simulateNewOrder()
})

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
  if (wsTimer) clearInterval(wsTimer)
})

import { watch } from 'vue'
</script>

<style scoped lang="scss">
// ==================== 页面布局 ====================
.orders-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0;
}

// ==================== 待办横幅 ====================
.urgent-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #664d00;

  span { flex: 1; }
}

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-10px); }

// ==================== 工具栏 ====================
.page-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    flex: 1;

    .search-input { width: 240px; }
  }

  .toolbar-right {
    display: flex;
    gap: 10px;
    align-items: center;
  }
}

// ==================== 左右分栏 ====================
.page-body {
  display: flex;
  gap: 16px;
  flex: 1;
  overflow: hidden;
  transition: all 0.3s;
}

// ==================== 看板 ====================
.kanban-wrapper {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.kanban-board {
  display: flex;
  gap: 14px;
  flex: 1;
  overflow-x: auto;
  padding-bottom: 8px;
  align-items: flex-start;

  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-thumb { background: #d9d9d9; border-radius: 3px; }
}

.kanban-column {
  flex: 1;
  min-width: 260px;
  max-width: 340px;
  background: #f7f8fa;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  transition: all 0.2s;
  border: 2px solid transparent;

  &.is-active-col {
    border-color: #1890ff44;
    background: #f0f7ff;
  }
}

// 列头
.column-header {
  padding: 14px 16px;
  background: white;
  border-radius: 12px 12px 0 0;
  border-top: 3px solid transparent;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;

  .col-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #1a1a1a;

    .col-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .col-count {
      background: #f0f0f0;
      color: #8c8c8c;
      font-size: 12px;
      padding: 1px 8px;
      border-radius: 10px;
      font-weight: 400;
    }
  }

  .batch-actions {
    display: flex;
    gap: 6px;
  }
}

// 列体
.column-body {
  padding: 10px;
  overflow-y: auto;
  flex: 1;
  max-height: calc(100vh - 280px);
  min-height: 200px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: #d9d9d9; border-radius: 2px; }
}

.col-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  gap: 8px;
  color: #bfbfbf;
  font-size: 13px;
}

// 订单卡片
.order-card {
  background: white;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 10px;
  border: 1.5px solid transparent;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);

  &:hover {
    border-color: #1890ff;
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
    transform: translateY(-2px);
  }

  &.is-selected {
    border-color: #1890ff;
    background: #f0f7ff;
    box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
  }

  &.is-checked {
    border-color: #52c41a;
    background: #f6ffed;
  }
}

.card-check {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-left: 22px;

  .guest-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .guest-name { font-size: 14px; font-weight: 600; color: #1a1a1a; }
    .order-no { font-size: 11px; color: #8c8c8c; margin-top: 2px; }
  }

  .status-tag {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 500;
  }
}

.card-homestay {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  align-items: center;

  .homestay-thumb {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    flex-shrink: 0;
  }

  .homestay-info {
    flex: 1;
    min-width: 0;

    .homestay-title {
      font-size: 13px;
      color: #1a1a1a;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .homestay-address {
      font-size: 11px;
      color: #8c8c8c;
      margin-top: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.card-dates {
  margin-bottom: 8px;

  .date-range {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: #595959;
  }
}

.card-countdown {
  background: #fff1f0;
  border-radius: 6px;
  padding: 4px 10px;
  margin-bottom: 8px;
  font-size: 12px;

  .countdown-label { color: #ff4d4f; }
  .countdown-time { color: #ff4d4f; font-weight: 700; font-family: 'Courier New', monospace; }
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #f5f5f5;
  padding-top: 10px;

  .amount {
    display: flex;
    align-items: baseline;
    gap: 1px;

    .yen { font-size: 13px; color: #1890ff; font-weight: 600; }
    .price { font-size: 18px; color: #1890ff; font-weight: 700; font-family: 'Courier New', monospace; }
  }

  .card-quick-actions {
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s;

    .order-card:hover & { opacity: 1; }
  }
}

// ==================== 详情卡片（居中模态框） ====================
.detail-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 24px;
  backdrop-filter: blur(2px);
}

.detail-card {
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2), 0 8px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform: scale(0.95) translateY(20px);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;

  &--open {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.detail-card-header {
  padding: 20px 24px;
  min-height: 140px;
  background: linear-gradient(135deg, #f6ffed 0%, #ffffff 100%);
  border-bottom: 1px solid #f0f0f0;
  border-left: 5px solid var(--statusColor, #1890ff);

  .card-header-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .card-header-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .card-order-info {
    .order-no-detail {
      font-size: 13px;
      color: #595959;
      font-family: 'Courier New', monospace;
      font-weight: 600;
    }
    .order-time {
      font-size: 12px;
      color: #8c8c8c;
      margin-top: 3px;
    }
  }

  .close-btn {
    border: none;
    background: rgba(0, 0, 0, 0.04);
    color: #595959;
    transition: all 0.2s;

    &:hover {
      background: rgba(0, 0, 0, 0.08);
      color: #262626;
    }
  }

  .detail-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;

    :deep(.el-button) {
      display: flex;
      align-items: center;
      gap: 5px;
      font-weight: 500;
    }
  }
}

.detail-card-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 4px;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #d9d9d9; border-radius: 3px; }
}

// 信息卡片
.info-card {
  padding: 20px 24px;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.2s;

  &:hover {
    background: #fafafa;
  }

  .info-card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 14px;
  }
}

.footer-card {
  border-bottom: none;
  padding: 16px 24px;

  .footer-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 11px;
    color: #bfbfbf;
  }
}

// 房源详情
.homestay-detail {
  display: flex;
  gap: 16px;

  .detail-homestay-img {
    width: 100px;
    height: 100px;
    border-radius: 12px;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .homestay-detail-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .detail-homestay-title {
    font-size: 16px;
    font-weight: 600;
    color: #1890ff;
    cursor: pointer;
    margin-bottom: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color 0.2s;

    &:hover {
      color: #0969da;
      text-decoration: underline;
    }
  }

  .detail-homestay-addr {
    font-size: 13px;
    color: #8c8c8c;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .detail-dates {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #595959;

    .date-sep {
      color: #8c8c8c;
      margin: 0 4px;
    }
  }
}

// 房客详情
.guest-detail {
  .guest-avatar-row {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 14px;

    .guest-detail-name {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .guest-phone {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      color: #595959;
      margin-top: 5px;
    }
  }

  .guest-list {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .guest-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #595959;
      padding: 8px 12px;
      background: #fafafa;
      border-radius: 8px;

      .guest-idcard {
        color: #8c8c8c;
        font-size: 12px;
        margin-left: auto;
      }
    }
  }
}

// 金额明细
.pricing-table {
  .price-row {
    display: grid;
    grid-template-columns: 70px 1fr auto;
    gap: 12px;
    align-items: center;
    font-size: 14px;
    color: #595959;
    padding: 8px 0;

    .price-label {
      font-weight: 500;
      color: #262626;
    }

    .price-desc {
      color: #8c8c8c;
      font-size: 13px;
    }

    .price-tip {
      font-size: 12px;
      color: #bfbfbf;
    }

    .price-val {
      font-family: 'Courier New', monospace;
      font-weight: 600;
      color: #262626;
      text-align: right;

      &.deposit {
        color: #8c8c8c;
      }
    }
  }

  .price-divider {
    border-top: 1px dashed #f0f0f0;
    margin: 8px 0;
  }

  .total-row {
    .price-label {
      font-weight: 600;
      font-size: 15px;
    }

    .price-val {
      font-size: 20px;
      color: #1890ff;
      font-weight: 700;

      &.total {
        font-size: 20px;
      }
    }
  }
}

// 时间轴
.order-timeline {
  :deep(.el-timeline-item) {
    padding-bottom: 18px;
  }

  :deep(.el-timeline-item__node) {
    background: #d9d9d9;
  }
}

.timeline-content {
  .timeline-event {
    font-size: 14px;
    color: #595959;
  }

  .timeline-desc {
    font-size: 12px;
    color: #8c8c8c;
    margin-left: 8px;
  }

  &.is-current {
    .timeline-event {
      color: #1890ff;
      font-weight: 600;
      animation: timelinePulse 1.6s ease-in-out infinite;
    }
  }
}

@keyframes timelinePulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.03);
    opacity: 0.85;
  }
}

// 备注
.remark-section {
  display: flex;
  flex-direction: column;
  gap: 14px;

  .remark-item {
    .remark-label {
      font-size: 13px;
      color: #8c8c8c;
      margin-bottom: 6px;

      .landlord-only {
        color: #1890ff;
        font-size: 11px;
        margin-left: 6px;
      }
    }

    .remark-value {
      font-size: 14px;
      color: #595959;
      padding: 10px 14px;
      background: #fafafa;
      border-radius: 8px;
      line-height: 1.6;
    }
  }
}

// 模态框过渡动画
.modal-fade-enter-active {
  transition: opacity 0.25s ease;

  .detail-card {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
  }
}

.modal-fade-leave-active {
  transition: opacity 0.2s ease;

  .detail-card {
    transition: transform 0.2s ease, opacity 0.2s ease;
  }
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;

  .detail-card {
    transform: scale(0.92) translateY(30px);
    opacity: 0;
  }
}

// ==================== 弹窗通用 ====================
.static-text {
  font-family: 'Courier New', monospace;
  color: #595959;
}

.guide-templates {
  .guide-templates-label {
    font-size: 13px;
    color: #595959;
    margin-bottom: 10px;
  }

  .template-list {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;

    .template-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border: 1.5px solid #f0f0f0;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      color: #595959;
      transition: all 0.2s;

      &:hover { border-color: #1890ff; color: #1890ff; }
      &.selected { border-color: #1890ff; background: #f0f7ff; color: #1890ff; font-weight: 600; }
    }
  }
}

.checkin-modes {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;

  .checkin-mode {
    flex: 1;
    padding: 16px;
    border: 2px solid #f0f0f0;
    border-radius: 10px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;

    &.active {
      border-color: #1890ff;
      background: #f0f7ff;

      .mode-label { color: #1890ff; }
    }

    .mode-icon { margin-bottom: 8px; display: flex; justify-content: center; }
    .mode-label { font-size: 13px; font-weight: 600; color: #262626; }
    .mode-desc { font-size: 11px; color: #8c8c8c; margin-top: 4px; }
  }
}

.checkin-code-input {
  .code-hint {
    text-align: center;
    font-size: 12px;
    color: #8c8c8c;
    margin-top: 8px;
  }
}

.checklist {
  display: flex;
  flex-direction: column;
  gap: 8px;

  :deep(.el-checkbox) { font-size: 13px; color: #595959; }
}

.upload-hint {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
}

.checkout-summary {
  background: #fafafa;
  border-radius: 8px;
  padding: 12px 16px;
  margin-top: 12px;

  .summary-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: #595959;
    padding: 3px 0;
    font-family: 'Courier New', monospace;

    &.highlight { color: #ff4d4f; }
    &.final {
      font-size: 15px;
      font-weight: 700;
      color: #52c41a;
      border-top: 1px solid #e8e8e8;
      margin-top: 6px;
      padding-top: 8px;
    }
  }
}

// ==================== 响应式 ====================
@media (max-width: 768px) {
  .kanban-board { flex-direction: column; overflow-x: hidden; overflow-y: auto; }
  .kanban-column { max-width: 100%; }
  .detail-modal-overlay { padding: 12px; }
  .detail-card { max-height: 85vh; }
}
</style>
