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
          注册
        </button>
        <div class="tab-indicator" :class="{ right: isRegister }"></div>
      </div>

      <!-- 卡片容器 -->
      <div class="flip-wrapper">
        <transition name="slide-fade" mode="out-in">
          <!-- 登录表单 -->
          <div class="card-content" v-if="!isRegister" key="login">
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
                    @input="validatePhone(loginForm.phone, 'login')"
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
                    @click="sendCode('login')"
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

          <!-- 注册表单 -->
          <div class="card-content" v-else key="register">
            <div class="title">加入栖居</div>
            <form class="form" @submit.prevent="handleRegister">
              <div class="input-group">
                <input 
                  class="form-input" 
                  v-model="registerForm.phone" 
                  placeholder="手机号" 
                  type="tel"
                  maxlength="11"
                  :class="{ error: registerFormErrors.phone }"
                  @input="validatePhone(registerForm.phone, 'register')"
                >
                <span 
                  class="input-error" 
                  v-if="registerFormErrors.phone"
                >
                  {{ registerFormErrors.phone }}
                </span>
              </div>
              
              <div class="input-group">
                <input 
                  class="form-input" 
                  v-model="registerForm.code" 
                  placeholder="验证码" 
                  type="text"
                  maxlength="6"
                >
                <button 
                  type="button" 
                  class="code-btn"
                  :class="{ loading: codeState.isSendingReg }"
                  @click="sendCode('register')"
                  :disabled="codeState.regCountdown > 0 || codeState.isSendingReg"
                >
                  <span v-if="codeState.regCountdown > 0">{{ codeState.regCountdown }}s</span>
                  <span v-else-if="codeState.isSendingReg">发送中...</span>
                  <span v-else>获取验证码</span>
                </button>
              </div>

              <div class="input-group">
                <input 
                  class="form-input" 
                  v-model="registerForm.nickname" 
                  placeholder="昵称（选填）" 
                  type="text"
                  maxlength="20"
                >
              </div>

              <div class="input-group" v-if="registerForm.nickname">
                <div class="nickname-preview">
                  <div class="avatar-preview">
                    {{ registerForm.nickname.charAt(0) }}
                  </div>
                  <span>{{ registerForm.nickname }}</span>
                </div>
              </div>

              <div class="terms">
                <label>
                  <input type="checkbox" v-model="registerForm.agree">
                  <span>我已阅读并同意<a href="#">服务协议</a>和<a href="#">隐私政策</a></span>
                </label>
              </div>

              <button 
                class="submit-btn primary" 
                type="submit"
                :disabled="isRegisterLoading"
              >
                <span class="loading-spinner" v-if="isRegisterLoading"></span>
                <span v-else>注册账号</span>
              </button>
              
              <p class="host-link">
                想要成为房东？<a @click="goToHostRegister">去入驻</a>
              </p>
            </form>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { User } from '@/types'
import { useUserStore } from '@/stores/user'
import { users } from '@/mock/data'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 常量
const PHONE_REGEX = /^1[3-9]\d{9}$/
const COUNTDOWN_SECONDS = 60
const SMS_DELAY = 800
const SUBMIT_DELAY = 1500

// 页面状态
const isRegister = ref(route.query.mode === 'register')
const loginMode = ref<'code' | 'password'>(route.query.mode === 'password' ? 'password' : 'code')
const isTyping = ref(false)
const showCharacters = ref(true)

// 登录模式
const showPassword = ref(false)

// 加载状态
const isLoginLoading = ref(false)
const isRegisterLoading = ref(false)

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

// 注册表单
const registerForm = reactive({
  phone: '',
  code: '',
  nickname: '',
  agree: false
})

// 注册表单验证错误
const registerFormErrors = reactive({
  phone: '',
  code: ''
})

// 验证码状态
const codeState = reactive({
  countdown: 0,
  regCountdown: 0,
  isSending: false,
  isSendingReg: false
})
let countdownTimer: ReturnType<typeof setInterval> | null = null

