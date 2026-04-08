<template>
  <div class="auth-container">
    <!-- 左侧动画角色区 -->
    <div class="character-side" v-if="showCharacters">
      <div class="characters">
        <!-- 紫色角色 -->
        <div 
          class="char purple" 
          :class="{ 
            peeking: isPasswordVisible,
            typing: isTyping 
          }"
        >
          <div class="eye" :class="{ blinking: isPurpleBlinking }"></div>
          <div class="eye" :class="{ blinking: isPurpleBlinking }"></div>
        </div>
        
        <!-- 黑色角色 -->
        <div 
          class="char black" 
          :class="{ looking: isTyping }"
        >
          <div class="eye" :class="{ blinking: isBlackBlinking }"></div>
          <div class="eye" :class="{ blinking: isBlackBlinking }"></div>
        </div>

        <!-- 装饰性圆点 -->
        <div class="decorative-dot dot-1"></div>
        <div class="decorative-dot dot-2"></div>
        <div class="decorative-dot dot-3"></div>
      </div>
      <h2>发现独特的住宿体验</h2>
      <p>探索精选民宿，像当地人一样旅行</p>
      
      <!-- 装饰性波浪 -->
      <div class="wave wave-1"></div>
      <div class="wave wave-2"></div>
    </div>

    <!-- 右侧卡片区 -->
    <div class="card-side-wrapper">
      <div class="logo-header">
        <svg width="120" height="40" viewBox="0 0 180 60">
          <path d="M20 45 L20 25 L30 15 L40 25 L40 45 M30 15 L30 10 M25 45 L25 35 L35 35 L35 45 M45 45 L45 20 Q50 15 55 20 L55 45" 
                stroke="#FF5A5F" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <text x="70" y="36" font-family="PingFang SC" font-size="24" font-weight="500" fill="#484848">栖居</text>
        </svg>
      </div>

      <!-- 切换标签 -->
      <div class="switch-tabs">
        <button 
          class="tab-btn" 
          :class="{ active: !isRegister }"
          @click="isRegister = false"
        >
          登录
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: isRegister }"
          @click="isRegister = true"
        >
          成为房东
        </button>
        <div class="tab-indicator" :class="{ right: isRegister }"></div>
      </div>

      <!-- 卡片容器 -->
      <div class="flip-wrapper">
        <!-- 登录表单（始终保留 DOM，仅 v-if 控制显示） -->
        <div class="card-content" v-show="!isRegister">
          <div class="title">欢迎回家</div>
            
            <!-- 登录方式切换 -->
            <div class="login-mode-switch">
              <span 
                :class="{ active: loginMode === 'code' }"
                @click="loginMode = 'code'"
              >
                验证码登录
              </span>
              <span class="divider">|</span>
              <span 
                :class="{ active: loginMode === 'password' }"
                @click="loginMode = 'password'"
              >
                密码登录
              </span>
            </div>

            <form class="form" @submit.prevent="handleLogin">
              <!-- 手机号验证码登录 -->
              <template v-if="loginMode === 'code'">
                <div class="input-group">
                  <input 
                    class="form-input" 
                    v-model="loginForm.phone" 
                    placeholder="请输入手机号"
                    type="tel"
                    maxlength="11"
                    @focus="isTyping = true"
                    @blur="isTyping = false"
                    @input="validatePhone(loginForm.phone)"
                  >
                  <span class="input-icon">📱</span>
                  <span 
                    class="input-error" 
                    v-if="loginFormErrors.phone"
                  >
                    {{ loginFormErrors.phone }}
                  </span>
                </div>

                <div class="input-group">
                  <input 
                    class="form-input" 
                    v-model="loginForm.code" 
                    placeholder="请输入验证码" 
                    type="text"
                    maxlength="6"
                  >
                  <button 
                    type="button" 
                    class="code-btn" 
                    :class="{ loading: codeState.isSending }"
                  @click="sendCode()"
                    :disabled="codeState.countdown > 0 || codeState.isSending"
                  >
                    <span v-if="codeState.countdown > 0">{{ codeState.countdown }}s</span>
                    <span v-else-if="codeState.isSending">发送中...</span>
                    <span v-else>获取验证码</span>
                  </button>
                </div>
              </template>

              <!-- 密码登录 -->
              <template v-else>
                <div class="input-group">
                  <input
                    class="form-input"
                    v-model="loginForm.username"
                    placeholder="请输入用户名/手机号/邮箱"
                    type="text"
                    @focus="isTyping = true"
                    @blur="isTyping = false"
                  >
                  <span class="input-icon">👤</span>
                </div>

                <div class="input-group">
                  <input
                    class="form-input"
                    v-model="loginForm.password"
                    placeholder="请输入密码"
                    :type="showPassword ? 'text' : 'password'"
                    @focus="handlePasswordFocus"
                    @blur="handlePasswordBlur"
                  >
                  <button
                    type="button"
                    class="password-toggle"
                    @click="showPassword = !showPassword"
                  >
                    {{ showPassword ? '🙈' : '👀' }}
                  </button>
                </div>
              </template>

              <div class="options">
                <label class="remember">
                  <input type="checkbox" v-model="loginForm.remember">
                  <span>30天内自动登录</span>
                </label>
              </div>

                <button 
                  class="submit-btn primary" 
                  type="submit"
                  :disabled="isLoginLoading"
                >
                <span class="loading-spinner" v-if="isLoginLoading"></span>
                <span v-else>立即登录</span>
              </button>
              
              <div class="divider">
                <span>或</span>
              </div>
              
              <button type="button" class="submit-btn secondary" @click="wxLogin">
                微信一键登录
              </button>
            </form>
          </div>

          <!-- 房东入驻三步表单 -->
          <div class="card-content host-content" v-show="isRegister">
            <div class="title">加入栖居 · 开启民宿经营</div>

            <!-- 步骤条：el-steps 简洁横向，背景透明 -->
            <el-steps :active="hostStep" finish-status="success" class="host-steps-el">
              <el-step title="基础信息" :icon="User" />
              <el-step title="账户设置" :icon="Lock" />
              <el-step title="经营信息" :icon="House" />
            </el-steps>

            <!-- 步骤1：基础信息 -->
            <div v-show="hostStep === 0" class="step-form">
              <div class="input-group">
                <input
                  class="form-input"
                  v-model="hostForm.realName"
                  placeholder="真实姓名（需与身份证一致）"
                  type="text"
                  maxlength="10"
                  @input="hostErrors.realName = ''"
                >
                <span class="input-icon">👤</span>
                <span class="input-error" v-if="hostErrors.realName">
                  {{ hostErrors.realName }}
                </span>
              </div>

              <div class="input-group">
                <input
                  class="form-input"
                  v-model="hostForm.idCard"
                  placeholder="身份证号（18位）"
                  type="text"
                  maxlength="18"
                  @input="hostErrors.idCard = ''"
                >
                <span class="input-icon">🪪</span>
                <span class="input-error" v-if="hostErrors.idCard">
                  {{ hostErrors.idCard }}
                </span>
              </div>

              <div class="input-group">
                <input
                  class="form-input"
                  v-model="hostForm.phone"
                  placeholder="手机号"
                  type="tel"
                  maxlength="11"
                  @input="hostErrors.phone = ''"
                >
                <span class="input-icon">📱</span>
                <button
                  type="button"
                  class="code-btn"
                  :class="{ loading: hostCodeState.isSending }"
                  @click="sendHostCode"
                  :disabled="hostCodeState.countdown > 0 || hostCodeState.isSending"
                >
                  <span v-if="hostCodeState.countdown > 0">{{ hostCodeState.countdown }}s</span>
                  <span v-else-if="hostCodeState.isSending">发送中...</span>
                  <span v-else>获取验证码</span>
                </button>
                <span class="input-error" v-if="hostErrors.phone">
                  {{ hostErrors.phone }}
                </span>
              </div>

              <div class="input-group">
                <input
                  class="form-input"
                  v-model="hostForm.verifyCode"
                  placeholder="验证码（6位）"
                  type="text"
                  maxlength="6"
                  @input="hostErrors.verifyCode = ''"
                >
                <span class="input-icon">🔐</span>
                <span class="input-error" v-if="hostErrors.verifyCode">
                  {{ hostErrors.verifyCode }}
                </span>
              </div>

              <div class="form-actions">
                <button class="submit-btn primary" @click="nextHostStep">
                  下一步
                </button>
              </div>
            </div>

            <!-- 步骤2：账户设置 -->
            <div v-show="hostStep === 1" class="step-form">
              <div class="input-group">
                <input
                  class="form-input"
                  v-model="hostForm.username"
                  placeholder="设置登录账号（6-20位英文/数字）"
                  type="text"
                  maxlength="20"
                  @input="hostErrors.username = ''"
                >
                <span class="input-icon">👤</span>
                <span class="input-error" v-if="hostErrors.username">
                  {{ hostErrors.username }}
                </span>
              </div>

              <div class="input-group">
                <input
                  class="form-input"
                  v-model="hostForm.password"
                  placeholder="设置密码（至少6位，需包含字母和数字）"
                  :type="showStep2Pwd ? 'text' : 'password'"
                  maxlength="20"
                  @input="hostErrors.password = ''"
                >
                <button
                  type="button"
                  class="password-toggle"
                  @click="showStep2Pwd = !showStep2Pwd"
                >
                  {{ showStep2Pwd ? '🙈' : '👀' }}
                </button>
                <span class="input-error" v-if="hostErrors.password">
                  {{ hostErrors.password }}
                </span>
              </div>

              <div class="input-group">
                <input
                  class="form-input"
                  v-model="hostForm.confirmPassword"
                  placeholder="确认密码"
                  :type="showStep2Pwd ? 'text' : 'password'"
                  maxlength="20"
                  @input="hostErrors.confirmPassword = ''"
                >
                <span class="input-icon">🔒</span>
                <span class="input-error" v-if="hostErrors.confirmPassword">
                  {{ hostErrors.confirmPassword }}
                </span>
              </div>

              <div class="form-actions">
                <button class="submit-btn secondary" @click="prevHostStep">
                  上一步
                </button>
                <button class="submit-btn primary" @click="nextHostStep">
                  下一步
                </button>
              </div>
            </div>

            <!-- 步骤3：经营信息 -->
            <div v-show="hostStep === 2" class="step-form">
              <div class="input-group">
                <el-cascader
                  v-model="hostForm.location"
                  :options="locationOptions"
                  placeholder="请选择房源所在地区"
                  :props="{
                    expandTrigger: 'hover',
                    emitPath: true,
                    value: 'value',
                    label: 'label'
                  }"
                  @change="hostErrors.location = ''"
                  class="cascader-input"
                />
                <span class="input-icon cascader-icon">📍</span>
                <span class="input-error" v-if="hostErrors.location">
                  {{ hostErrors.location }}
                </span>
              </div>

              <div class="property-type-section">
                <div class="section-label">房源类型</div>
                <div class="property-type-cards">
                  <div
                    class="property-type-card"
                    :class="{ selected: hostForm.propertyType === 'entire' }"
                    @click="hostForm.propertyType = 'entire'; hostErrors.propertyType = ''"
                  >
                    <span class="type-icon">🏠</span>
                    <span class="type-name">整套出租</span>
                  </div>
                  <div
                    class="property-type-card"
                    :class="{ selected: hostForm.propertyType === 'private' }"
                    @click="hostForm.propertyType = 'private'; hostErrors.propertyType = ''"
                  >
                    <span class="type-icon">🛏️</span>
                    <span class="type-name">独立房间</span>
                  </div>
                  <div
                    class="property-type-card"
                    :class="{ selected: hostForm.propertyType === 'shared' }"
                    @click="hostForm.propertyType = 'shared'; hostErrors.propertyType = ''"
                  >
                    <span class="type-icon">🧑‍🤝‍🧑</span>
                    <span class="type-name">合住房间</span>
                  </div>
                </div>
                <span class="input-error" v-if="hostErrors.propertyType">
                  {{ hostErrors.propertyType }}
                </span>
              </div>

              <div class="form-actions">
                <button class="submit-btn secondary" @click="prevHostStep">
                  上一步
                </button>
                <button
                  class="submit-btn primary"
                  :class="{ loading: isHostSubmitting }"
                  @click="submitHostApplication"
                  :disabled="isHostSubmitting"
                >
                  <span class="loading-spinner" v-if="isHostSubmitting"></span>
                  <span v-else>提交入驻申请</span>
                </button>
              </div>
            </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, House } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { authApi } from '@/api/modules/auth'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 常量
