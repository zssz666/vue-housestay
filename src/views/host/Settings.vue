<template>
  <div class="host-settings-page">

    <!-- 页面骨架屏 -->
    <div v-if="loading" class="skeleton-wrap">
      <el-skeleton :rows="8" animated />
    </div>

    <template v-else>

      <!-- 顶部标题 -->
      <div class="page-header">
        <div class="page-title">
          <el-icon><Setting /></el-icon>
          <span>设置中心</span>
        </div>
        <div class="page-subtitle">管理您的个人资料、联系方式和账户设置</div>
      </div>

      <!-- 主内容卡片 -->
      <div class="settings-card">

        <!-- Tab 切换 -->
        <el-tabs v-model="activeTab" class="settings-tabs" tab-position="left">

          <!-- ========== 1. 个人资料 ========== -->
          <el-tab-pane name="profile">
            <template #label>
              <div class="tab-label">
                <el-icon><User /></el-icon>
                <span>个人资料</span>
              </div>
            </template>

            <div class="tab-content">
              <div class="section-header">
                <h3>个人资料</h3>
                <p>完善您的房东档案，展示给潜在房客</p>
              </div>

              <el-form
                ref="profileFormRef"
                :model="profileForm"
                :rules="profileRules"
                label-width="120px"
                class="settings-form"
              >
                <!-- 头像上传 -->
                <el-form-item label="头像" required>
                  <div class="avatar-upload-area">
                    <el-upload
                      class="avatar-uploader"
                      action="#"
                      :show-file-list="false"
                      :before-upload="beforeAvatarUpload"
                      :http-request="handleAvatarUpload"
                    >
                      <img
                        v-if="profileForm.avatar"
                        :src="profileForm.avatar"
                        class="avatar-img"
                      />
                      <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                    </el-upload>
                    <div class="avatar-tip">
                      <p>点击上传头像</p>
                      <p>支持 JPG、PNG 格式，文件小于 2MB</p>
                      <p>建议尺寸 200×200 像素</p>
                    </div>
                    <!-- 上传进度 -->
                    <div v-if="avatarUploading" class="upload-progress">
                      <el-progress :percentage="uploadProgress" :stroke-width="6" />
                      <span>上传中...</span>
                    </div>
                  </div>
                </el-form-item>

                <!-- 头像裁剪弹窗 -->
                <el-dialog
                  v-model="cropperVisible"
                  title="裁剪头像"
                  width="500px"
                  :close-on-click-modal="false"
                >
                  <div class="cropper-container">
                    <img ref="cropperImgRef" :src="cropperSrc" class="cropper-image" />
                  </div>
                  <template #footer>
                    <el-button @click="cropperVisible = false">取消</el-button>
                    <el-button type="primary" :loading="avatarUploading" @click="confirmCrop">
                      确认上传
                    </el-button>
                  </template>
                </el-dialog>

                <!-- 昵称 -->
                <el-form-item label="昵称" prop="nickname">
                  <el-input
                    v-model="profileForm.nickname"
                    placeholder="请输入昵称"
                    maxlength="20"
                    show-word-limit
                    clearable
                  />
                </el-form-item>

                <!-- 个人简介 -->
                <el-form-item label="个人简介" prop="bio">
                  <div class="textarea-wrap">
                    <el-input
                      v-model="profileForm.bio"
                      type="textarea"
                      placeholder="介绍一下自己吧，让房客更了解您~"
                      maxlength="200"
                      :rows="4"
                      show-word-limit
                    />
                    <div class="textarea-tip">
                      <span :class="{ 'near-limit': profileForm.bio.length > 160 }">
                        {{ profileForm.bio.length }} / 200
                      </span>
                    </div>
                  </div>
                </el-form-item>

                <!-- 房东标签 -->
                <el-form-item label="房东标签">
                  <div class="tags-area">
                    <el-checkbox-group v-model="profileForm.tags">
                      <el-checkbox
                        v-for="tag in availableTags"
                        :key="tag.value"
                        :value="tag.value"
                        :disabled="profileForm.tags.length >= 3 && !profileForm.tags.includes(tag.value)"
                      >
                        <span class="host-tag">
                          <el-icon :color="tag.color"><component :is="tag.icon" /></el-icon>
                          {{ tag.label }}
                        </span>
                      </el-checkbox>
                    </el-checkbox-group>
                    <div class="tags-tip">
                      最多选择 3 个标签，已选 <strong>{{ profileForm.tags.length }}</strong> / 3
                    </div>
                  </div>
                </el-form-item>

                <!-- 保存按钮 -->
                <el-form-item>
                  <el-button
                    type="primary"
                    :loading="profileSaving"
                    class="save-btn"
                    @click="handleSaveProfile"
                  >
                    保存修改
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>

          <!-- ========== 2. 联系方式 ========== -->
          <el-tab-pane name="contact">
            <template #label>
              <div class="tab-label">
                <el-icon><Message /></el-icon>
                <span>联系方式</span>
              </div>
            </template>

            <div class="tab-content">
              <div class="section-header">
                <h3>联系方式</h3>
                <p>设置您的联系方式，方便平台在紧急情况下与您联系</p>
              </div>

              <el-form
                ref="contactFormRef"
                :model="contactForm"
                :rules="contactRules"
                label-width="120px"
                class="settings-form"
              >
                <!-- 手机号 -->
                <el-form-item label="手机号">
                  <div class="phone-display">
                    <el-input :model-value="maskPhone(contactForm.phone)" disabled>
                      <template #prefix><el-icon><Phone /></el-icon></template>
                    </el-input>
                    <el-button type="primary" plain @click="showPhoneDialog = true">
                      更换手机号
                    </el-button>
                  </div>
                </el-form-item>

                <!-- 邮箱 -->
                <el-form-item label="邮箱" prop="email">
                  <div class="email-wrap">
                    <el-input
                      v-model="contactForm.email"
                      placeholder="请输入邮箱地址"
                      clearable
                    >
                      <template #prefix><el-icon><Message /></el-icon></template>
                    </el-input>
                    <el-button
                      :disabled="!contactForm.email || !emailValid"
                      :loading="emailSending"
                      @click="handleVerifyEmail"
                    >
                      {{ emailVerified ? '已验证' : '发送验证' }}
                    </el-button>
                  </div>
                  <div v-if="emailVerified" class="verify-badge">
                    <el-icon color="#52c41a"><CircleCheck /></el-icon> 邮箱已验证
                  </div>
                </el-form-item>

                <!-- 紧急联系人 -->
                <el-divider content-position="left">紧急联系人</el-divider>

                <el-form-item label="联系人姓名" prop="emergencyContact.name">
                  <el-input
                    v-model="contactForm.emergencyContact.name"
                    placeholder="请输入紧急联系人姓名"
                    maxlength="20"
                    clearable
                  >
                    <template #prefix><el-icon><User /></el-icon></template>
                  </el-input>
                </el-form-item>

                <el-form-item label="联系电话" prop="emergencyContact.phone">
                  <el-input
                    v-model="contactForm.emergencyContact.phone"
                    placeholder="请输入紧急联系人电话"
                    maxlength="11"
                    clearable
                  >
                    <template #prefix><el-icon><Phone /></el-icon></template>
                  </el-input>
                </el-form-item>

                <!-- 保存按钮 -->
                <el-form-item>
                  <el-button
                    type="primary"
                    :loading="contactSaving"
                    class="save-btn"
                    @click="handleSaveContact"
                  >
                    保存修改
                  </el-button>
                </el-form-item>
              </el-form>
            </div>

            <!-- 更换手机号弹窗 -->
            <el-dialog
              v-model="showPhoneDialog"
              title="更换手机号"
              width="440px"
              :close-on-click-modal="false"
            >
              <el-form ref="phoneFormRef" :model="phoneForm" :rules="phoneRules" label-width="100px">
                <el-form-item label="新手机号" prop="newPhone">
                  <el-input
                    v-model="phoneForm.newPhone"
                    placeholder="请输入新手机号"
                    maxlength="11"
                    clearable
                  >
                    <template #prefix><el-icon><Phone /></el-icon></template>
                  </el-input>
                </el-form-item>

                <el-form-item label="验证码" prop="code">
                  <div class="code-input-wrap">
                    <el-input
                      v-model="phoneForm.code"
                      placeholder="请输入验证码"
                      maxlength="6"
                      clearable
                    />
                    <el-button
                      :disabled="phoneCountdown > 0"
                      :loading="phoneCodeSending"
                      class="code-btn"
                      @click="handleSendPhoneCode"
                    >
                      {{ phoneCountdown > 0 ? `${phoneCountdown}s` : '获取验证码' }}
                    </el-button>
                  </div>
                </el-form-item>
              </el-form>

              <template #footer>
                <el-button @click="showPhoneDialog = false">取消</el-button>
                <el-button
                  type="primary"
                  :loading="phoneChanging"
                  @click="handleChangePhone"
                >
                  确认更换
                </el-button>
              </template>
            </el-dialog>
          </el-tab-pane>

          <!-- ========== 3. 收款账户 ========== -->
          <el-tab-pane name="payment">
            <template #label>
              <div class="tab-label">
                <el-icon><Wallet /></el-icon>
                <span>收款账户</span>
              </div>
            </template>

            <div class="tab-content">
              <div class="section-header">
                <h3>收款账户</h3>
                <p>管理您的银行卡信息，用于接收房客付款和提现</p>
              </div>

              <!-- 银行卡列表 -->
              <div class="bank-cards-list">
                <el-empty
                  v-if="bankCards.length === 0"
                  description="暂无绑定的银行卡，点击下方按钮添加"
                  :image-size="80"
                />

                <div
                  v-for="card in bankCards"
                  :key="card.id"
                  class="bank-card-item"
                  :class="{ 'is-default': card.isDefault }"
                >
                  <div class="bank-card-inner">
                    <div class="bank-card-left">
                      <div class="bank-icon" :style="{ background: card.bgColor }">
                        <el-icon :size="28" :color="card.iconColor">
                          <component :is="card.icon" />
                        </el-icon>
                      </div>
                      <div class="bank-info">
                        <div class="bank-name">{{ card.bankName }}</div>
                        <div class="bank-holder">{{ card.holderName }}</div>
                        <div class="bank-no">{{ card.cardNo }}</div>
                      </div>
                    </div>
                    <div class="bank-card-right">
                      <el-tag v-if="card.isDefault" type="success" size="small">默认</el-tag>
                      <div class="bank-actions">
                        <el-button
                          v-if="!card.isDefault"
                          type="primary"
                          link
                          size="small"
                          @click="setDefaultCard(card.id)"
                        >
                          设为默认
                        </el-button>
                        <el-button
                          type="danger"
                          link
                          size="small"
                          @click="handleDeleteCard(card.id)"
                        >
                          删除
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 添加银行卡按钮 -->
              <div class="add-card-action">
                <el-button type="primary" @click="showAddCardDrawer = true">
                  <el-icon><Plus /></el-icon>
                  添加银行卡
                </el-button>
              </div>

              <!-- 提现密码设置 -->
              <el-divider content-position="left">提现安全</el-divider>

              <div class="withdraw-security">
                <div class="security-item">
                  <div class="security-info">
                    <el-icon size="20" color="#1890ff"><Lock /></el-icon>
                    <div>
                      <div class="security-title">提现密码</div>
                      <div class="security-desc">
                        {{ hasWithdrawPassword ? '已设置，保障您的资金安全' : '未设置，建议立即设置' }}
                      </div>
                    </div>
                  </div>
                  <el-button
                    :type="hasWithdrawPassword ? 'default' : 'warning'"
                    size="small"
                    @click="showPasswordDialog = true"
                  >
                    {{ hasWithdrawPassword ? '修改密码' : '去设置' }}
                  </el-button>
                </div>
              </div>
            </div>

            <!-- 添加银行卡抽屉 -->
            <el-drawer
              v-model="showAddCardDrawer"
              title="添加银行卡"
              size="480px"
              :before-close="handleAddCardDrawerBeforeClose"
            >
              <el-form
                ref="bankFormRef"
                :model="bankForm"
                :rules="bankRules"
                label-width="100px"
                class="bank-form"
              >
                <el-form-item label="持卡人">
                  <el-input
                    :model-value="userStore.userInfo?.realName || '未实名认证'"
                    disabled
                  >
                    <template #prefix><el-icon><User /></el-icon></template>
                  </el-input>
                  <div class="form-tip warning">
                    <el-icon><Warning /></el-icon>
                    持卡人姓名需与实名认证姓名一致
                  </div>
                </el-form-item>

                <el-form-item label="银行卡号" prop="cardNo">
                  <el-input
                    v-model="bankForm.cardNo"
                    placeholder="请输入银行卡号"
                    maxlength="23"
                    @input="handleCardNoInput"
                    @blur="handleCardNoBlur"
                  >
                    <template #prefix><el-icon><Postcard /></el-icon></template>
                    <template #suffix>
                      <el-icon v-if="detectedBank" class="bank-detect-icon">
                        <component :is="detectedBank.icon" :color="detectedBank.iconColor" />
                      </el-icon>
                    </template>
                  </el-input>
                  <!-- 银行信息 -->
                  <div v-if="detectedBank" class="bank-detect-result">
                    <el-icon :color="detectedBank.iconColor">
                      <component :is="detectedBank.icon" />
                    </el-icon>
                    <span>{{ detectedBank.name }}</span>
                    <span class="bank-type">{{ detectedBank.type }}</span>
                  </div>
                </el-form-item>

                <el-form-item label="开户行" prop="branchBank">
                  <el-cascader
                    v-model="bankForm.branchBank"
                    :options="regionOptions"
                    placeholder="请选择省市区"
                    separator="/"
                    clearable
                    style="width: 100%"
                  />
                </el-form-item>

                <el-form-item label="支行名称" prop="branchName">
                  <el-input
                    v-model="bankForm.branchName"
                    placeholder="请输入支行名称，如：成都春熙路支行"
                    clearable
                  />
                </el-form-item>

                <el-form-item label="预留手机号" prop="reservePhone">
                  <el-input
                    v-model="bankForm.reservePhone"
                    placeholder="请输入银行预留手机号"
                    maxlength="11"
                    clearable
                  >
                    <template #prefix><el-icon><Phone /></el-icon></template>
                  </el-input>
                </el-form-item>

                <el-form-item label="验证码" prop="code">
                  <div class="code-input-wrap">
                    <el-input
                      v-model="bankForm.code"
                      placeholder="请输入验证码"
                      maxlength="6"
                    />
                    <el-button
                      :disabled="phoneCountdown > 0 || !bankForm.reservePhone"
                      class="code-btn"
                      @click="handleSendBankCode"
                    >
                      {{ phoneCountdown > 0 ? `${phoneCountdown}s` : '获取验证码' }}
                    </el-button>
                  </div>
                </el-form-item>

                <el-form-item>
                  <el-button
                    type="primary"
                    :loading="addingCard"
                    class="add-card-btn"
                    @click="handleAddCard"
                  >
                    确认添加
                  </el-button>
                </el-form-item>
              </el-form>
            </el-drawer>

            <!-- 提现密码弹窗 -->
            <el-dialog
              v-model="showPasswordDialog"
              :title="hasWithdrawPassword ? '修改提现密码' : '设置提现密码'"
              width="420px"
              :close-on-click-modal="false"
            >
              <el-form
                ref="passwordFormRef"
                :model="passwordForm"
                :rules="passwordRules"
                label-width="100px"
              >
                <el-form-item
                  v-if="hasWithdrawPassword"
                  label="旧密码"
                  prop="oldPassword"
                >
                  <el-input
                    v-model="passwordForm.oldPassword"
                    type="password"
                    placeholder="请输入旧密码"
                    show-password
                  />
                </el-form-item>

                <el-form-item label="新密码" prop="newPassword">
                  <el-input
                    v-model="passwordForm.newPassword"
                    type="password"
                    placeholder="请输入6位数字密码"
                    maxlength="6"
                    show-password
                  />
                </el-form-item>

                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    placeholder="请再次输入新密码"
                    maxlength="6"
                    show-password
                  />
                </el-form-item>
              </el-form>

              <template #footer>
                <el-button @click="showPasswordDialog = false">取消</el-button>
                <el-button
                  type="primary"
                  :loading="passwordSaving"
                  @click="handleSavePassword"
                >
                  确认
                </el-button>
              </template>
            </el-dialog>
          </el-tab-pane>

          <!-- ========== 4. 通知设置 ========== -->
          <el-tab-pane name="notification">
            <template #label>
              <div class="tab-label">
                <el-icon><Bell /></el-icon>
                <span>通知设置</span>
              </div>
            </template>

            <div class="tab-content">
              <div class="section-header">
                <h3>通知设置</h3>
                <p>管理您的通知接收方式，不错过任何重要信息</p>
              </div>

              <div class="notif-cards">

                <!-- 新订单通知 -->
                <div class="notif-card">
                  <div class="notif-card__left">
                    <div class="notif-card__icon" style="background: #e6f7ff;">
                      <el-icon size="20" color="#1890ff"><Bell /></el-icon>
                    </div>
                    <div class="notif-card__info">
                      <div class="notif-card__title">新订单通知</div>
                      <div class="notif-card__desc">当有新订单时，发送通知提醒</div>
                      <!-- 通知方式（条件展开） -->
                      <div v-if="notifSettings.newOrderEnabled" class="notif-methods">
                        <el-checkbox-group v-model="notifSettings.notifyMethods">
                          <el-checkbox value="sms">
                            <el-icon color="#1890ff"><Message /></el-icon> 短信
                          </el-checkbox>
                          <el-checkbox value="site">
                            <el-icon color="#1890ff"><Bell /></el-icon> 站内信
                          </el-checkbox>
                          <el-checkbox value="wechat">
                            <el-icon color="#52b342"><ChatDotRound /></el-icon> 微信
                          </el-checkbox>
                        </el-checkbox-group>
                      </div>
                    </div>
                  </div>
                  <el-switch
                    v-model="notifSettings.newOrderEnabled"
                    active-color="#1890ff"
                    @change="handleNotifChange('newOrder')"
                  />
                </div>

                <!-- 订单提醒 -->
                <div class="notif-card">
                  <div class="notif-card__left">
                    <div class="notif-card__icon" style="background: #f6ffed;">
                      <el-icon size="20" color="#52c41a"><House /></el-icon>
                    </div>
                    <div class="notif-card__info">
                      <div class="notif-card__title">订单提醒</div>
                      <div class="notif-card__desc">入住前24小时提醒、退房提醒</div>
                      <div class="notif-methods">
                        <el-checkbox-group v-model="notifSettings.orderReminders">
                          <el-checkbox value="checkin">
                            <el-icon color="#52c41a"><Timer /></el-icon> 入住前24小时提醒
                          </el-checkbox>
                          <el-checkbox value="checkout">
                            <el-icon color="#faad14"><Timer /></el-icon> 退房提醒
                          </el-checkbox>
                          <el-checkbox value="guest_msg">
                            <el-icon color="#1890ff"><ChatLineRound /></el-icon> 房客留言提醒
                          </el-checkbox>
                        </el-checkbox-group>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 财务通知 -->
                <div class="notif-card">
                  <div class="notif-card__left">
                    <div class="notif-card__icon" style="background: #fff7e6;">
                      <el-icon size="20" color="#faad14"><Wallet /></el-icon>
                    </div>
                    <div class="notif-card__info">
                      <div class="notif-card__title">财务通知</div>
                      <div class="notif-card__desc">提现到账、月度账单等财务相关通知</div>
                      <div class="finance-rows">
                        <div class="finance-row">
                          <span>提现到账通知</span>
                          <el-switch v-model="notifSettings.withdrawNotify" size="small" active-color="#1890ff" />
                        </div>
                        <div class="finance-row">
                          <span>月度账单通知</span>
                          <el-switch v-model="notifSettings.monthlyBillNotify" size="small" active-color="#1890ff" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 营销通知 -->
                <div class="notif-card">
                  <div class="notif-card__left">
                    <div class="notif-card__icon" style="background: #fff1f0;">
                      <el-icon size="20" color="#ff4d4f"><Promotion /></el-icon>
                    </div>
                    <div class="notif-card__info">
                      <div class="notif-card__title">营销通知</div>
                      <div class="notif-card__desc">平台活动、优惠信息等</div>
                    </div>
                  </div>
                  <el-switch v-model="notifSettings.marketingEnabled" active-color="#1890ff" />
                </div>

              </div>

              <!-- 保存按钮 -->
              <div class="notif-footer">
                <el-button
                  type="primary"
                  :loading="notifSaving"
                  class="save-btn"
                  @click="handleSaveNotification"
                >
                  保存设置
                </el-button>
              </div>
            </div>
          </el-tab-pane>

        </el-tabs>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import {
  ElMessage, ElMessageBox, type FormInstance, type FormRules,
} from 'element-plus';
import {
  Setting, User, Message, Wallet, Bell, Plus, Phone,
  Lock, Postcard, Warning, CircleCheck, House, Timer,
  ChatLineRound, ChatDotRound, CaretRight,
} from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user'
import { landlordApi, uploadApi } from '@/api/modules/landlord';

