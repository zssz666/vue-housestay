<template>
  <div class="info-page">
    <h2 class="page-title">个人信息</h2>

    <div class="info-container">
      <!-- 头像区域 -->
      <div class="avatar-section">
        <div class="avatar-wrapper">
          <el-avatar :size="100" :src="userInfo.avatar || defaultAvatar" />
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="handleAvatarChange"
            accept="image/*"
          >
            <el-button type="primary" size="small" class="upload-btn">更换头像</el-button>
          </el-upload>
        </div>
        <p class="avatar-tip">点击更换头像，支持 JPG、PNG 格式，大小不超过 5MB</p>
      </div>

      <!-- 基本信息 -->
      <div class="info-section">
        <h3 class="section-title">基本信息</h3>

        <el-form :model="form" label-width="100px" class="info-form">
          <el-form-item label="用户名">
            <el-input v-model="form.nickname" placeholder="请输入用户名" maxlength="20" />
          </el-form-item>

          <el-form-item label="手机号">
            <div class="phone-display">
              <span>{{ maskPhone(userInfo.phone) }}</span>
              <el-button type="primary" link @click="showPhoneDialog = true">更换</el-button>
            </div>
          </el-form-item>

          <el-form-item label="邮箱">
            <div class="email-display">
              <span v-if="userInfo.email">{{ maskEmail(userInfo.email) }}</span>
              <span v-else class="not-bound">未绑定</span>
              <el-button type="primary" link @click="showEmailDialog = true">
                {{ userInfo.email ? '修改' : '绑定' }}
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <!-- 实名认证 -->
      <div class="info-section">
        <h3 class="section-title">实名认证</h3>

        <div v-if="userInfo.realName" class="verified-info">
          <el-icon class="verified-icon"><CircleCheckFilled /></el-icon>
          <span>已认证：{{ userInfo.realName }}</span>
          <el-button type="primary" link @click="showRealNameDialog = true">重新认证</el-button>
        </div>

        <el-button v-else type="primary" @click="showRealNameDialog = true">
          <el-icon><UserFilled /></el-icon>
          立即认证
        </el-button>
        <p class="tip">实名认证后可用于房东认证、发布房源等</p>
      </div>

      <!-- 保存按钮 -->
      <div class="action-bar">
        <el-button type="primary" size="large" :loading="saving" @click="handleSave">
          保存修改
        </el-button>
      </div>
    </div>

    <!-- 更换手机号弹窗 -->
    <el-dialog v-model="showPhoneDialog" title="更换手机号" width="420px" :close-on-click-modal="false">
      <el-form :model="phoneForm" label-width="80px">
        <el-form-item label="新手机号">
          <el-input v-model="phoneForm.phone" placeholder="请输入新手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="验证码">
          <div class="code-input-group">
            <el-input v-model="phoneForm.code" placeholder="请输入验证码" maxlength="6" />
            <el-button
              :disabled="phoneCountdown > 0"
              @click="sendPhoneCode"
            >
              {{ phoneCountdown > 0 ? `${phoneCountdown}s` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPhoneDialog = false">取消</el-button>
        <el-button type="primary" :loading="phoneLoading" @click="handleChangePhone">确认更换</el-button>
      </template>
    </el-dialog>

    <!-- 绑定/修改邮箱弹窗 -->
    <el-dialog v-model="showEmailDialog" :title="userInfo.email ? '修改邮箱' : '绑定邮箱'" width="420px" :close-on-click-modal="false">
      <el-form :model="emailForm" label-width="80px">
        <el-form-item label="邮箱">
          <el-input v-model="emailForm.email" placeholder="请输入邮箱地址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEmailDialog = false">取消</el-button>
        <el-button type="primary" :loading="emailLoading" @click="handleChangeEmail">
          {{ userInfo.email ? '确认修改' : '确认绑定' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 实名认证弹窗 -->
    <el-dialog v-model="showRealNameDialog" title="实名认证" width="420px" :close-on-click-modal="false">
      <el-form :model="realNameForm" label-width="80px">
        <el-form-item label="真实姓名">
          <el-input v-model="realNameForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="身份证号">
          <el-input v-model="realNameForm.idCard" placeholder="请输入身份证号码" maxlength="18" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRealNameDialog = false">取消</el-button>
        <el-button type="primary" :loading="realNameLoading" @click="handleRealNameVerify">提交认证</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { CircleCheckFilled, UserFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { userApi } from '@/api/modules/auth'

const userStore = useUserStore()

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 用户信息
const userInfo = ref<any>({
  phone: '',
  nickname: '',
  email: '',
  avatar: '',
  realName: '',
  idCard: ''
})

// 表单数据
const form = reactive({
  nickname: ''
})

const saving = ref(false)

// 手机号更换
const showPhoneDialog = ref(false)
const phoneForm = reactive({
  phone: '',
  code: ''
})
const phoneCountdown = ref(0)
const phoneLoading = ref(false)

// 邮箱绑定/修改
const showEmailDialog = ref(false)
const emailForm = reactive({
  email: ''
})
const emailLoading = ref(false)

// 实名认证
const showRealNameDialog = ref(false)
const realNameForm = reactive({
  realName: '',
  idCard: ''
})
const realNameLoading = ref(false)

// 手机号脱敏
const maskPhone = (phone: string) => {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 邮箱脱敏
const maskEmail = (email: string) => {
  if (!email) return ''
  const parts = email.split('@')
  const name = parts[0]!
  const domain = parts[1]
  if (!domain) return email
  if (name.length <= 3) {
    return name[0] + '***@' + domain
  }
  return name.slice(0, 3) + '***@' + domain
}

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const data = await userApi.getUserInfo()
    userInfo.value = data
    form.nickname = data.nickname || ''
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 头像选择后处理
const handleAvatarChange = async (uploadFile: any) => {
  const file = uploadFile.raw
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB')
    return false
  }

  // 读取文件为 Base64
  const reader = new FileReader()
  reader.onload = async (e) => {
    const base64 = e.target?.result as string

    saving.value = true
    try {
      const data = await userApi.updateUserInfo({ avatar: base64 })
      userInfo.value.avatar = base64
      userStore.setUserInfo(data)
      ElMessage.success('头像更换成功')
    } catch (error: any) {
      ElMessage.error(error.message || '头像更换失败')
    } finally {
      saving.value = false
    }
  }
  reader.readAsDataURL(file)
}

// 保存修改
const handleSave = async () => {
  if (!form.nickname.trim()) {
    ElMessage.warning('请输入用户名')
    return
  }

  saving.value = true
  try {
    const data = await userApi.updateUserInfo({
      nickname: form.nickname
    })
    userStore.setUserInfo(data)
    ElMessage.success('保存成功')
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// 发送换绑手机号验证码
const sendPhoneCode = async () => {
  const phone = phoneForm.phone
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }

  phoneCountdown.value = 60
  const timer = setInterval(() => {
    phoneCountdown.value--
    if (phoneCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)

  try {
    await userApi.sendPhoneChangeCode(phone)
    ElMessage.success('验证码已发送')
  } catch (error: any) {
    ElMessage.error(error.message || '发送失败')
    clearInterval(timer)
    phoneCountdown.value = 0
  }
}

// 更换手机号
const handleChangePhone = async () => {
  const { phone, code } = phoneForm

  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }

  if (!code || code.length !== 6) {
    ElMessage.warning('请输入6位验证码')
    return
  }

  phoneLoading.value = true
  try {
    const data = await userApi.updateUserInfo({ phone, code })
    userInfo.value.phone = phone
    userStore.setUserInfo(data)
    ElMessage.success('手机号更换成功')
    showPhoneDialog.value = false
    phoneForm.phone = ''
    phoneForm.code = ''
  } catch (error: any) {
    ElMessage.error(error.message || '更换失败')
  } finally {
    phoneLoading.value = false
  }
}

// 修改/绑定邮箱
const handleChangeEmail = async () => {
  const email = emailForm.email

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    ElMessage.warning('请输入正确的邮箱地址')
    return
  }

  emailLoading.value = true
  try {
    const data = await userApi.updateUserInfo({ email })
    userInfo.value.email = email
    userStore.setUserInfo(data)
    ElMessage.success(userInfo.value.email ? '邮箱修改成功' : '邮箱绑定成功')
    showEmailDialog.value = false
    emailForm.email = ''
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    emailLoading.value = false
  }
}

// 实名认证
const handleRealNameVerify = async () => {
  const { realName, idCard } = realNameForm

  if (!realName.trim()) {
    ElMessage.warning('请输入真实姓名')
    return
  }

  if (!/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idCard)) {
    ElMessage.warning('请输入正确的身份证号码')
    return
  }

  realNameLoading.value = true
  try {
    const data = await userApi.updateUserInfo({ realName, idCard })
    userInfo.value.realName = realName
    userInfo.value.idCard = idCard
    userStore.setUserInfo(data)
    ElMessage.success('实名认证成功')
    showRealNameDialog.value = false
    realNameForm.realName = ''
    realNameForm.idCard = ''
  } catch (error: any) {
    ElMessage.error(error.message || '认证失败')
  } finally {
    realNameLoading.value = false
  }
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped lang="scss">
.info-page {
  padding: 24px;
  background: white;
  border-radius: 12px;
  min-height: 500px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
}

.info-container {
  max-width: 600px;
}

.avatar-section {
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin-bottom: 24px;
  text-align: center;
}

.avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }
}

.avatar-tip {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  margin-top: 8px;
}

.info-section {
  padding: 24px;
  background: #f9fafb;
  border-radius: 12px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.info-form {
  :deep(.el-form-item__label) {
    font-weight: 500;
  }
}

.phone-display,
.email-display {
  display: flex;
  align-items: center;
  gap: 12px;

  span {
    color: #333;
  }

  .not-bound {
    color: #999;
  }
}

.verified-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #e8f5e9;
  border-radius: 8px;
  color: #2e7d32;

  .verified-icon {
    color: #4caf50;
    font-size: 20px;
  }
}

.tip {
  color: #999;
  font-size: 12px;
  margin-top: 12px;
}

.action-bar {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}

.code-input-group {
  display: flex;
  gap: 12px;

  .el-input {
    flex: 1;
  }
}
</style>