const PHONE_REGEX = /^1[3-9]\d{9}$/
const COUNTDOWN_SECONDS = 60

// 页面状态
const isRegister = ref(route.query.mode === 'register')
const loginMode = ref<'code' | 'password'>(route.query.mode === 'password' ? 'password' : 'code')
const isTyping = ref(false)
const showCharacters = ref(true)

// 登录模式
const showPassword = ref(false)
const showRegisterPassword = ref(false)

// 加载状态
const isLoginLoading = ref(false)
const isRegisterLoading = ref(false)

// 房东入驻步骤
const hostStep = ref(0)
const isHostSubmitting = ref(false)

// 房东入驻表单数据
const hostForm = reactive({
  // 步骤1：基础信息
  realName: '',
  idCard: '',
  phone: '',
  verifyCode: '',
  // 步骤2：账户设置
  username: '',
  password: '',
  confirmPassword: '',
  // 步骤3：经营信息
  location: [] as number[],
  propertyType: ''
})

// 房东入驻表单错误
const hostErrors = reactive({
  realName: '',
  idCard: '',
  phone: '',
  verifyCode: '',
  username: '',
  password: '',
  confirmPassword: '',
  location: '',
  propertyType: ''
})

// 验证码相关
const hostCodeState = reactive({
  countdown: 0,
  isSending: false
})
let hostCountdownTimer: ReturnType<typeof setInterval> | null = null