// ==================== 类型定义 ====================

interface BankCard {
  id: number;
  bankName: string;
  cardNo: string;
  holderName: string;
  isDefault: boolean;
  icon: string;
  iconColor: string;
  bgColor: string;
  bankCode: string;
}

interface DetectedBank {
  name: string;
  icon: string;
  iconColor: string;
  type: string;
  bgColor: string;
}

interface TagItem {
  label: string;
  value: string;
  icon: string;
  color: string;
}

// ==================== Store ====================
const userStore = useUserStore();

// ==================== 状态 ====================
const loading = ref(true);
const activeTab = ref('profile');

// ---------- 个人资料 ----------
const profileFormRef = ref<FormInstance>();
const profileForm = reactive({
  avatar: '',
  nickname: '',
  bio: '',
  tags: [] as string[],
});
const profileRules: FormRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度为 2-20 个字符', trigger: 'blur' },
  ],
  bio: [
    { max: 200, message: '简介不能超过 200 个字符', trigger: 'blur' },
  ],
};
const profileSaving = ref(false);

// 头像上传
const avatarUploading = ref(false);
const uploadProgress = ref(0);
const cropperVisible = ref(false);
const cropperSrc = ref('');
const cropperImgRef = ref<HTMLImageElement | null>(null);

const availableTags: TagItem[] = [
  { label: '超赞房东', value: 'super_host', icon: 'Star', color: '#FF9645' },
  { label: '极速确认', value: 'fast_confirm', icon: 'Lightning', color: '#1890FF' },
  { label: '本地通', value: 'local_expert', icon: 'Location', color: '#52C41A' },
  { label: '亲子友好', value: 'family_friendly', icon: 'House', color: '#722ED1' },
  { label: '有宠可住', value: 'pet_friendly', icon: 'Grid', color: '#FA541C' },
  { label: '无烟房', value: 'non_smoking', icon: 'CircleCheck', color: '#13C2C2' },
];

