<template>
  <div class="finance-page">
    <div class="wallet-card">
      <div class="balance-section">
        <div class="label">可提现余额</div>
        <div class="amount">¥{{ availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</div>
        <div class="withdraw-actions">
          <el-tooltip
            effect="dark"
            :disabled="availableBalance >= withdrawRules.minAmount"
            content="可提现余额不足¥100，暂无法提现"
            placement="top"
          >
            <span>
              <el-button
                type="primary"
                round
                :disabled="availableBalance < withdrawRules.minAmount"
                @click="openWithdrawFlow"
              >
                申请提现
              </el-button>
            </span>
          </el-tooltip>
          <div class="withdraw-tip">
            单笔最低¥{{ withdrawRules.minAmount }}，最高¥{{ withdrawRules.maxAmount.toLocaleString() }}，1-3个工作日到账
          </div>
        </div>
      </div>
      <div class="stat-section">
        <div class="stat-item">
          <div class="label">本月收入</div>
          <div class="value">¥{{ monthIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</div>
          <div class="sub">本月已提现：¥{{ monthWithdrawn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</div>
        </div>
        <div class="stat-item">
          <div class="label">冻结中 (进行中订单)</div>
          <div class="value link" @click="frozenDrawerVisible = true">¥{{ frozenAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</div>
          <div class="sub">可提现笔数：{{ withdrawableCount }} 笔</div>
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
            <el-tag :type="getRecordTagType(row.status)">
              {{ getRecordStatusText(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="流水号" width="220" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openRecordDetail(row)">查看详情</el-button>
            <el-button
              v-if="row.status === 'applying'"
              link
              type="danger"
              @click="cancelWithdrawal(row)"
            >
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- ====== 冻结明细抽屉 ====== -->
    <el-drawer v-model="frozenDrawerVisible" title="冻结明细" size="520px" destroy-on-close>
      <div class="drawer-desc">冻结资金来自待入住订单押金/保障金，订单完成并过保障期后自动解冻。</div>
      <el-table :data="frozenItems" style="width: 100%">
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="reason" label="原因" />
        <el-table-column prop="amount" label="冻结金额" width="120">
          <template #default="{ row }">¥{{ row.amount }}</template>
        </el-table-column>
      </el-table>
    </el-drawer>

    <!-- ====== 提现记录详情抽屉 ====== -->
    <el-drawer v-model="recordDetailVisible" title="提现详情" size="520px" destroy-on-close>
      <div v-if="activeRecord" class="record-detail">
        <div class="detail-row"><span class="k">申请单号</span><span class="v">{{ activeRecord.id }}</span></div>
        <div class="detail-row"><span class="k">申请时间</span><span class="v">{{ activeRecord.time }}</span></div>
        <div class="detail-row"><span class="k">提现金额</span><span class="v">¥{{ activeRecord.amount }}</span></div>
        <div class="detail-row"><span class="k">提现账户</span><span class="v">{{ activeRecord.bank }}</span></div>
        <div class="detail-row">
          <span class="k">状态</span>
          <span class="v">
            <el-tag :type="getRecordTagType(activeRecord.status)">{{ getRecordStatusText(activeRecord) }}</el-tag>
          </span>
        </div>
        <div v-if="activeRecord.arrivedAt" class="detail-row"><span class="k">到账时间</span><span class="v">{{ activeRecord.arrivedAt }}</span></div>
        <div v-if="activeRecord.rejectReason" class="detail-row"><span class="k">驳回原因</span><span class="v danger">{{ activeRecord.rejectReason }}</span></div>
      </div>
    </el-drawer>

    <!-- ====== 提现流程（全屏） ====== -->
    <el-dialog
      v-model="withdrawFlowVisible"
      title="申请提现"
      destroy-on-close
      :close-on-click-modal="false"
      class="withdraw-flow-dialog"
    >
      <div class="withdraw-flow">
        <el-steps :active="withdrawStep" finish-status="success" align-center>
          <el-step title="收款账户" />
          <el-step title="提现金额" />
          <el-step title="安全验证" />
          <el-step title="确认提交" />
        </el-steps>

        <div class="withdraw-flow-body">
          <!-- Step0: 没有银行卡时引导绑定 -->
          <div v-if="bankCards.length === 0" class="empty-card-bind">
            <el-empty description="请先绑定您的收款银行卡，支持主流银行储蓄卡" />
            <el-button type="primary" @click="showAddCardForm = true">去绑定银行卡</el-button>

            <transition name="slide-down">
              <div v-if="showAddCardForm" class="bind-card-form">
                <el-form :model="newCardForm" label-width="90px">
                  <el-form-item label="银行名称">
                    <el-input v-model="newCardForm.bankName" placeholder="如：中国工商银行" />
                  </el-form-item>
                  <el-form-item label="卡号">
                    <el-input v-model="newCardForm.cardNo" placeholder="请输入银行卡号" maxlength="23" />
                  </el-form-item>
                  <el-form-item label="持卡人">
                    <el-input v-model="newCardForm.cardHolder" placeholder="请输入持卡人姓名" />
                  </el-form-item>
                  <el-form-item>
                    <el-button @click="showAddCardForm = false">取消</el-button>
                    <el-button type="primary" @click="addBankCard">确认绑定</el-button>
                  </el-form-item>
                </el-form>
              </div>
            </transition>
          </div>

          <template v-else>
            <!-- Step1: 选择银行卡 -->
            <div v-show="withdrawStep === 0" class="step-panel">
              <div class="panel-title">选择收款账户</div>
              <div class="card-list">
                <div
                  v-for="c in bankCards"
                  :key="c.id"
                  class="bank-card-item"
                  :class="{ active: withdrawalForm.bankCardId === c.id }"
                  @click="withdrawalForm.bankCardId = c.id"
                >
                  <div class="bank-icon">{{ c.iconText }}</div>
                  <div class="bank-info">
                    <div class="bank-name">{{ c.bankName }} · {{ c.cardType }}</div>
                    <div class="bank-no">**** {{ c.cardNoLast4 }}</div>
                    <div class="bank-holder">{{ c.cardHolder }}</div>
                  </div>
                  <el-radio :model-value="withdrawalForm.bankCardId" :label="c.id" @change="withdrawalForm.bankCardId = c.id" />
                </div>
              </div>
              <div class="step-actions">
                <el-button text type="primary" @click="showAddCardForm = !showAddCardForm">使用其他银行卡</el-button>
                <el-button type="primary" @click="goNextStep">下一步</el-button>
              </div>

              <transition name="slide-down">
                <div v-if="showAddCardForm" class="bind-card-form compact">
                  <el-form :model="newCardForm" label-width="90px">
                    <el-form-item label="银行名称">
                      <el-input v-model="newCardForm.bankName" placeholder="如：中国工商银行" />
                    </el-form-item>
                    <el-form-item label="卡号">
                      <el-input v-model="newCardForm.cardNo" placeholder="请输入银行卡号" maxlength="23" />
                    </el-form-item>
                    <el-form-item label="持卡人">
                      <el-input v-model="newCardForm.cardHolder" placeholder="请输入持卡人姓名" />
                    </el-form-item>
                    <el-form-item>
                      <el-button @click="showAddCardForm = false">取消</el-button>
                      <el-button type="primary" @click="addBankCard">确认绑定</el-button>
                    </el-form-item>
                  </el-form>
                </div>
              </transition>
            </div>

            <!-- Step2: 输入金额 -->
            <div v-show="withdrawStep === 1" class="step-panel">
              <div class="panel-title">输入提现金额</div>

              <div class="amount-input">
                <span class="yen">¥</span>
                <el-input-number
                  v-model="withdrawalForm.amount"
                  :min="0"
                  :max="withdrawRules.maxAmount"
                  :precision="0"
                  :step="100"
                  controls-position="right"
                  placeholder="请输入提现金额"
                  class="amount-number"
                />
              </div>

              <div class="quick-amounts">
                <el-button @click="setAmount(availableBalance)">全部提现</el-button>
                <el-button @click="setAmount(5000)">¥5,000</el-button>
                <el-button @click="setAmount(10000)">¥10,000</el-button>
              </div>

              <div class="calc-panel">
                <div class="calc-row"><span>提现金额</span><span>¥{{ calc.amount }}</span></div>
                <div class="calc-row"><span>手续费</span><span>¥{{ calc.fee }}</span><span class="muted">（平台承担）</span></div>
                <div class="calc-row strong"><span>实际到账</span><span>¥{{ calc.arrival }}</span></div>
                <div class="calc-row"><span>剩余可提现</span><span>¥{{ calc.remaining }}</span></div>
              </div>

              <transition name="slide-down">
                <div v-if="amountError" class="form-error">
                  <el-icon><WarningFilled /></el-icon>
                  {{ amountError }}
                </div>
              </transition>

              <div class="step-actions">
                <el-button @click="withdrawStep = 0">上一步</el-button>
                <el-button type="primary" :disabled="!!amountError" @click="goNextStep">下一步</el-button>
              </div>
            </div>

            <!-- Step3: 安全验证 -->
            <div v-show="withdrawStep === 2" class="step-panel">
              <div class="panel-title">安全验证</div>
              <div class="security-hint">
                绑定手机：{{ maskedPhone }}
                <span v-if="isNewDevice" class="warn-tag">新设备登录</span>
              </div>

              <el-tabs v-model="verifyMode" type="card">
                <el-tab-pane label="提现密码" name="password">
                  <div v-if="!hasWithdrawPassword" class="no-password">
                    <el-alert title="您尚未设置提现密码" type="warning" :closable="false" show-icon />
                    <div class="no-password-actions">
                      <el-button type="primary" @click="goSetPassword">去设置</el-button>
                    </div>
                  </div>
                  <div v-else class="password-box">
                    <el-input
                      v-model="withdrawalForm.payPassword"
                      maxlength="6"
                      show-password
                      placeholder="请输入6位数字提现密码"
                      @input="withdrawalForm.payPassword = withdrawalForm.payPassword.replace(/\\D/g, '').slice(0, 6)"
                    />
                  </div>
                </el-tab-pane>

                <el-tab-pane label="短信验证码" name="sms">
                  <el-row :gutter="10">
                    <el-col :span="14">
                      <el-input
                        v-model="withdrawalForm.verifyCode"
                        placeholder="请输入短信验证码"
                        maxlength="6"
                        @input="withdrawalForm.verifyCode = withdrawalForm.verifyCode.replace(/\\D/g, '').slice(0, 6)"
                      />
                    </el-col>
                    <el-col :span="10">
                      <el-button @click="sendVerifyCode" :disabled="smsTimer > 0">
                        {{ smsTimer > 0 ? `${smsTimer}s` : '获取验证码' }}
                      </el-button>
                    </el-col>
                  </el-row>
                </el-tab-pane>
              </el-tabs>

              <transition name="slide-down">
                <div v-if="securityError" class="form-error">
                  <el-icon><WarningFilled /></el-icon>
                  {{ securityError }}
                </div>
              </transition>

              <div class="step-actions">
                <el-button @click="withdrawStep = 1">上一步</el-button>
                <el-button type="primary" @click="goNextStep">下一步</el-button>
              </div>
            </div>

            <!-- Step4: 确认与结果 -->
            <div v-show="withdrawStep === 3" class="step-panel">
              <div v-if="submitResult === 'idle'" class="confirm-panel">
                <div class="panel-title">确认信息</div>
                <div class="confirm-card">
                  <div class="confirm-row">
                    <span class="k">到账银行卡</span>
                    <span class="v">{{ selectedCardText }}</span>
                  </div>
                  <div class="confirm-row">
                    <span class="k">提现金额</span>
                    <span class="v strong">¥{{ calc.amount }}</span>
                  </div>
                  <div class="confirm-row">
                    <span class="k">手续费</span>
                    <span class="v">¥{{ calc.fee }}（平台承担）</span>
                  </div>
                  <div class="confirm-row">
                    <span class="k">预计到账</span>
                    <span class="v">{{ etaText }}</span>
                  </div>
                </div>

                <div v-if="withdrawalForm.amount >= withdrawRules.largeAmount" class="risk-warning">
                  <el-icon><WarningFilled /></el-icon>
                  您申请提现 ¥{{ withdrawalForm.amount.toLocaleString() }}，请确认收款账户信息正确，提现后资金将无法撤回
                </div>

                <div class="step-actions">
                  <el-button @click="withdrawStep = 2">上一步</el-button>
                  <el-button type="primary" :loading="submitting" @click="submitWithdrawal">提交申请</el-button>
                </div>
              </div>

              <div v-else-if="submitResult === 'success'" class="result-panel success">
                <div class="result-icon">✓</div>
                <div class="result-title">提现申请已提交</div>
                <div class="result-sub">申请单号：{{ resultOrderNo }}</div>
                <div class="result-sub">预计到账：{{ etaText }}</div>
                <div class="result-actions">
                  <el-button @click="jumpToRecords">查看提现记录</el-button>
                  <el-button type="primary" @click="restartWithdraw">再提一笔</el-button>
                </div>
              </div>

              <div v-else class="result-panel fail">
                <div class="result-icon">×</div>
                <div class="result-title">提现失败</div>
                <div class="result-sub">{{ failReason }}</div>
                <div class="result-actions">
                  <el-button @click="withdrawStep = 1">返回修改</el-button>
                  <el-button type="primary" @click="restartWithdraw">重新发起</el-button>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <template #footer>
        <div class="flow-footer">
          <el-button @click="closeWithdrawFlow">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { WarningFilled } from '@element-plus/icons-vue';

type RecordStatus = 'applying' | 'approved' | 'success' | 'rejected'
type VerifyMode = 'password' | 'sms'

const availableBalance = ref(12450)
const frozenAmount = ref(3200)
const monthIncome = ref(24800)
const monthWithdrawn = ref(8000)
const withdrawableCount = ref(3)

const withdrawRules = {
  minAmount: 100,
  maxAmount: 50000,
  multiple: 100,
  largeAmount: 20000,
  maxTimesPer24h: 3,
}

// ====== 冻结明细 ======
const frozenDrawerVisible = ref(false)
const frozenItems = ref([
  { orderNo: 'ORDER20260301001', reason: '待入住订单押金冻结', amount: 1200 },
  { orderNo: 'ORDER20260312002', reason: '待入住订单押金冻结', amount: 800 },
  { orderNo: 'ORDER20260320003', reason: '待入住订单押金冻结', amount: 1200 },
])

// ====== 提现记录 ======
type WithdrawRecord = {
  id: string
  time: string
  amount: number
  bank: string
  status: RecordStatus
  arrivedAt?: string
  rejectReason?: string
}

const records = ref<WithdrawRecord[]>([
  { id: 'W202310010001', time: '2023-10-01 10:00:00', amount: 5000, bank: '招商银行 (尾号8888)', status: 'success', arrivedAt: '2023-10-03 11:20:00' },
  { id: 'W202309150002', time: '2023-09-15 14:30:00', amount: 8200, bank: '建设银行 (尾号6666)', status: 'success', arrivedAt: '2023-09-17 09:12:00' },
  { id: 'W202603230003', time: '2026-03-23 10:12:00', amount: 1200, bank: '中国工商银行 (尾号8888)', status: 'applying' },
  { id: 'W202603220004', time: '2026-03-22 16:40:00', amount: 5000, bank: '中国建设银行 (尾号6666)', status: 'approved' },
  { id: 'W202603210005', time: '2026-03-21 09:05:00', amount: 10000, bank: '中国工商银行 (尾号8888)', status: 'rejected', rejectReason: '银行卡异常，请更换银行卡后重试' },
])

function getRecordTagType(status: RecordStatus) {
  if (status === 'applying') return 'primary'
  if (status === 'approved') return 'success'
  if (status === 'success') return 'success'
  return 'danger'
}

function getRecordStatusText(row: WithdrawRecord) {
  if (row.status === 'applying') return '申请中'
  if (row.status === 'approved') return '审核通过 · 银行处理中'
  if (row.status === 'success') return row.arrivedAt ? `已到账 · ${row.arrivedAt}` : '已到账'
  return row.rejectReason ? `已驳回 · ${row.rejectReason}` : '已驳回'
}

// ====== 记录详情 ======
const recordDetailVisible = ref(false)
const activeRecord = ref<WithdrawRecord | null>(null)
function openRecordDetail(row: WithdrawRecord) {
  activeRecord.value = row
  recordDetailVisible.value = true
}

async function cancelWithdrawal(row: WithdrawRecord) {
  try {
    await ElMessageBox.confirm('确认取消该笔提现申请？（审核通过后不可取消）', '取消提现', {
      confirmButtonText: '确认取消',
      cancelButtonText: '返回',
      type: 'warning'
    })
  } catch {
    return
  }
  row.status = 'rejected'
  row.rejectReason = '用户取消申请'
  ElMessage.success('已取消提现申请')
}

// ====== 银行卡 ======
type BankCard = {
  id: number
  bankName: string
  cardType: string
  cardNoLast4: string
  cardHolder: string
  isDefault: boolean
  iconText: string
}

const bankCards = ref<BankCard[]>([
  { id: 1, bankName: '中国工商银行', cardType: '储蓄卡', cardNoLast4: '8888', cardHolder: 'stewie', isDefault: true, iconText: '工' },
  { id: 2, bankName: '中国建设银行', cardType: '储蓄卡', cardNoLast4: '6666', cardHolder: 'stewie', isDefault: false, iconText: '建' },
])

const showAddCardForm = ref(false)
const newCardForm = reactive({ bankName: '', cardNo: '', cardHolder: '' })
function addBankCard() {
  if (!newCardForm.bankName || !newCardForm.cardNo || !newCardForm.cardHolder) {
    ElMessage.warning('请填写完整的银行卡信息')
    return
  }
  const last4 = newCardForm.cardNo.replace(/\s/g, '').slice(-4)
  const nextId = Math.max(0, ...bankCards.value.map(x => x.id)) + 1
  bankCards.value.push({
    id: nextId,
    bankName: newCardForm.bankName,
    cardType: '储蓄卡',
    cardNoLast4: last4 || '0000',
    cardHolder: newCardForm.cardHolder,
    isDefault: bankCards.value.length === 0,
    iconText: newCardForm.bankName.slice(0, 1) || '银'
  })
  if (bankCards.value.length === 1) withdrawalForm.bankCardId = nextId
  Object.assign(newCardForm, { bankName: '', cardNo: '', cardHolder: '' })
  showAddCardForm.value = false
  ElMessage.success('银行卡已绑定')
}

// ====== 提现流程 ======
const withdrawFlowVisible = ref(false)
const withdrawStep = ref(0)
const submitting = ref(false)
const submitResult = ref<'idle' | 'success' | 'fail'>('idle')
const failReason = ref('')
const resultOrderNo = ref('')

const withdrawalForm = reactive({
  bankCardId: bankCards.value.find(x => x.isDefault)?.id || bankCards.value[0]?.id || 1,
  amount: 0,
  payPassword: '',
  verifyCode: '',
})

// 设备与安全状态（mock）
const maskedPhone = '138****8888'
const verifyMode = ref<VerifyMode>('sms')
const smsTimer = ref(0)
let smsInterval: ReturnType<typeof setInterval> | null = null

const hasWithdrawPassword = computed(() => {
  return localStorage.getItem('host_withdraw_password_set') === '1'
})

const isNewDevice = computed(() => {
  const deviceId = 'device_' + navigator.userAgent
  const last = localStorage.getItem('host_last_device')
  if (!last) {
    localStorage.setItem('host_last_device', deviceId)
    return false
  }
  return last !== deviceId
})

function openWithdrawFlow() {
  // 频繁提现限制（24h）
  const now = Date.now()
  const times24h = records.value.filter(r => now - new Date(r.time).getTime() < 24 * 3600 * 1000).length
  if (times24h >= withdrawRules.maxTimesPer24h) {
    ElMessage.warning('今日提现次数已达上限，请明日再试')
    return
  }

  withdrawFlowVisible.value = true
  withdrawStep.value = bankCards.value.length === 0 ? 0 : 0
  submitResult.value = 'idle'
  failReason.value = ''
  resultOrderNo.value = ''
  showAddCardForm.value = false
  withdrawalForm.amount = 0
  withdrawalForm.payPassword = ''
  withdrawalForm.verifyCode = ''
  // 新设备：默认短信验证
  verifyMode.value = 'sms'
}

function closeWithdrawFlow() {
  withdrawFlowVisible.value = false
}

function setAmount(val: number) {
  const capped = Math.min(val, withdrawRules.maxAmount, availableBalance.value)
  withdrawalForm.amount = Math.floor(capped / withdrawRules.multiple) * withdrawRules.multiple
}

const calc = computed(() => {
  const amount = withdrawalForm.amount || 0
  const fee = 0
  const arrival = Math.max(0, amount - fee)
  const remaining = Math.max(0, availableBalance.value - amount)
  return { amount, fee, arrival, remaining }
})

const amountError = computed(() => {
  const a = withdrawalForm.amount
  if (!a) return '请输入提现金额'
  if (a < withdrawRules.minAmount) return `单笔最低¥${withdrawRules.minAmount}`
  if (a > withdrawRules.maxAmount) return `单笔最高¥${withdrawRules.maxAmount.toLocaleString()}`
  if (a > availableBalance.value) return '不能提现超过可提现余额'
  if (a % withdrawRules.multiple !== 0) return `提现金额需为${withdrawRules.multiple}的倍数`
  return ''
})

const securityError = computed(() => {
  // 新设备：强制双重验证（短信+密码）
  const needDouble = isNewDevice.value
  const hasPwdOk = hasWithdrawPassword.value && /^\d{6}$/.test(withdrawalForm.payPassword)
  const smsOk = /^\d{6}$/.test(withdrawalForm.verifyCode)

  if (needDouble) {
    if (!hasWithdrawPassword.value) return '新设备提现需先设置提现密码，并完成短信验证'
    if (!hasPwdOk) return '请输入6位数字提现密码'
    if (!smsOk) return '请输入6位短信验证码'
    return ''
  }

  if (verifyMode.value === 'password') {
    if (!hasWithdrawPassword.value) return '您尚未设置提现密码'
    if (!hasPwdOk) return '请输入6位数字提现密码'
    return ''
  }
  if (!smsOk) return '请输入6位短信验证码'
  return ''
})

const selectedCardText = computed(() => {
  const c = bankCards.value.find(x => x.id === withdrawalForm.bankCardId)
  if (!c) return '-'
  return `${c.bankName}（尾号${c.cardNoLast4}）`
})

const etaText = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 3)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `预计${y}-${m}-${day}到账（1-3个工作日）`
})

function goSetPassword() {
  ElMessage.info('请到 设置/提现安全 中设置提现密码')
}

function sendVerifyCode() {
  if (smsTimer.value > 0) return
  smsTimer.value = 60
  if (smsInterval) clearInterval(smsInterval)
  smsInterval = setInterval(() => {
    smsTimer.value--
    if (smsTimer.value <= 0 && smsInterval) {
      clearInterval(smsInterval)
      smsInterval = null
    }
  }, 1000)
  ElMessage.success('验证码已发送')
}

async function goNextStep() {
  if (withdrawStep.value === 0) {
    if (!withdrawalForm.bankCardId) {
      ElMessage.warning('请选择银行卡')
      return
    }
    withdrawStep.value = 1
    return
  }
  if (withdrawStep.value === 1) {
    if (amountError.value) {
      ElMessage.warning(amountError.value)
      return
    }
    withdrawStep.value = 2
    return
  }
  if (withdrawStep.value === 2) {
    if (securityError.value) {
      ElMessage.warning(securityError.value)
      return
    }
    withdrawStep.value = 3
    return
  }
}

function genWithdrawId() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const seq = String(Math.floor(Math.random() * 900) + 100)
  return `W${y}${m}${day}${seq}`
}

let submitGuard = false
async function submitWithdrawal() {
  if (submitGuard) return
  if (amountError.value) {
    ElMessage.warning(amountError.value)
    return
  }
  if (securityError.value) {
    ElMessage.warning(securityError.value)
    return
  }

  // 大额二次确认
  if (withdrawalForm.amount >= withdrawRules.largeAmount) {
    try {
      await ElMessageBox.confirm(
        `您申请提现 ¥${withdrawalForm.amount.toLocaleString()}，请确认收款账户信息正确，提现后资金将无法撤回。`,
        '大额提现确认',
        { confirmButtonText: '确认提现', cancelButtonText: '返回修改', type: 'warning' }
      )
    } catch {
      return
    }
  }

  submitGuard = true
  submitting.value = true

  // 防重复点击：1s 内只允许一次
  setTimeout(() => { submitGuard = false }, 1000)

  await new Promise(r => setTimeout(r, 900))

  // mock 风控失败概率
  const random = Math.random()
  if (withdrawalForm.amount > availableBalance.value) {
    submitResult.value = 'fail'
    failReason.value = '余额不足'
  } else if (random > 0.92) {
    submitResult.value = 'fail'
    failReason.value = '触发风控，请稍后再试'
  } else if (random > 0.85) {
    submitResult.value = 'fail'
    failReason.value = '银行卡异常，请更换银行卡后重试'
  } else {
    submitResult.value = 'success'
    resultOrderNo.value = genWithdrawId()
    // 写入列表 & 扣减余额
    const card = bankCards.value.find(x => x.id === withdrawalForm.bankCardId)
    records.value.unshift({
      id: resultOrderNo.value,
      time: new Date().toISOString().replace('T', ' ').slice(0, 19),
      amount: withdrawalForm.amount,
      bank: `${card?.bankName || '银行卡'} (尾号${card?.cardNoLast4 || '0000'})`,
      status: 'applying'
    })
    availableBalance.value = Math.max(0, availableBalance.value - withdrawalForm.amount)
  }

  submitting.value = false
}

function jumpToRecords() {
  withdrawFlowVisible.value = false
  ElMessage.success('已更新提现记录')
}

function restartWithdraw() {
  submitResult.value = 'idle'
  failReason.value = ''
  resultOrderNo.value = ''
  withdrawStep.value = bankCards.value.length === 0 ? 0 : 0
  withdrawalForm.amount = 0
  withdrawalForm.payPassword = ''
  withdrawalForm.verifyCode = ''
}

onUnmounted(() => {
  if (smsInterval) clearInterval(smsInterval)
})
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
      .withdraw-actions {
        display: flex;
        flex-direction: column;
        gap: 6px;
        .withdraw-tip { font-size: 12px; opacity: 0.85; }
      }
    }
    
    .stat-section {
      display: flex;
      gap: 48px;
      
      .stat-item {
        .label { opacity: 0.8; font-size: 12px; margin-bottom: 4px; }
        .value { font-size: 20px; font-weight: 600; }
        .value.link { cursor: pointer; text-decoration: underline; text-underline-offset: 4px; }
        .sub { font-size: 12px; opacity: 0.85; margin-top: 6px; }
      }
    }
  }
}

.drawer-desc {
  font-size: 13px;
  color: #8c8c8c;
  margin-bottom: 12px;
}

.record-detail {
  display: flex;
  flex-direction: column;
  gap: 10px;
  .detail-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px;
    background: #fafafa;
    border-radius: 8px;
    .k { color: #8c8c8c; font-size: 13px; }
    .v { color: #262626; font-size: 13px; font-weight: 500; }
    .v.danger { color: #ff4d4f; font-weight: 600; }
  }
}

:deep(.withdraw-flow-dialog) {
  .el-dialog__body {
    padding-top: 10px;
  }
}

.withdraw-flow {
  padding: 6px 6px 0;
}

.withdraw-flow-body {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}

.step-panel {
  width: 920px;
  max-width: 92vw;
  background: white;
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
}

.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: #262626;
  margin-bottom: 14px;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bank-card-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 14px;
  border: 1.5px solid #f0f0f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s;
  &:hover { border-color: #1890ff; background: #f0f7ff; }
  &.active { border-color: #1890ff; box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.12); }
  .bank-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
    color: white;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }
  .bank-info {
    flex: 1;
    min-width: 0;
    .bank-name { font-size: 14px; font-weight: 700; color: #262626; }
    .bank-no { font-size: 13px; color: #595959; margin-top: 4px; font-family: 'Courier New', monospace; }
    .bank-holder { font-size: 12px; color: #8c8c8c; margin-top: 2px; }
  }
}

.step-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.bind-card-form {
  margin-top: 14px;
  padding: 12px 14px;
  background: #fafafa;
  border-radius: 12px;
  &.compact { margin-top: 10px; }
}

.amount-input {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f5f7fa;
  border-radius: 12px;
  padding: 14px 16px;
  .yen { font-size: 22px; font-weight: 800; color: #1890ff; }
  .amount-number { flex: 1; }
  :deep(.el-input-number) { width: 100%; }
  :deep(.el-input__inner) { font-size: 22px; font-weight: 800; color: #262626; }
}

.quick-amounts {
  margin-top: 12px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.calc-panel {
  margin-top: 14px;
  padding: 12px 14px;
  background: #fafafa;
  border-radius: 12px;
  .calc-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    font-size: 13px;
    color: #595959;
    .muted { color: #bfbfbf; margin-left: 6px; }
    &.strong { font-weight: 800; color: #262626; }
  }
}

.form-error {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff1f0;
  border: 1px solid #ffccc7;
  color: #ff4d4f;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 13px;
}

.security-hint {
  font-size: 13px;
  color: #595959;
  margin-bottom: 12px;
  .warn-tag {
    margin-left: 8px;
    font-size: 12px;
    color: #ff4d4f;
    background: #fff1f0;
    border: 1px solid #ffccc7;
    padding: 2px 8px;
    border-radius: 999px;
    font-weight: 700;
  }
}

.no-password-actions {
  margin-top: 10px;
}

.confirm-card {
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 12px 14px;
  background: #fafafa;
  .confirm-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    font-size: 13px;
    .k { color: #8c8c8c; }
    .v { color: #262626; font-weight: 600; }
    .v.strong { font-size: 16px; color: #1890ff; }
  }
}

.risk-warning {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  color: #ad6800;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 13px;
}

.result-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0 10px;
  .result-icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    font-weight: 900;
    margin-bottom: 12px;
  }
  &.success .result-icon { background: #f6ffed; color: #52c41a; border: 2px solid #b7eb8f; }
  &.fail .result-icon { background: #fff1f0; color: #ff4d4f; border: 2px solid #ffccc7; }
  .result-title { font-size: 18px; font-weight: 800; color: #262626; margin-bottom: 6px; }
  .result-sub { font-size: 13px; color: #8c8c8c; margin-top: 4px; }
  .result-actions { margin-top: 14px; display: flex; gap: 10px; }
}

.flow-footer {
  display: flex;
  justify-content: flex-end;
}

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