// 步骤2密码可见性
const showStep2Pwd = ref(false)

// 省市区选项数据（简化版）
const locationOptions = [
  {
    value: 110000,
    label: '北京市',
    children: [
      { value: 110100, label: '市辖区', children: [
        { value: 110101, label: '东城区' },
        { value: 110102, label: '西城区' },
        { value: 110105, label: '朝阳区' },
        { value: 110106, label: '丰台区' },
        { value: 110107, label: '石景山区' },
        { value: 110108, label: '海淀区' },
      ]}
    ]
  },
  {
    value: 310000,
    label: '上海市',
    children: [
      { value: 310100, label: '市辖区', children: [
        { value: 310101, label: '黄浦区' },
        { value: 310104, label: '徐汇区' },
        { value: 310105, label: '长宁区' },
        { value: 310106, label: '静安区' },
        { value: 310107, label: '普陀区' },
        { value: 310109, label: '虹口区' },
      ]}
    ]
  },
  {
    value: 440000,
    label: '广东省',
    children: [
      { value: 440100, label: '广州市', children: [
        { value: 440103, label: '荔湾区' },
        { value: 440104, label: '越秀区' },
        { value: 440105, label: '海珠区' },
        { value: 440106, label: '天河区' },
        { value: 440111, label: '白云区' },
      ]},
      { value: 440300, label: '深圳市', children: [
        { value: 440303, label: '罗湖区' },
        { value: 440304, label: '福田区' },
        { value: 440305, label: '南山区' },
        { value: 440306, label: '宝安区' },
      ]}
    ]
  },
  {
    value: 330000,
    label: '浙江省',
    children: [
      { value: 330100, label: '杭州市', children: [
        { value: 330102, label: '上城区' },
        { value: 330105, label: '拱墅区' },
        { value: 330106, label: '西湖区' },
        { value: 330108, label: '滨江区' },
      ]},
      { value: 330200, label: '宁波市', children: [
        { value: 330203, label: '海曙区' },
        { value: 330205, label: '江北区' },
      ]}
    ]
  },
  {
    value: 510000,
    label: '四川省',
    children: [
      { value: 510100, label: '成都市', children: [
        { value: 510104, label: '锦江区' },
        { value: 510105, label: '青羊区' },
        { value: 510106, label: '金牛区' },
        { value: 510107, label: '武侯区' },
        { value: 510108, label: '成华区' },
      ]}
    ]
  }
]