// ---------- 联系方式 ----------
const contactFormRef = ref<FormInstance>();
const contactForm = reactive({
  phone: '',
  email: '',
  emergencyContact: { name: '', phone: '' },
});
const contactRules: FormRules = {
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  'emergencyContact.name': [
    { required: true, message: '请输入紧急联系人姓名', trigger: 'blur' },
  ],
  'emergencyContact.phone': [
    { required: true, message: '请输入紧急联系人电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
};
const contactSaving = ref(false);
const emailVerified = ref(false);
const emailValid = ref(false);
const emailSending = ref(false);
const showPhoneDialog = ref(false);

// 更换手机号
const phoneFormRef = ref<FormInstance>();
const phoneForm = reactive({ newPhone: '', code: '' });
const phoneRules: FormRules = {
  newPhone: [
    { required: true, message: '请输入新手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
  ],
};
const phoneCountdown = ref(0);
const phoneCodeSending = ref(false);
const phoneChanging = ref(false);
let phoneTimer: ReturnType<typeof setInterval> | null = null;

// ---------- 收款账户 ----------
const bankCards = ref<BankCard[]>([]);
const showAddCardDrawer = ref(false);
const bankFormRef = ref<FormInstance>();
const bankForm = reactive({
  cardNo: '',
  branchBank: [] as string[],
  branchName: '',
  reservePhone: '',
  code: '',
});
const bankRules: FormRules = {
  cardNo: [
    { required: true, message: '请输入银行卡号', trigger: 'blur' },
    { pattern: /^\d{16,19}$/, message: '银行卡号格式不正确', trigger: 'blur' },
  ],
  branchBank: [
    { required: true, message: '请选择开户行地区', trigger: 'change' },
  ],
  branchName: [
    { required: true, message: '请输入支行名称', trigger: 'blur' },
  ],
  reservePhone: [
    { required: true, message: '请输入预留手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
  ],
};
const detectedBank = ref<DetectedBank | null>(null);
const addingCard = ref(false);
const hasWithdrawPassword = ref(false);

// 提现密码
const showPasswordDialog = ref(false);
const passwordFormRef = ref<FormInstance>();
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});
const passwordRules: FormRules = {
  ...(hasWithdrawPassword.value ? {
    oldPassword: [
      { required: true, message: '请输入旧密码', trigger: 'blur' },
    ],
  } : {}),
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '提现密码必须为6位数字', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
};
const passwordSaving = ref(false);

// 省市区数据（简化版）
const regionOptions = [
  {
    value: '510000',
    label: '四川省',
    children: [
      { value: '510100', label: '成都市', children: [
        { value: '510104', label: '锦江区' },
        { value: '510105', label: '青羊区' },
        { value: '510106', label: '金牛区' },
        { value: '510107', label: '武侯区' },
        { value: '510108', label: '成华区' },
      ]},
      { value: '510300', label: '自贡市', children: [{ value: '510302', label: '自流井区' }] },
    ],
  },
  {
    value: '110000',
    label: '北京市',
    children: [
      { value: '110100', label: '市辖区', children: [{ value: '110101', label: '东城区' }] },
    ],
  },
  {
    value: '310000',
    label: '上海市',
    children: [
      { value: '310100', label: '市辖区', children: [{ value: '310101', label: '黄浦区' }] },
    ],
  },
  {
    value: '440000',
    label: '广东省',
    children: [
      { value: '440100', label: '广州市', children: [{ value: '440103', label: '荔湾区' }] },
      { value: '440300', label: '深圳市', children: [{ value: '440303', label: '罗湖区' }] },
    ],
  },
  {
    value: '330000',
    label: '浙江省',
    children: [
      { value: '330100', label: '杭州市', children: [{ value: '330102', label: '上城区' }] },
    ],
  },
  {
    value: '320000',
    label: '江苏省',
    children: [
      { value: '320100', label: '南京市', children: [{ value: '320102', label: '玄武区' }] },
    ],
  },
];

// ---------- 通知设置 ----------
const notifSaving = ref(false);
const notifSettings = reactive({
  newOrderEnabled: true,
  notifyMethods: ['sms', 'site'] as string[],
  orderReminders: ['checkin', 'checkout'] as string[],
  withdrawNotify: true,
  monthlyBillNotify: true,
  marketingEnabled: false,
});

// ==================== 工具函数 ====================

function maskPhone(phone: string): string {
  if (!phone || phone.length < 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

function validateEmailSync(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ==================== 生命周期 ====================

onMounted(async () => {
  // 模拟加载延迟
  await new Promise(resolve => setTimeout(resolve, 600));

  // 初始化个人资料
  profileForm.avatar = userStore.userInfo?.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';
  profileForm.nickname = userStore.userInfo?.nickname || '张房东';
  profileForm.bio = '提供温馨舒适的住宿体验，欢迎预订！';
  profileForm.tags = ['super_host', 'fast_confirm'];

  // 初始化联系方式
  contactForm.phone = userStore.userInfo?.phone || '13888888888';
  contactForm.email = 'zhanglandlord@example.com';
  contactForm.emergencyContact = { name: '李四', phone: '13999999999' };
  emailVerified.value = true;

  // 初始化银行卡列表（mock）
  bankCards.value = [
    {
      id: 1,
      bankName: '中国工商银行',
      cardNo: '6222 **** **** 8888',
      holderName: '张三',
      isDefault: true,
      icon: 'CreditCard',
      iconColor: '#E30000',
      bgColor: '#FFF1F0',
      bankCode: 'ICBC',
    },
    {
      id: 2,
      bankName: '招商银行',
      cardNo: '6225 **** **** 1234',
      holderName: '张三',
      isDefault: false,
      icon: 'CreditCard',
      iconColor: '#D9001B',
      bgColor: '#FFF7E6',
      bankCode: 'CMB',
    },
  ];

  hasWithdrawPassword.value = true;

  loading.value = false;
});

onUnmounted(() => {
  if (phoneTimer) clearInterval(phoneTimer);
});

// ==================== 个人资料操作 ====================

function beforeAvatarUpload(file: File): boolean {
  const isJPGorPNG = file.type === 'image/jpeg' || file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isJPGorPNG) {
    ElMessage.error('头像仅支持 JPG 或 PNG 格式');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB');
    return false;
  }
  return true;
}

async function handleAvatarUpload(options: { file: File }) {
  const { file } = options;
  const reader = new FileReader();
  reader.onload = (e) => {
    cropperSrc.value = e.target?.result as string;
    cropperVisible.value = true;
  };
  reader.readAsDataURL(file);
}

async function confirmCrop() {
  avatarUploading.value = true;
  uploadProgress.value = 0;

  try {
    const blob = await fetch(cropperSrc.value).then(r => r.blob());
    const file = new File([blob], 'avatar.jpg', { type: blob.type });
    const url = await uploadApi.uploadImage(file, 'landlord_avatar');
    profileForm.avatar = url.url;

    // 同时更新后端
    await landlordApi.updateProfile({ landlordAvatar: url.url });
    ElMessage.success('头像上传成功');
  } catch {
    ElMessage.error('头像上传失败');
  } finally {
    avatarUploading.value = false;
    cropperVisible.value = false;
  }
}

async function handleSaveProfile() {
  if (!profileFormRef.value) return;
  await profileFormRef.value.validate(async (valid) => {
    if (!valid) return;
    profileSaving.value = true;
    try {
      await landlordApi.updateProfile({
        landlordAvatar: profileForm.avatar,
        landlordIntroduce: profileForm.bio,
        landlordName: profileForm.nickname,
      });
      ElMessage.success('个人资料保存成功');
    } catch {
      // error already shown by interceptor
    } finally {
      profileSaving.value = false;
    }
  });
}

// ==================== 联系方式操作 ====================

async function handleVerifyEmail() {
  if (!validateEmailSync(contactForm.email)) {
    ElMessage.warning('请输入正确的邮箱格式');
    return;
  }
  emailSending.value = true;
  // TODO: 调用 API: POST /api/host/email/verify
  await new Promise(resolve => setTimeout(resolve, 1000));
  emailSending.value = false;
  emailVerified.value = true;
  ElMessage.success('验证邮件已发送，请查收');
}

async function handleSaveContact() {
  if (!contactFormRef.value) return;
  await contactFormRef.value.validate(async (valid) => {
    if (!valid) return;
    contactSaving.value = true;
    // TODO: 调用 API: PUT /api/host/contact
    await new Promise(resolve => setTimeout(resolve, 800));
    contactSaving.value = false;
    ElMessage.success('联系方式保存成功');
  });
}

async function handleSendPhoneCode() {
  phoneCodeSending.value = true;
  // TODO: 调用 API: POST /api/host/phone/change/code
  await new Promise(resolve => setTimeout(resolve, 800));
  phoneCodeSending.value = false;
  phoneCountdown.value = 60;
  phoneTimer = setInterval(() => {
    phoneCountdown.value--;
    if (phoneCountdown.value <= 0 && phoneTimer) {
      clearInterval(phoneTimer);
      phoneTimer = null;
    }
  }, 1000);
  ElMessage.success('验证码已发送');
}

async function handleChangePhone() {
  if (!phoneFormRef.value) return;
  await phoneFormRef.value.validate(async (valid) => {
    if (!valid) return;
    phoneChanging.value = true;
    // TODO: 调用 API: POST /api/host/phone/change
    await new Promise(resolve => setTimeout(resolve, 1000));
    phoneChanging.value = false;
    contactForm.phone = phoneForm.newPhone;
    showPhoneDialog.value = false;
    phoneForm.newPhone = '';
    phoneForm.code = '';
    ElMessage.success('手机号更换成功');
  });
}

// ==================== 收款账户操作 ====================

// 银行卡号输入格式化（每4位加空格）
function handleCardNoInput(val: string) {
  const digits = val.replace(/\s+/g, '').replace(/\D/g, '');
  const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  bankForm.cardNo = formatted;

  // 自动识别银行（根据前6位）
  if (digits.length >= 6) {
    detectBankByCardNo(digits);
  } else {
    detectedBank.value = null;
  }
}

function handleCardNoBlur() {
  // 完整输入后再次检测
  const digits = bankForm.cardNo.replace(/\s+/g, '');
  if (digits.length >= 16) {
    detectBankByCardNo(digits);
  }
}

function detectBankByCardNo(cardNo: string) {
  // 简化版银行识别（根据卡号前缀）
  const bankMap: Record<string, DetectedBank> = {
    '622202': { name: '中国工商银行', icon: 'CreditCard', iconColor: '#E30000', bgColor: '#FFF1F0', type: '储蓄卡' },
    '622203': { name: '中国工商银行', icon: 'CreditCard', iconColor: '#E30000', bgColor: '#FFF1F0', type: '储蓄卡' },
    '621700': { name: '中国建设银行', icon: 'CreditCard', iconColor: '#00559A', bgColor: '#F0F5FF', type: '储蓄卡' },
    '622598': { name: '招商银行', icon: 'CreditCard', iconColor: '#D9001B', bgColor: '#FFF7E6', type: '储蓄卡' },
    '622609': { name: '招商银行', icon: 'CreditCard', iconColor: '#D9001B', bgColor: '#FFF7E6', type: '储蓄卡' },
    '622150': { name: '中国邮政储蓄银行', icon: 'CreditCard', iconColor: '#00784B', bgColor: '#F0FFF0', type: '储蓄卡' },
    '622848': { name: '中国农业银行', icon: 'CreditCard', iconColor: '#1A7C2E', bgColor: '#F6FFED', type: '储蓄卡' },
    '621661': { name: '中国银行', icon: 'CreditCard', iconColor: '#A31C1C', bgColor: '#FFF1F0', type: '储蓄卡' },
  };

  const prefix = cardNo.substring(0, 6);
  const found = bankMap[prefix];
  if (found) {
    detectedBank.value = { ...found };
  } else {
    // 默认
    detectedBank.value = { name: '未知银行', icon: 'CreditCard', iconColor: '#999', bgColor: '#F7F7F7', type: '储蓄卡' };
  }
}

async function handleAddCard() {
  if (!bankFormRef.value) return;
  await bankFormRef.value.validate(async (valid) => {
    if (!valid) return;
    addingCard.value = true;
    // TODO: 调用 API: POST /api/host/bank-card
    await new Promise(resolve => setTimeout(resolve, 1200));
    addingCard.value = false;

    const newCard: BankCard = {
      id: Date.now(),
      bankName: detectedBank.value?.name || '未知银行',
      cardNo: bankForm.cardNo.replace(/\s+/g, '').replace(/(\d{4})/g, '$1 ').trim(),
      holderName: userStore.userInfo?.realName || '张三',
      isDefault: bankCards.value.length === 0,
      icon: detectedBank.value?.icon || 'CreditCard',
      iconColor: detectedBank.value?.iconColor || '#999',
      bgColor: detectedBank.value?.bgColor || '#F7F7F7',
      bankCode: '',
    };
    bankCards.value.push(newCard);
    showAddCardDrawer.value = false;
    handleDrawerClose();
    ElMessage.success('银行卡添加成功');
  });
}

function handleDrawerClose() {
  if (bankFormRef.value) bankFormRef.value.resetFields();
  bankForm.cardNo = '';
  detectedBank.value = null;
  phoneCountdown.value = 0;
  if (phoneTimer) {
    clearInterval(phoneTimer);
    phoneTimer = null;
  }
}

function handleAddCardDrawerBeforeClose(done: () => void) {
  handleDrawerClose();
  done();
}

async function setDefaultCard(id: number) {
  // TODO: 调用 API: PUT /api/host/bank-card/{id}/default
  bankCards.value = bankCards.value.map(card => ({
    ...card,
    isDefault: card.id === id,
  }));
  ElMessage.success('已设为默认银行卡');
}

async function handleDeleteCard(id: number) {
  try {
    await ElMessageBox.confirm(
      '确定要删除该银行卡吗？删除后需重新绑定。',
      '删除银行卡',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' },
    );
    // TODO: 调用 API: DELETE /api/host/bank-card/{id}
    bankCards.value = bankCards.value.filter(card => card.id !== id);
    ElMessage.success('银行卡已删除');
  } catch {
    // 取消
  }
}

async function handleSavePassword() {
  if (!passwordFormRef.value) return;
  await passwordFormRef.value.validate(async (valid) => {
    if (!valid) return;
    passwordSaving.value = true;
    // TODO: 调用 API: PUT /api/host/withdraw-password
    await new Promise(resolve => setTimeout(resolve, 800));
    passwordSaving.value = false;
    hasWithdrawPassword.value = true;
    showPasswordDialog.value = false;
    passwordForm.oldPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
    ElMessage.success(hasWithdrawPassword.value ? '提现密码修改成功' : '提现密码设置成功');
  });
}

// ==================== 通知设置操作 ====================

async function handleNotifChange(type: string) {
  // 实时保存
  await saveNotificationSettings();
}

async function handleSaveNotification() {
  notifSaving.value = true;
  // TODO: 调用 API: PUT /api/host/notification
  await new Promise(resolve => setTimeout(resolve, 600));
  notifSaving.value = false;
  ElMessage.success('通知设置已保存');
}

async function saveNotificationSettings() {
  // TODO: 调用 API: PUT /api/host/notification
}
</script>

<style scoped lang="scss">
.host-settings-page {
  padding: 0 4px;
}

// ==================== 骨架屏 ====================
.skeleton-wrap {
  padding: 32px;
  background: white;
  border-radius: 8px;
}

// ==================== 页面标题 ====================
.page-header {
  margin-bottom: 20px;

  .page-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 20px;
    font-weight: 600;
    color: #262626;
    margin-bottom: 4px;

    .el-icon { color: #1890ff; }
  }

  .page-subtitle {
    font-size: 13px;
    color: #8c8c8c;
    padding-left: 32px;
  }
}

// ==================== 主卡片 ====================
.settings-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

// ==================== Tab 标签 ====================
.settings-tabs {
  min-height: 600px;

  :deep(.el-tabs__header) {
    width: 200px;
    min-height: 600px;
    background: #fafafa;
    border-right: 1px solid #f0f0f0;
    margin-right: 0;
    padding: 16px 0;
  }

  :deep(.el-tabs__item) {
    height: 56px;
    line-height: 56px;
    padding: 0 20px;
    font-size: 14px;
    color: #595959;
    border-radius: 4px;
    margin: 2px 8px;
    width: calc(100% - 16px);
    justify-content: flex-start;

    &.is-active {
      color: #1890ff !important;
      background: #e6f7ff;
      border-right: none;
    }

    &:hover:not(.is-active) {
      color: #262626;
      background: #f5f5f5;
    }
  }

  :deep(.el-tabs__nav-wrap::after) { display: none; }
  :deep(.el-tabs__content) { padding: 0; }
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

// ==================== Tab 内容 ====================
.tab-content {
  padding: 28px 32px;
  max-width: 720px;
}

.section-header {
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;

  h3 {
    margin: 0 0 6px;
    font-size: 16px;
    font-weight: 600;
    color: #262626;
  }

  p {
    margin: 0;
    font-size: 13px;
    color: #8c8c8c;
  }
}

// ==================== 表单 ====================
.settings-form {
  :deep(.el-form-item__label) {
    font-size: 14px;
    color: #262626;
    font-weight: 500;
  }

  :deep(.el-form-item__error) {
    font-size: 12px;
    padding-top: 2px;
  }
}

// ==================== 头像上传 ====================
.avatar-upload-area {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.avatar-uploader {
  :deep(.el-upload) {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    border: 2px dashed #d9d9d9;
    cursor: pointer;
    overflow: hidden;
    transition: border-color 0.2s;

    &:hover { border-color: #1890ff; }
  }

  .avatar-img {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    object-fit: cover;
  }

  .avatar-uploader-icon {
    width: 96px;
    height: 96px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: #8c8c8c;
    background: #fafafa;
  }
}

.avatar-tip {
  p {
    margin: 0 0 4px;
    font-size: 12px;
    color: #8c8c8c;
    line-height: 1.6;
  }
}

.upload-progress {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 120px;

  span {
    font-size: 11px;
    color: #8c8c8c;
    text-align: center;
  }

  :deep(.el-progress) { width: 120px; }
}

.cropper-container {
  display: flex;
  justify-content: center;
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;

  .cropper-image {
    max-width: 100%;
    max-height: 400px;
    border-radius: 8px;
  }
}

// ==================== 文字域 ====================
.textarea-wrap {
  width: 100%;
  position: relative;

  :deep(.el-textarea__inner) {
    resize: none;
  }
}

.textarea-tip {
  position: absolute;
  bottom: 6px;
  right: 12px;
  font-size: 12px;
  color: #bfbfbf;
  pointer-events: none;

  .near-limit { color: #ff4d4f; }
}

// ==================== 标签选择 ====================
.tags-area {
  :deep(.el-checkbox-group) {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  :deep(.el-checkbox) {
    margin-right: 0;
    height: auto;
    line-height: 1;
  }
}

.host-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.tags-tip {
  margin-top: 10px;
  font-size: 12px;
  color: #8c8c8c;

  strong { color: #1890ff; }
}

// ==================== 手机号/邮箱输入 ====================
.phone-display {
  display: flex;
  gap: 12px;
  align-items: center;

  :deep(.el-input) { width: 200px; }
  :deep(.el-input__wrapper) { background: #fafafa; }
}

.email-wrap {
  display: flex;
  gap: 12px;
  align-items: center;

  :deep(.el-input) { width: 280px; }
}

.verify-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #52c41a;
  margin-top: 4px;
}

// ==================== 验证码输入 ====================
.code-input-wrap {
  display: flex;
  gap: 10px;
  align-items: center;

  :deep(.el-input) { width: 180px; }

  .code-btn {
    width: 110px;
    color: #1890ff;
    border-color: #1890ff;
    background: transparent;

    &:hover { background: #e6f7ff; }
  }
}

// ==================== 银行卡列表 ====================
.bank-cards-list {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.bank-card-item {
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: #e6e6e6;
  }

  &.is-default {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
  }
}

.bank-card-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: white;
}

.bank-card-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.bank-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bank-info {
  .bank-name {
    font-size: 15px;
    font-weight: 600;
    color: #262626;
    margin-bottom: 4px;
  }

  .bank-holder {
    font-size: 12px;
    color: #8c8c8c;
    margin-bottom: 3px;
  }

  .bank-no {
    font-size: 14px;
    color: #595959;
    font-family: 'Courier New', monospace;
    letter-spacing: 1px;
  }
}

.bank-card-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.bank-actions {
  display: flex;
  gap: 8px;
}

// ==================== 添加银行卡 ====================
.add-card-action {
  margin-bottom: 8px;

  :deep(.el-button) {
    border-style: dashed;
  }
}

.bank-form {
  padding: 0 8px;

  .form-tip {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 6px;
    font-size: 12px;
    color: #8c8c8c;

    &.warning { color: #faad14; }
  }

  .bank-detect-result {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 6px;
    font-size: 13px;
    color: #262626;

    .bank-type {
      font-size: 11px;
      color: #8c8c8c;
      background: #f5f5f5;
      padding: 1px 6px;
      border-radius: 4px;
    }
  }

  .bank-detect-icon {
    font-size: 18px;
  }

  .add-card-btn {
    width: 100%;
    margin-top: 16px;
    height: 40px;
    font-size: 15px;
    background: linear-gradient(135deg, #1890ff, #096dd9);
    border: none;
  }
}

// ==================== 提现安全 ====================
.withdraw-security {
  .security-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    background: #fafafa;
  }

  .security-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .security-title {
    font-size: 14px;
    font-weight: 500;
    color: #262626;
    margin-bottom: 2px;
  }

  .security-desc {
    font-size: 12px;
    color: #8c8c8c;
  }
}

// ==================== 通知设置 ====================
// ==================== 通知设置卡片 ====================
.notif-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.notif-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
  gap: 16px;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.07);
  }

  &__left {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    flex: 1;
    min-width: 0;
  }

  &__icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: #1a1a1a;
    line-height: 1.4;
    margin-bottom: 3px;
  }

  &__desc {
    font-size: 12px;
    color: #8c8c8c;
    line-height: 1.5;
  }
}

.notif-methods {
  margin-top: 10px;

  :deep(.el-checkbox-group) {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 14px;
  }

  :deep(.el-checkbox) {
    margin-right: 0;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #595959;
    white-space: nowrap;
  }

  :deep(.el-checkbox__label) {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 13px;
    color: #595959;
    padding-left: 4px;
    line-height: 1;
  }
}

.finance-rows {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .finance-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    color: #595959;
    padding: 6px 12px;
    background: #fafafa;
    border-radius: 6px;
    min-width: 220px;

    span {
      flex: 1;
    }
  }
}

.notif-footer {
  display: flex;
  justify-content: center;
  padding-top: 8px;
}

// ==================== 保存按钮 ====================
.save-btn {
  background: linear-gradient(135deg, #1890ff, #096dd9) !important;
  border: none !important;
  height: 38px;
  padding: 0 32px;
  font-size: 14px;
  font-weight: 500;
}

// ==================== Divider ====================
:deep(.el-divider__text) {
  font-size: 13px;
  color: #8c8c8c;
  background: white;
}
</style>