// 角色动画状态
const isPasswordVisible = ref(false)
const isPurpleBlinking = ref(false)
const isBlackBlinking = ref(false)

// 倒计时逻辑
const startCountdown = (type: 'login' | 'register') => {
  const target = type === 'login' ? 'countdown' : 'regCountdown'
  codeState[target] = COUNTDOWN_SECONDS
  countdownTimer = setInterval(() => {
    codeState[target]--
    if (codeState[target] <= 0 && countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
}

// 表单验证
const validatePhone = (phone: string, form: 'login' | 'register') => {
  const errors = form === 'login' ? loginFormErrors : registerFormErrors
  errors.phone = phone && !PHONE_REGEX.test(phone) ? '请输入正确的手机号' : ''
  return errors.phone === ''
}

// 发送验证码
const sendCode = async (type: 'login' | 'register') => {
  const form = type === 'login' ? loginForm : registerForm
  const errors = type === 'login' ? loginFormErrors : registerFormErrors
  const target = type === 'login' ? 'countdown' : 'regCountdown'
  const sendingKey = type === 'login' ? 'isSending' : 'isSendingReg'

  if (codeState[target] > 0) return

  if (!form.phone) {
    errors.phone = '请输入手机号'
    return
  }
  if (!PHONE_REGEX.test(form.phone)) {
    errors.phone = '请输入正确的手机号'
    return
  }

  codeState[sendingKey] = true
  await new Promise(resolve => setTimeout(resolve, SMS_DELAY))
  startCountdown(type)
  codeState[sendingKey] = false
  ElMessage.success('验证码已发送：1234')
}

// 登录提交
const handleLogin = async () => {
  const { phone, code, username } = loginForm

  if (loginMode.value === 'code') {
    if (!phone || !code) {
      ElMessage.error('请填写完整信息')
      return
    }
  } else {
    if (!username || !loginForm.password) {
      ElMessage.error('请填写完整信息')
      return
    }
  }

  isLoginLoading.value = true
  await new Promise(resolve => setTimeout(resolve, SUBMIT_DELAY))

  // 使用 mock 数据验证 - 支持用户名、手机号、邮箱登录
  const loginAccount = loginMode.value === 'code' ? phone : username
  const mockUser = users.find(u =>
    u.phone === loginAccount ||
    u.username === loginAccount ||
    u.email === loginAccount
  )
  if (mockUser) {
    userStore.login(mockUser, 'mock-token-123')
    ElMessage.success('登录成功')
  } else {
    ElMessage.error('用户不存在，请先注册')
    isLoginLoading.value = false
    return
  }

  isLoginLoading.value = false
  router.push('/')
}

// 注册提交
const handleRegister = async () => {
  const { phone, code, agree } = registerForm

  if (!phone || !code) {
    ElMessage.error('请填写完整信息')
    return
  }

  if (!validatePhone(phone, 'register')) return
  if (!agree) {
    ElMessage.error('请同意服务协议')
    return
  }

  isRegisterLoading.value = true
  await new Promise(resolve => setTimeout(resolve, SUBMIT_DELAY))

  // 检查用户是否已存在
  const existingUser = users.find(u => u.phone === phone)
  if (existingUser) {
    ElMessage.error('该手机号已注册，请直接登录')
    isRegisterLoading.value = false
    return
  }

  // 创建新用户并添加到 mock 数据
  const newUser: User = {
    userId: users.length + 1,
    phone,
    nickname: registerForm.nickname || `用户${phone.slice(-4)}`,
    avatar: `https://i.pravatar.cc/150?u=${phone}`,
    role: 'guest',
    status: 1,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
  }
  users.push(newUser)

  // 自动登录
  userStore.login(newUser, 'mock-token-' + Date.now())
  ElMessage.success('注册成功')

  isRegisterLoading.value = false
  router.push('/')
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
</style>