// 登录表单
const loginForm = reactive({
  phone: '',
  code: '',
  username: '',
  email: '',
  password: '',
  remember: false
})

// 登录表单验证错误
const loginFormErrors = reactive({
  phone: '',
  code: '',
  username: '',
  email: '',
  password: ''
})

// 验证码状态
const codeState = reactive({
  countdown: 0,
  isSending: false
})
let countdownTimer: ReturnType<typeof setInterval> | null = null

// 角色动画状态
const isPasswordVisible = ref(false)
const isPurpleBlinking = ref(false)
const isBlackBlinking = ref(false)

// 表单验证
const validatePhone = (phone: string) => {
  loginFormErrors.phone = phone && !PHONE_REGEX.test(phone) ? '请输入正确的手机号' : ''
  return loginFormErrors.phone === ''
}

// 发送验证码
const sendCode = async () => {
  if (codeState.countdown > 0) return

  if (!loginForm.phone) {
    loginFormErrors.phone = '请输入手机号'
    return
  }
  if (!PHONE_REGEX.test(loginForm.phone)) {
    loginFormErrors.phone = '请输入正确的手机号'
    return
  }

  codeState.isSending = true

  try {
    await authApi.sendVerifyCode(loginForm.phone)
    startCountdown()
    ElMessage.success('验证码已发送')
  } catch (error: any) {
    ElMessage.error(error.message || '发送失败，请重试')
  } finally {
    codeState.isSending = false
  }
}

// 登录倒计时
const startCountdown = () => {
  codeState.countdown = COUNTDOWN_SECONDS
  countdownTimer = setInterval(() => {
    codeState.countdown--
    if (codeState.countdown <= 0 && countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
}

// 登录提交
const handleLogin = async () => {
  const { phone, code, username, password } = loginForm

  if (loginMode.value === 'code') {
    if (!phone || !code) {
      ElMessage.error('请填写完整信息')
      return
    }
  } else {
    if (!username || !password) {
      ElMessage.error('请填写完整信息')
      return
    }
  }

  isLoginLoading.value = true

  try {
    let response

    if (loginMode.value === 'code') {
      // 验证码登录 - 调用后端API
      response = await authApi.loginByCode({
        phone,
        code
      })
    } else {
      // 密码登录 - 调用后端API
      const loginAccount = username || phone
      response = await authApi.login({
        phone: loginAccount,
        password: password
      })
    }

    userStore.login(response.user, response.token)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error: any) {
    console.error('登录失败:', error)
    ElMessage.error(error.message || '登录失败')
    return false
  } finally {
    isLoginLoading.value = false
  }
}

// 密码输入处理
const handlePasswordFocus = () => {
  isTyping.value = true
  isPasswordVisible.value = true
}

const handlePasswordBlur = () => {
  isTyping.value = false
  if (!showPassword.value) {
    isPasswordVisible.value = false
  }
}

// 监听登录模式
watch(loginMode, (mode) => {
  isPasswordVisible.value = mode === 'password'
})

// 房东入驻倒计时
const startHostCountdown = () => {
  hostCodeState.countdown = COUNTDOWN_SECONDS
  hostCountdownTimer = setInterval(() => {
    hostCodeState.countdown--
    if (hostCodeState.countdown <= 0 && hostCountdownTimer) {
      clearInterval(hostCountdownTimer)
      hostCountdownTimer = null
    }
  }, 1000)
}

// 发送房东入驻验证码
const sendHostCode = async () => {
  if (hostCodeState.countdown > 0) return

  if (!hostForm.phone) {
    hostErrors.phone = '请输入手机号'
    return
  }
  if (!PHONE_REGEX.test(hostForm.phone)) {
    hostErrors.phone = '请输入正确的手机号'
    return
  }

  hostCodeState.isSending = true
  try {
    await authApi.sendVerifyCode(hostForm.phone)
    startHostCountdown()
    ElMessage.success('验证码已发送')
  } catch (error: any) {
    ElMessage.error(error.message || '发送失败，请重试')
  } finally {
    hostCodeState.isSending = false
  }
}

// 房东入驻步骤1校验
const validateStep1 = (): boolean => {
  let valid = true

  // 真实姓名
  if (!hostForm.realName) {
    hostErrors.realName = '请输入真实姓名'
    valid = false
  } else if (!/^[\u4e00-\u9fa5]{2,10}$/.test(hostForm.realName)) {
    hostErrors.realName = '请输入2-10个汉字的真实姓名'
    valid = false
  } else {
    hostErrors.realName = ''
  }

  // 身份证号
  const ID_CARD_REGEX = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
  if (!hostForm.idCard) {
    hostErrors.idCard = '请输入身份证号'
    valid = false
  } else if (!ID_CARD_REGEX.test(hostForm.idCard)) {
    hostErrors.idCard = '请输入正确的18位身份证号'
    valid = false
  } else {
    hostErrors.idCard = ''
  }

  // 手机号
  if (!hostForm.phone) {
    hostErrors.phone = '请输入手机号'
    valid = false
  } else if (!PHONE_REGEX.test(hostForm.phone)) {
    hostErrors.phone = '请输入正确的手机号'
    valid = false
  } else {
    hostErrors.phone = ''
  }

  // 验证码
  if (!hostForm.verifyCode) {
    hostErrors.verifyCode = '请输入验证码'
    valid = false
  } else if (!/^\d{6}$/.test(hostForm.verifyCode)) {
    hostErrors.verifyCode = '请输入6位验证码'
    valid = false
  } else {
    hostErrors.verifyCode = ''
  }

  return valid
}

// 房东入驻步骤2校验
const validateStep2 = (): boolean => {
  let valid = true

  // 用户名
  if (!hostForm.username) {
    hostErrors.username = '请设置登录账号'
    valid = false
  } else if (!/^[a-zA-Z0-9]{6,20}$/.test(hostForm.username)) {
    hostErrors.username = '账号需为6-20位英文/数字组合'
    valid = false
  } else {
    hostErrors.username = ''
  }

  // 密码
  if (!hostForm.password) {
    hostErrors.password = '请设置密码'
    valid = false
  } else if (hostForm.password.length < 6) {
    hostErrors.password = '密码至少6位'
    valid = false
  } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(hostForm.password)) {
    hostErrors.password = '密码需包含字母和数字'
    valid = false
  } else {
    hostErrors.password = ''
  }

  // 确认密码
  if (!hostForm.confirmPassword) {
    hostErrors.confirmPassword = '请再次输入密码'
    valid = false
  } else if (hostForm.confirmPassword !== hostForm.password) {
    hostErrors.confirmPassword = '两次密码输入不一致'
    valid = false
  } else {
    hostErrors.confirmPassword = ''
  }

  return valid
}

// 房东入驻步骤3校验
const validateStep3 = (): boolean => {
  let valid = true

  // 房源位置
  if (!hostForm.location || hostForm.location.length === 0) {
    hostErrors.location = '请选择房源所在地区'
    valid = false
  } else {
    hostErrors.location = ''
  }

  // 房源类型
  if (!hostForm.propertyType) {
    hostErrors.propertyType = '请选择房源类型'
    valid = false
  } else {
    hostErrors.propertyType = ''
  }

  return valid
}

// 房东入驻下一步
const nextHostStep = () => {
  if (hostStep.value === 0) {
    if (validateStep1()) {
      hostStep.value = 1
    }
  } else if (hostStep.value === 1) {
    if (validateStep2()) {
      hostStep.value = 2
    }
  }
}

// 房东入驻上一步
const prevHostStep = () => {
  if (hostStep.value > 0) {
    hostStep.value--
  }
}

// 提交房东入驻申请
const submitHostApplication = async () => {
  if (!validateStep3()) return

  isHostSubmitting.value = true

  // 保存用户名用于后续填充
  const registeredUsername = hostForm.username

  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))

    ElMessage.success({
      message: '入驻申请已提交，工作人员将在1-3个工作日内审核，审核结果将短信通知您',
      duration: 5000
    })

    // 重置步骤和数据
    hostStep.value = 0
    Object.assign(hostForm, {
      realName: '',
      idCard: '',
      phone: '',
      verifyCode: '',
      username: '',
      password: '',
      confirmPassword: '',
      location: [],
      propertyType: ''
    })

    // 切换回登录标签并填充用户名
    if (registeredUsername) {
      loginForm.username = registeredUsername
    }
    isRegister.value = false
    loginMode.value = 'password'
  } catch (error: any) {
    ElMessage.error(error.message || '提交失败，请重试')
  } finally {
    isHostSubmitting.value = false
  }
}

// 微信登录
const wxLogin = () => ElMessage.info('微信登录功能开发中')

// 房东入驻
const goToHostRegister = () => router.push('/host/register')

// 眨眼动画
const scheduleBlink = (isBlinkingRef: typeof isPurpleBlinking) => {
  const delay = Math.random() * 3000 + 2000
  setTimeout(() => {
    isBlinkingRef.value = true
    setTimeout(() => {
      isBlinkingRef.value = false
      scheduleBlink(isBlinkingRef)
    }, 150)
  }, delay)
}

onMounted(() => {
  scheduleBlink(isPurpleBlinking)
  scheduleBlink(isBlackBlinking)
})

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
  if (hostCountdownTimer) clearInterval(hostCountdownTimer)
})
</script>

<style scoped lang="scss">
.auth-container {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: linear-gradient(135deg, #faf8f5 0%, #f5f2ed 100%);
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

// 左侧角色区
.character-side {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background: linear-gradient(135deg, #FF5A5F 0%, #ff8a8f 100%);
  color: white;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(255,255,255,0.15) 0%, transparent 50%);
  }
  
  .characters {
    position: relative;
    width: 300px;
    height: 180px;
    margin-bottom: 40px;
  }
  
  .char {
    position: absolute;
    bottom: 0;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    
    .eye {
      position: absolute;
      width: 10px;
      height: 10px;
      background: white;
      border-radius: 50%;
      top: 25px;
      transition: all 0.15s ease;
    }
    
    &.blinking .eye {
      height: 2px;
      top: 29px;
    }
    
    &.purple {
      width: 80px;
      height: 120px;
      background: linear-gradient(180deg, #8B5CF6 0%, #6C3FF5 100%);
      left: 60px;
      border-radius: 12px 12px 0 0;
      box-shadow: 0 4px 20px rgba(108, 63, 245, 0.4);
      
      .eye:first-child { left: 18px; }
      .eye:last-child { right: 18px; }
      
      &.peeking {
        transform: skewX(-15deg) translateX(25px);
      }
      
      &.typing {
        transform: skewX(-8deg) translateX(15px);
      }
    }
    
    &.black {
      width: 60px;
      height: 90px;
      background: linear-gradient(180deg, #404040 0%, #2D2D2D 100%);
      left: 160px;
      border-radius: 10px 10px 0 0;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      
      .eye:first-child { left: 12px; }
      .eye:last-child { right: 12px; }
      
      &.looking {
        transform: skewX(10deg) translateX(-10px);
      }
    }
  }
  
  // 装饰性圆点
  .decorative-dot {
    position: absolute;
    border-radius: 50%;
    animation: float 3s ease-in-out infinite;
    
    &.dot-1 {
      width: 12px;
      height: 12px;
      background: rgba(255,255,255,0.6);
      top: 30%;
      left: 20%;
      animation-delay: 0s;
    }
    
    &.dot-2 {
      width: 8px;
      height: 8px;
      background: rgba(255,255,255,0.4);
      top: 50%;
      right: 25%;
      animation-delay: 0.5s;
    }
    
    &.dot-3 {
      width: 6px;
      height: 6px;
      background: rgba(255,255,255,0.3);
      bottom: 25%;
      left: 30%;
      animation-delay: 1s;
    }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  // 装饰性波浪
  .wave {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 80px;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120'%3E%3Cpath fill='rgba(255,255,255,0.1)' d='M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 L1200,120 L0,120 Z'/%3E%3C/svg%3E") repeat-x;
    background-size: 600px 100%;
    animation: wave 15s linear infinite;
    
    &.wave-2 {
      bottom: 10px;
      opacity: 0.5;
      animation-duration: 20s;
      animation-direction: reverse;
    }
  }
  
  @keyframes wave {
    0% { background-position-x: 0; }
    100% { background-position-x: 600px; }
  }
  
  h2 {
    font-size: 32px;
    font-weight: 600;
    margin-bottom: 16px;
    position: relative;
    z-index: 1;
    text-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  
  p {
    font-size: 16px;
    opacity: 0.9;
    position: relative;
    z-index: 1;
  }
  
  @media (max-width: 1024px) {
    display: none;
  }
}

// 右侧卡片区
.card-side-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  position: relative;
}

.logo-header {
  margin-bottom: 24px;
  text-align: center;
}

// 切换标签
.switch-tabs {
  display: flex;
  position: relative;
  background: #f5f5f5;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 30px;
  
  .tab-btn {
    padding: 10px 32px;
    border: none;
    background: transparent;
    font-size: 15px;
    font-weight: 500;
    color: #767676;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    z-index: 1;
    
    &.active {
      color: #484848;
    }
  }
  
  .tab-indicator {
    position: absolute;
    top: 4px;
    left: 4px;
    width: calc(50% - 4px);
    height: calc(100% - 8px);
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    
    &.right {
      transform: translateX(100%);
    }
  }
}

// 卡片容器
.flip-wrapper {
  width: 380px;
  
  @media (max-width: 480px) {
    width: 100%;
    max-width: 340px;
  }
}

// 卡片内容
.card-content {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  border: 1px solid #f0f0f0;
  min-height: 520px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// 登录模式切换
.login-mode-switch {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  font-size: 14px;
  
  span {
    color: #999;
    cursor: pointer;
    transition: all 0.2s;
    padding: 4px 8px;
    border-radius: 4px;
    
    &.active {
      color: #FF5A5F;
      font-weight: 500;
    }
    
    &:hover:not(.active) {
      color: #666;
      background: #f5f5f5;
    }
  }
  
  .divider {
    color: #e0e0e0;
  }
}

// 标题
.title {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  color: #484848;
  margin-bottom: 28px;
  font-family: 'PingFang SC', sans-serif;
}

// 表单
.form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.input-group {
  position: relative;
  width: 100%;
}

.form-input {
  width: 90%;
  height: 48px;
  padding: 0 14px;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  font-size: 15px;
  color: #484848;
  background: #fafafa;
  transition: all 0.2s;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #FF5A5F;
    background: white;
    box-shadow: 0 0 0 4px rgba(255,90,95,0.1);
  }
  
  &.error {
    border-color: #ff4d4f;
    
    &:focus {
      box-shadow: 0 0 0 4px rgba(255,77,79,0.1);
    }
  }
  
  &::placeholder {
    color: #bbb;
  }
}

.input-icon {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  opacity: 0.5;
  pointer-events: none;
}

.input-error {
  position: absolute;
  bottom: -20px;
  left: 0;
  font-size: 12px;
  color: #ff4d4f;
}

// 验证码按钮
.code-btn {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  height: 38px;
  padding: 0 14px;
  background: linear-gradient(135deg, #FF5A5F 0%, #ff7a7f 100%);
  border: none;
  border-radius: 8px;
  font-size: 13px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  min-width: 90px;
  
  &:hover:not(:disabled) {
    transform: translateY(-51%);
    box-shadow: 0 4px 12px rgba(255,90,95,0.4);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    background: #ccc;
  }
  
  &.loading {
    background: linear-gradient(135deg, #ffa39e 0%, #ff7875 100%);
  }
}

// 密码显示切换
.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  opacity: 0.6;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
}

// 昵称预览
.nickname-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 8px;
  
  .avatar-preview {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #FF5A5F 0%, #ff8a8f 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 14px;
  }
  
  span {
    font-size: 14px;
    color: #666;
  }
}

// 选项
.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #666;
  margin-top: -4px;
  
  .remember {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    
    input[type="checkbox"] {
      width: 16px;
      height: 16px;
      accent-color: #FF5A5F;
    }
  }
}

.terms {
  font-size: 12px;
  color: #666;
  line-height: 1.5;
  
  label {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    cursor: pointer;
  }
  
  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: #FF5A5F;
    margin-top: 2px;
  }
  
  a {
    color: #FF5A5F;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

// 提交按钮
.submit-btn {
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.primary {
    background: linear-gradient(135deg, #FF5A5F 0%, #ff7a7f 100%);
    color: white;
    box-shadow: 0 4px 16px rgba(255,90,95,0.3);
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255,90,95,0.4);
    }
    
    &:active:not(:disabled) {
      transform: translateY(0);
    }
    
    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
  
  &.secondary {
    background: white;
    color: #484848;
    border: 2px solid #e8e8e8;
    
    &:hover {
      border-color: #FF5A5F;
      color: #FF5A5F;
    }
  }
}

// 加载动画
.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

// 分隔线
.divider {
  position: relative;
  text-align: center;
  margin: 8px 0;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: #e8e8e8;
  }
  
  span {
    position: relative;
    background: white;
    padding: 0 12px;
    color: #bbb;
    font-size: 13px;
  }
}

// 房东入驻链接
.host-link {
  text-align: center;
  font-size: 13px;
  color: #666;
  margin-top: 8px;
  
  a {
    color: #FF5A5F;
    cursor: pointer;
    font-weight: 500;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

// 过渡动画
.slide-fade-enter-active {
  transition: all 0.25s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: scale(0.98);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

// 房东入驻内容区
.host-content {
  min-height: 580px;
}

// 步骤条：使用 el-steps 简洁横向样式
.host-steps-el {
  margin-bottom: 24px;
  :deep(.el-step__title) {
    font-size: 14px;
  }
  :deep(.el-step__icon) {
    border-color: #FF5A5F;
    color: #FF5A5F;
  }
  :deep(.el-step__title) {
    color: #999;
  }
  :deep(.el-step__head.is-finish) {
    .el-step__icon {
      background: #52c41a;
      border-color: #52c41a;
      color: white;
    }
    .el-step__title {
      color: #52c41a;
    }
  }
  :deep(.el-step__head.is-process) {
    .el-step__icon {
      background: #FF5A5F;
      border-color: #FF5A5F;
      color: white;
    }
    .el-step__title {
      color: #FF5A5F;
      font-weight: 600;
    }
  }
}

// 步骤表单
.step-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

// 表单操作按钮组
.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;

  .submit-btn {
    flex: 1;
  }
}

// 级联选择器样式
.cascader-input {
  width: 100%;

  :deep(.el-input__wrapper) {
    height: 48px;
    padding: 0 14px;
    border: 2px solid #e8e8e8;
    border-radius: 10px;
    font-size: 15px;
    background: #fafafa;
    box-shadow: none;

    &:hover {
      border-color: #d0d0d0;
    }

    &.is-focus {
      border-color: #FF5A5F;
      background: white;
      box-shadow: 0 0 0 4px rgba(255,90,95,0.1);
    }
  }
}

.cascader-icon {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 0;
  pointer-events: none;
}

// 房源类型选择
.property-type-section {
  .section-label {
    font-size: 14px;
    color: #666;
    margin-bottom: 12px;
  }

  .property-type-cards {
    display: flex;
    gap: 10px;

    .property-type-card {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px 8px;
      border: 2px solid #e8e8e8;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;

      .type-icon {
        font-size: 28px;
      }

      .type-name {
        font-size: 13px;
        color: #666;
      }

      &:hover {
        border-color: #FF5A5F;
        background: rgba(255,90,95,0.03);
      }

      &.selected {
        border-color: #FF5A5F;
        background: rgba(255,90,95,0.08);

        .type-name {
          color: #FF5A5F;
          font-weight: 500;
        }
      }
    }
  }
}
</style>