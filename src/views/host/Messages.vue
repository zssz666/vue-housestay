<template>
  <div class="messages-page">

    <!-- ====== 左侧会话列表 ====== -->
    <aside class="conv-list" :class="{ 'mobile-hidden': activeConversation && isMobile }">
      <!-- 顶部搜索 -->
      <div class="conv-search">
        <el-input v-model="convSearch" placeholder="搜索咨询/投诉" prefix-icon="Search" clearable />
      </div>

      <!-- Tab 切换：会话 / 系统通知 -->
      <div class="conv-tabs">
        <div
          class="conv-tab"
          :class="{ active: activeTab === 'conversations' }"
          @click="setActiveTab('conversations')"
        >
          咨询会话
          <span v-if="totalUnread > 0" class="tab-badge">{{ totalUnread > 99 ? '99+' : totalUnread }}</span>
        </div>
        <div
          class="conv-tab"
          :class="{ active: activeTab === 'system' }"
          @click="setActiveTab('system')"
        >
          系统通知
          <span v-if="unreadNotifications > 0" class="tab-badge">{{ unreadNotifications }}</span>
        </div>
      </div>

      <!-- 会话列表 -->
      <div v-if="activeTab === 'conversations'" class="conv-items" ref="convListRef">
        <div
          v-if="filteredConversations.length === 0"
          class="conv-empty"
        >
          <el-icon size="32" color="#d9d9d9"><ChatDotRound /></el-icon>
          <p>暂无会话记录</p>
        </div>
        <div
          v-for="conv in filteredConversations"
          :key="conv.id"
          class="conv-item"
          :class="{
            active: activeConversation?.id === conv.id,
            'is-complaint': conv.type === 'complaint',
          }"
          @click="selectConversation(conv)"
        >
          <!-- 头像 -->
          <div class="conv-avatar-wrap">
            <div v-if="conv.type === 'complaint'" class="conv-avatar complaint-avatar">
              <el-icon color="white" size="22"><WarningFilled /></el-icon>
            </div>
            <div v-else-if="conv.type === 'system'" class="conv-avatar system-avatar">
              <el-icon color="white" size="20"><Bell /></el-icon>
            </div>
            <div v-else class="conv-avatar">
              <el-image :src="conv.user.avatar" fit="cover" class="avatar-img" />
            </div>
            <!-- 在线状态 -->
            <span v-if="conv.user.isOnline && conv.type !== 'complaint' && conv.type !== 'system'" class="online-dot" />
          </div>

          <!-- 内容区 -->
          <div class="conv-body">
            <div class="conv-row1">
              <span class="conv-name" :class="{ 'complaint-name': conv.type === 'complaint' }">
                {{ conv.type === 'complaint' ? '投诉：' : '' }}{{ conv.type === 'system' ? '系统通知' : conv.user.name }}
              </span>
              <span class="conv-time">{{ formatConvTime(conv.lastMessage.timestamp) }}</span>
            </div>
            <div class="conv-row2">
              <span class="conv-lastmsg">
                <template v-if="conv.lastMessage.type === 'image'">&#91;图片&#93;</template>
                <template v-else-if="conv.lastMessage.type === 'card'">&#91;房源卡片&#93;</template>
                <template v-else>{{ conv.lastMessage.content }}</template>
              </span>
              <!-- 未读红点 -->
              <span
                v-if="conv.unreadCount > 0"
                class="unread-badge"
                :class="{ 'badge-large': conv.unreadCount > 9 }"
              >{{ conv.unreadCount > 9 ? '9+' : conv.unreadCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 系统通知列表 -->
      <div v-else class="conv-items">
        <div
          v-if="notifications.length === 0"
          class="conv-empty"
        >
          <el-icon size="32" color="#d9d9d9"><Bell /></el-icon>
          <p>暂无系统通知</p>
        </div>
        <div
          v-for="notif in notifications"
          :key="notif.id"
          class="notif-item"
          :class="{ unread: !notif.isRead }"
          @click="handleNotifClick(notif)"
        >
          <div class="notif-icon" :class="notif.type">
            <el-icon color="white" size="16">
              <component :is="getNotifIcon(notif.type)" />
            </el-icon>
          </div>
          <div class="notif-body">
            <div class="notif-title">{{ notif.title }}</div>
            <div class="notif-content">{{ notif.content }}</div>
            <div class="notif-time">{{ formatConvTime(notif.createdAt) }}</div>
          </div>
          <div v-if="!notif.isRead" class="notif-dot" />
        </div>
      </div>
    </aside>

    <!-- ====== 右侧：聊天 / 系统通知详情 ====== -->
    <main class="chat-area" :class="{ 'mobile-show': activeConversation && isMobile && activeTab === 'conversations' }">

      <template v-if="activeTab === 'system'">
        <div v-if="!selectedNotification" class="chat-empty">
          <div class="chat-empty-icon">
            <el-icon size="64" color="#d9d9d9"><Bell /></el-icon>
          </div>
          <p class="chat-empty-text">请从左侧点击一条通知查看详情</p>
        </div>
        <div v-else class="notif-detail-panel">
          <div class="notif-detail-inner">
            <div class="notif-detail-header">
              <el-tag v-if="selectedNotification.type" size="small" type="info" effect="plain">{{ notifTypeLabel(selectedNotification.type) }}</el-tag>
              <h2 class="notif-detail-title">{{ selectedNotification.title }}</h2>
              <div class="notif-detail-meta">{{ formatConvTime(selectedNotification.createdAt) }}</div>
            </div>
            <div class="notif-detail-content">{{ selectedNotification.content }}</div>
            <el-button v-if="selectedNotification.relatedId" type="primary" plain class="notif-detail-link" @click="goRelatedNotif(selectedNotification)">
              查看关联内容
            </el-button>
          </div>
        </div>
      </template>

      <template v-else>
      <!-- 无选中会话 -->
      <div v-if="!activeConversation" class="chat-empty">
        <div class="chat-empty-icon">
          <el-icon size="64" color="#d9d9d9"><ChatLineSquare /></el-icon>
        </div>
        <p class="chat-empty-text">选择一个会话开始沟通</p>
      </div>

      <!-- 聊天窗口 -->
      <template v-else>
        <!-- 顶部标题栏 -->
        <div class="chat-header">
          <el-button
            v-if="isMobile"
            class="back-btn"
            text
            @click="activeConversation = null"
          >
            <el-icon size="20"><ArrowLeft /></el-icon>
          </el-button>
          <div class="chat-header-info">
            <div class="chat-username">
              {{ activeConversation.type === 'complaint' ? '投诉会话' : activeConversation.user.name }}
            </div>
            <div class="chat-homestay-title">
              {{ activeConversation.type === 'complaint' ? '正在处理投诉' : '咨询房源：' + activeConversation.homestayTitle }}
            </div>
          </div>
          <div class="chat-header-actions">
            <el-tooltip content="查看脱敏手机号" placement="bottom">
              <el-button text @click="showPhone = !showPhone">
                <el-icon><Phone /></el-icon>
              </el-button>
            </el-tooltip>
            <el-dropdown trigger="click">
              <el-button text>
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="jumpToOrder(activeConversation.orderId)">查看关联订单</el-dropdown-item>
                  <el-dropdown-item @click="jumpToHomestay(activeConversation.homestayId)">查看房源</el-dropdown-item>
                  <el-dropdown-item divided @click="markResolved">标记已解决</el-dropdown-item>
                  <el-dropdown-item @click="archiveConversation">归档会话</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <!-- 投诉警告横幅 -->
        <div v-if="activeConversation.type === 'complaint' && activeConversation.complaintInfo" class="complaint-banner">
          <div class="banner-left">
            <el-icon color="#fa8c16" size="18"><WarningFilled /></el-icon>
            <div class="banner-text">
              <span class="banner-title">投诉处理中</span>
              <span class="banner-desc">{{ activeConversation.complaintInfo.reason }}</span>
            </div>
          </div>
          <div class="banner-right">
            <span v-if="activeConversation.complaintInfo.deadline" class="banner-deadline">
              剩余 {{ getRemainingTime(activeConversation.complaintInfo.deadline) }}
            </span>
            <el-button size="small" type="primary" @click="showComplaintPanel = !showComplaintPanel">
              处理
            </el-button>
          </div>
        </div>

        <!-- 投诉处理面板 -->
        <transition name="slide-down">
          <div v-if="showComplaintPanel && activeConversation.type === 'complaint'" class="complaint-panel">
            <div class="panel-evidence">
              <div class="panel-label">用户举证</div>
              <div class="evidence-images">
                <el-image
                  v-for="(img, i) in activeConversation.complaintInfo?.evidenceImages"
                  :key="i"
                  :src="img"
                  fit="cover"
                  class="evidence-img"
                  :preview-src-list="activeConversation.complaintInfo?.evidenceImages"
                  :initial-index="i"
                />
              </div>
            </div>
            <div class="panel-actions">
              <el-button type="success" @click="handleComplaint('agree')">同意退款</el-button>
              <el-button type="primary" @click="handleComplaint('negotiate')">协商方案</el-button>
              <el-button type="danger" @click="handleComplaint('reject')">拒绝投诉</el-button>
              <el-button @click="handleComplaint('arbitration')">申请仲裁</el-button>
            </div>
          </div>
        </transition>

        <!-- 消息区域 -->
        <div
          class="chat-messages"
          ref="chatMessagesRef"
          @scroll="handleMessagesScroll"
        >
          <!-- 加载历史 -->
          <div v-if="loadingHistory" class="loading-more">
            <el-icon class="is-loading"><Loading /></el-icon> 加载更多...
          </div>

          <!-- 新消息提示 -->
          <transition name="fade">
            <div v-if="hasNewMessage && !isAtBottom" class="new-msg-btn" @click="scrollToBottom">
              有新消息 ↓
            </div>
          </transition>

          <!-- 时间分割线 + 消息 -->
          <div v-for="(group, gi) in messageGroups" :key="gi">
            <!-- 时间分割线 -->
            <div class="time-divider">
              <span>{{ group.dateLabel }}</span>
            </div>

            <!-- 消息列表 -->
            <div
              v-for="msg in group.messages"
              :key="msg.id"
              class="message-row"
              :class="msg.sender"
            >
              <!-- 系统消息 -->
              <div v-if="msg.type === 'system' || msg.sender === 'system'" class="system-msg">
                <span>{{ msg.content }}</span>
              </div>

              <!-- 正常消息气泡 -->
              <template v-else>
                <!-- 头像（对方消息时显示） -->
                <el-image
                  v-if="msg.sender === 'user'"
                  :src="activeConversation.user.avatar"
                  fit="cover"
                  class="msg-avatar"
                />

              <!-- 气泡 -->
              <div class="bubble-wrap" @contextmenu.prevent="openContextMenu($event, msg)">
                  <!-- 引用回复 -->
                  <div v-if="msg.quotedContent" class="quoted-msg">
                    {{ msg.quotedContent }}
                  </div>

                  <!-- 图片消息 -->
                  <div v-if="msg.type === 'image'" class="bubble image-bubble">
                    <el-image
                      :src="msg.imageUrl"
                      fit="cover"
                      class="msg-image"
                      :preview-src-list="msg.imageUrl ? [msg.imageUrl] : []"
                      :initial-index="0"
                    />
                  </div>

                  <!-- 房源卡片消息 -->
                  <div v-else-if="msg.type === 'card' && msg.cardData" class="bubble card-bubble" @click="jumpToHomestay(msg.cardData.homestayId)">
                    <div class="card-content">
                      <el-image :src="msg.cardData.coverImage" fit="cover" class="card-cover" />
                      <div class="card-info">
                        <div class="card-title">{{ msg.cardData.title }}</div>
                        <div class="card-price">¥{{ msg.cardData.price }}<span class="card-unit">/晚</span></div>
                        <div v-if="msg.cardData.checkIn" class="card-dates">
                          {{ msg.cardData.checkIn }} ~ {{ msg.cardData.checkOut }}
                        </div>
                      </div>
                    </div>
                    <div class="card-footer">查看详情 →</div>
                  </div>

                  <!-- 文本消息 -->
                  <div v-else class="bubble" :class="msg.sender">
                    <span>{{ msg.content }}</span>
                  </div>

                  <!-- 消息状态 -->
                  <div class="msg-status">
                    <!-- 撤回 -->
                    <span v-if="msg.isRecalled" class="recall-text">已撤回</span>
                    <!-- 发送失败 -->
                    <el-tooltip v-else-if="msg.status === 'failed'" content="发送失败，点击重试">
                      <el-icon color="#ff4d4f" @click="retrySend(msg)"><CircleCloseFilled /></el-icon>
                    </el-tooltip>
                    <!-- 发送中 -->
                    <el-icon v-else-if="msg.status === 'sending'" class="is-loading" color="#bfbfbf"><Loading /></el-icon>
                    <!-- 已读 -->
                    <span v-else-if="msg.isRead && msg.sender === 'host'" class="read-text">已读</span>
                  </div>
                </div>

                <!-- 头像（自己的消息时显示） -->
                <el-image
                  v-if="msg.sender === 'host'"
                  :src="hostAvatar"
                  fit="cover"
                  class="msg-avatar"
                />
              </template>
            </div>
          </div>

          <!-- 底部占位 -->
          <div id="chat-bottom-anchor" style="height: 1px" />
        </div>

        <!-- 对方输入状态 -->
        <transition name="fade">
          <div v-if="typingStatus" class="typing-indicator">
            {{ activeConversation.user.name }}正在输入<span class="typing-dots">...</span>
          </div>
        </transition>

        <!-- 底部输入区 -->
        <div class="chat-input-area">
          <!-- 工具栏 -->
          <div class="input-toolbar">
            <div class="toolbar-left">
              <el-tooltip content="表情" placement="top">
                <el-button text @click="showEmoji = !showEmoji">
                  <svg t="1774493605625" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4813" width="18" height="18"><path d="M942.577061 507.011382c0-237.637282-192.632275-430.269557-430.269557-430.269557s-430.269557 192.632275-430.269557 430.269557c0 237.647515 192.632275 430.27979 430.269557 430.27979 97.553827 0 186.878225-33.189913 259.055081-87.88563 2.964518-3.363607 4.91187-7.655354 4.91187-12.479219 0-10.531867-8.541537-19.073404-19.072381-19.073404-5.465478 0-10.334369 2.168386-13.808494 5.842055l-0.242524 0c-64.584947 47.526433-144.086629 75.981509-230.422973 75.981509-215.179804 0-389.645324-174.489056-389.645324-389.656581 0-215.201294 174.466544-389.644301 389.645324-389.644301 215.202317 0 389.645324 174.443008 389.645324 389.644301 0 65.738213-15.423271 127.60219-44.186362 181.922353l0 0.321318c-0.533143 1.814322-1.108241 3.583618-1.108241 5.53097 0 10.531867 8.541537 19.073404 19.073404 19.073404 8.207939 0 15.06716-5.265934 17.745153-12.523221l0 0.13303C924.544359 645.279493 942.577061 578.258053 942.577061 507.011382zM399.574976 391.378805c0-24.028253-19.47147-43.499723-43.500746-43.499723-24.029276 0-43.478234 19.47147-43.478234 43.499723 0 24.029276 19.448958 43.479257 43.478234 43.479257C380.102483 434.858062 399.574976 415.408081 399.574976 391.378805zM669.735999 347.945597c-24.004717 0-43.476187 19.448958-43.476187 43.478234 0 24.029276 19.47147 43.500746 43.476187 43.500746 24.029276 0 43.50177-19.47147 43.50177-43.500746C713.237769 367.394554 693.766298 347.945597 669.735999 347.945597zM702.196295 630.742405c0-11.793604-9.558703-21.330818-21.350261-21.330818-1.88186 0-3.562129 0.620124-5.335519 1.084705l-0.441045 0c-49.473785 22.723537-104.548124 38.610366-162.562423 38.610366-57.130162 0-111.007233-16.130376-159.907966-38.233789l-0.177032 0c-2.300392-0.818645-4.690836-1.461281-7.2798-1.461281-11.880585 0-21.505803 9.602705-21.505803 21.485337 0 8.120958 4.513804 15.222703 11.129478 18.872836 54.209646 24.6494 113.883747 42.980907 177.319521 42.980907 63.037708 0 124.240629-18.686594 178.185238-43.046399 0.308015-0.149403 0.217964-0.11154 0.070608-0.045025C696.59574 645.928269 702.196295 638.545114 702.196295 630.742405z" fill="#595959" p-id="4814"></path></svg>
                </el-button>
              </el-tooltip>
              <el-tooltip content="发送图片" placement="top">
                <el-button text @click="triggerImageUpload">
                  <el-icon><Picture /></el-icon>
                </el-button>
              </el-tooltip>
              <input ref="imageInputRef" type="file" accept="image/*" style="display:none" @change="handleImageSelected" />
              <el-tooltip content="快捷回复" placement="top">
                <el-button text @click="showQuickReply = !showQuickReply">
                  <el-icon><ChatSquare /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </div>

          <!-- 表情面板 -->
          <transition name="slide-up">
            <div v-if="showEmoji" class="emoji-panel">
              <span
                v-for="e in emojiList"
                :key="e"
                class="emoji-item"
                @click="insertEmoji(e)"
              >{{ e }}</span>
            </div>
          </transition>

          <!-- 快捷回复面板 -->
          <transition name="slide-up">
            <div v-if="showQuickReply" class="quick-reply-panel">
              <div
                v-for="(qr, i) in quickReplies"
                :key="i"
                class="quick-reply-item"
                @click="sendQuickReply(qr)"
              >{{ qr }}</div>
            </div>
          </transition>

          <!-- 输入框 -->
          <div class="input-row">
            <textarea
              ref="inputTextRef"
              v-model="inputText"
              class="input-textarea"
              placeholder="请输入消息..."
              rows="1"
              @keydown.enter.exact.prevent="handleSend"
              @keydown.enter.shift.exact="null"
              @input="autoResizeTextarea"
            />
            <el-button
              type="primary"
              class="send-btn"
              :disabled="!inputText.trim()"
              @click="handleSend"
            >
              发送
            </el-button>
          </div>

          <!-- 发送图片预览 -->
          <div v-if="pendingImage" class="image-preview-row">
            <div class="preview-item">
              <el-image :src="pendingImage" fit="cover" class="preview-img" />
              <el-icon class="preview-del" @click="pendingImage = ''"><Close /></el-icon>
            </div>
            <el-button size="small" @click="pendingImage = ''">取消</el-button>
            <el-button size="small" type="primary" @click="sendImage">发送图片</el-button>
          </div>
        </div>
      </template>
      </template>
    </main>

    <!-- ====== 右键上下文菜单 ====== -->
    <teleport to="body">
      <transition name="ctx-fade">
        <div v-if="ctxMenu.visible" class="ctx-overlay" @click="closeCtxMenu" @contextmenu.prevent>
          <div class="ctx-menu" :style="ctxMenu.style" @click.stop>
            <div v-for="(item, idx) in ctxMenu.items" :key="idx"
              class="ctx-item"
              :class="{ danger: item.danger, disabled: item.disabled }"
              @click="item.disabled ? null : item.action()"
            >
              {{ item.label }}
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- ====== 投诉处理对话框 ====== -->
    <el-dialog v-model="complaintDialog.visible" :title="complaintDialog.title" width="440px" destroy-on-close>
      <el-form :model="complaintForm" label-width="90px">
        <template v-if="complaintDialog.type === 'agree'">
          <el-form-item label="退款金额">
            <el-input-number v-model="complaintForm.refundAmount" :min="0" :max="complaintForm.maxRefund" :precision="2" controls-position="right" style="width: 100%" />
            <div class="form-tip">最高可退款 ¥{{ complaintForm.maxRefund.toLocaleString() }}</div>
          </el-form-item>
          <el-form-item label="处理备注">
            <el-input v-model="complaintForm.note" type="textarea" :rows="3" placeholder="请输入备注说明（选填）" />
          </el-form-item>
        </template>
        <template v-else-if="complaintDialog.type === 'negotiate'">
          <el-form-item label="协商金额">
            <el-input-number v-model="complaintForm.refundAmount" :min="0" :max="complaintForm.maxRefund" :precision="2" controls-position="right" style="width: 100%" />
          </el-form-item>
          <el-form-item label="说明">
            <el-input v-model="complaintForm.note" type="textarea" :rows="3" placeholder="请说明协商方案" />
          </el-form-item>
        </template>
        <template v-else-if="complaintDialog.type === 'reject'">
          <el-form-item label="拒绝理由" required>
            <el-input v-model="complaintForm.note" type="textarea" :rows="3" placeholder="请详细说明拒绝原因" />
          </el-form-item>
        </template>
        <template v-else>
          <el-alert type="info" :closable="false">
            申请平台介入仲裁，由平台客服根据双方证据进行裁决，裁决结果对双方均有约束力。
          </el-alert>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="complaintDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmComplaintAction">确认</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ChatDotRound, WarningFilled, Bell, Phone, MoreFilled, ArrowLeft,
  Picture, ChatSquare, Close, Loading, CircleCloseFilled,
  ChatLineSquare, FolderChecked, List, Tickets, Comment
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { request } from '@/api/request'
import { orders } from '@/mock/data'
import type {
  Conversation, ChatMessage, SystemNotification
} from '@/types'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.locale('zh-cn')
dayjs.extend(relativeTime)

// ==================== 常量 ====================
const hostAvatar = '/avatar.jpg'

const emojiList = ['😀','😂','😍','😊','🥰','😎','🤔','😅','😭','🤯','🥳','😴','🤝','👍','👎','❤️','🧡','💛','💚','💙','💜','🖤','🤍','💯','🔥','⭐','✨','🎉','🎊','🏠','🛏️','🛋️','🚿','📅','🕐','📍','✅','❌','⚠️','💬','📞','🔔']

const quickReplies = [
  '您好，请问有什么可以帮您的？',
  '欢迎入住，有什么问题随时联系我~',
  '房间WiFi密码：house2026',
  '退房时间是中午12点前',
  '好的，已收到您的消息',
  '感谢您的理解与支持！',
  '祝您旅途愉快！',
]

// ==================== 状态 ====================
const convSearch = ref('')
const activeTab = ref<'conversations' | 'system'>('conversations')
const activeConversation = ref<Conversation | null>(null)
const conversations = ref<Conversation[]>([])
const messages = ref<ChatMessage[]>([])
const notifications = ref<SystemNotification[]>([])
const selectedNotification = ref<SystemNotification | null>(null)
const router = useRouter()
const loadingHistory = ref(false)
const hasNewMessage = ref(false)
const isAtBottom = ref(true)
  const typingStatus = ref(false)
const showPhone = ref(false)
const showComplaintPanel = ref(false)
const showEmoji = ref(false)
const showQuickReply = ref(false)
const inputText = ref('')
const pendingImage = ref('')
const inputTextRef = ref<HTMLTextAreaElement>()
const imageInputRef = ref<HTMLInputElement>()
const chatMessagesRef = ref<HTMLElement>()

// 分页
const page = ref(1)
const noMoreHistory = ref(false)

// ==================== 投诉处理 ====================
const complaintDialog = ref({
  visible: false,
  title: '',
  type: '' as 'agree' | 'negotiate' | 'reject' | 'arbitration',
})
const complaintForm = reactive({
  refundAmount: 0,
  maxRefund: 0,
  note: '',
})

// ==================== 右键菜单 ====================
const ctxMenu = ref({
  visible: false,
  style: { top: '0px', left: '0px' },
  items: [] as { label: string; action: () => void; danger?: boolean; disabled?: boolean }[],
})
const ctxMenuTargetMsg = ref<ChatMessage | null>(null)

// ==================== 计算属性 ====================
const isMobile = computed(() => window.innerWidth < 768)

const totalUnread = computed(() => conversations.value.reduce((s, c) => s + c.unreadCount, 0))
const unreadNotifications = computed(() => notifications.value.filter(n => !n.isRead).length)

const filteredConversations = computed(() => {
  if (!convSearch.value) return conversations.value
  const q = convSearch.value.toLowerCase()
  return conversations.value.filter(c =>
    c.user.name.toLowerCase().includes(q) ||
    c.homestayTitle.toLowerCase().includes(q) ||
    c.lastMessage.content.toLowerCase().includes(q) ||
    (c.complaintInfo?.reason?.toLowerCase().includes(q))
  )
})

// 消息分组（按日期）
const messageGroups = computed(() => {
  const groups: { dateLabel: string; messages: ChatMessage[] }[] = []
  const today = dayjs().format('YYYY-MM-DD')
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')

  let currentGroup: typeof groups[0] | null = null

  messages.value.forEach(msg => {
    const msgDate = msg.timestamp.substring(0, 10)
    let label = dayjs(msgDate).format('YYYY年M月D日')
    if (msgDate === today) label = '今天'
    else if (msgDate === yesterday) label = '昨天'
    else if (dayjs().diff(dayjs(msgDate), 'day') < 7) label = dayjs(msgDate).format('dddd')

    if (!currentGroup || currentGroup.dateLabel !== label) {
      currentGroup = { dateLabel: label, messages: [] }
      groups.push(currentGroup)
    }
    currentGroup.messages.push(msg)
  })

  return groups
})

// ==================== 加载数据 ====================
async function loadConversations() {
  try {
    conversations.value = await request.get<Conversation[]>('/host/conversations')
  } catch {
    conversations.value = []
  }
}

async function loadNotifications() {
  try {
    notifications.value = await request.get<SystemNotification[]>('/host/notifications')
  } catch {
    notifications.value = []
  }
}

async function loadMessages(convId: string, reset = false) {
  if (reset) {
    page.value = 1
    noMoreHistory.value = false
  }

  try {
    const list = await request.get<ChatMessage[]>(`/host/conversations/${convId}/messages`)
    if (reset) {
      messages.value = list
    } else {
      messages.value = [...list, ...messages.value]
    }
  } catch {
    if (reset) messages.value = []
  }

  nextTick(() => {
    if (reset) scrollToBottom()
  })
}

async function markAsRead(convId: string) {
  try {
    await request.post('/host/conversations/read', { conversationId: convId })
  } catch {
    return
  }
  const conv = conversations.value.find(c => c.id === convId)
  if (conv) conv.unreadCount = 0
}

// ==================== 会话选择 ====================
async function selectConversation(conv: Conversation) {
  if (activeConversation.value?.id === conv.id) return

  showComplaintPanel.value = false
  showEmoji.value = false
  showQuickReply.value = false

  activeConversation.value = conv
  await markAsRead(conv.id)
  await loadMessages(conv.id, true)

  // 设置投诉退款上限
  if (conv.type === 'complaint' && conv.orderId) {
    const order = orders.find(o => o.orderId === conv.orderId)
    complaintForm.maxRefund = order?.totalAmount || 0
  }
}

// ==================== 消息发送 ====================
async function handleSend() {
  const text = inputText.value.trim()
  if (!text || !activeConversation.value) return

  const tempId = `temp_${Date.now()}`
  const newMsg: ChatMessage = {
    id: tempId,
    conversationId: activeConversation.value.id,
    sender: 'host',
    type: 'text',
    content: text,
    timestamp: new Date().toISOString(),
    isRead: false,
    status: 'sending',
  }

  messages.value.push(newMsg)
  inputText.value = ''
  nextTick(() => { autoResizeTextarea(); scrollToBottom(); })

  try {
    const data = await request.post<ChatMessage>('/host/messages/send', {
      conversationId: activeConversation.value.id,
      type: 'text',
      content: text,
    })
    const idx = messages.value.findIndex(m => m.id === tempId)
    if (idx >= 0) {
      messages.value[idx] = { ...messages.value[idx]!, ...data, status: 'sent' }
    }
    const conv = conversations.value.find(c => c.id === activeConversation.value?.id)
    if (conv) {
      conv.lastMessage = { content: text, type: 'text', timestamp: newMsg.timestamp, sender: 'host' }
      conv.updatedAt = newMsg.timestamp
    }
  } catch (e: any) {
    const idx = messages.value.findIndex(m => m.id === tempId)
    if (idx >= 0) messages.value[idx]!.status = 'failed'
    if (!(e as any).originalError && e?.message) {
      ElMessage.error(e.message)
    }
  }
}

async function sendImage() {
  if (!pendingImage.value || !activeConversation.value) return
  const tempId = `temp_${Date.now()}`
  const newMsg: ChatMessage = {
    id: tempId,
    conversationId: activeConversation.value.id,
    sender: 'host',
    type: 'image',
    content: '',
    imageUrl: pendingImage.value,
    timestamp: new Date().toISOString(),
    isRead: false,
    status: 'sending',
  }
  messages.value.push(newMsg)
  const imageUrl = pendingImage.value
  pendingImage.value = ''
  nextTick(() => scrollToBottom())

  try {
    await request.post('/host/messages/send', {
      conversationId: activeConversation.value.id,
      type: 'image',
      imageUrl,
    })
    const idx = messages.value.findIndex(m => m.id === tempId)
    if (idx >= 0) messages.value[idx]!.status = 'sent'
  } catch {
    const idx = messages.value.findIndex(m => m.id === tempId)
    if (idx >= 0) messages.value[idx]!.status = 'failed'
  }
}

function sendQuickReply(text: string) {
  inputText.value = text
  showQuickReply.value = false
  handleSend()
}

// ==================== 撤回 ====================
async function recallMessage(msg: ChatMessage) {
  closeCtxMenu()
  if (msg.sender !== 'host') return
  const twoMinsAgo = Date.now() - 2 * 60 * 1000
  if (new Date(msg.timestamp).getTime() < twoMinsAgo) {
    ElMessage.warning('超过2分钟，无法撤回')
    return
  }
  try {
    await request.post('/host/messages/recall', { conversationId: msg.conversationId, messageId: msg.id })
  } catch {
    return
  }
  msg.status = 'recalled'
  msg.isRecalled = true
  msg.recalledAt = new Date().toISOString()
}

async function retrySend(msg: ChatMessage) {
  msg.status = 'sending'
  // 简单重发逻辑
  await new Promise(r => setTimeout(r, 500))
  msg.status = 'sent'
}

// ==================== 表情 & 图片 ====================
function insertEmoji(e: string) {
  const ta = inputTextRef.value
  if (!ta) {
    inputText.value += e
    return
  }
  const start = ta.selectionStart
  const end = ta.selectionEnd
  inputText.value = inputText.value.substring(0, start) + e + inputText.value.substring(end)
  nextTick(() => {
    ta.selectionStart = ta.selectionEnd = start + e.length
    ta.focus()
  })
}

function triggerImageUpload() {
  showEmoji.value = false
  showQuickReply.value = false
  imageInputRef.value?.click()
}

function handleImageSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    pendingImage.value = ev.target?.result as string
  }
  reader.readAsDataURL(file)
  ;(e.target as HTMLInputElement).value = ''
}

// ==================== 滚动处理 ====================
async function handleMessagesScroll() {
  const el = chatMessagesRef.value
  if (!el) return
  const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
  isAtBottom.value = distFromBottom < 80

  if (el.scrollTop < 60 && !noMoreHistory.value && !loadingHistory.value) {
    loadingHistory.value = true
    await new Promise(r => setTimeout(r, 600))
    // 模拟加载更多（实际项目中调用 API）
    loadingHistory.value = false
    if (page.value >= 2) noMoreHistory.value = true
    page.value++
  }
}

function scrollToBottom() {
  nextTick(() => {
    const el = document.getElementById('chat-bottom-anchor')
    el?.scrollIntoView({ behavior: 'smooth' })
    hasNewMessage.value = false
    isAtBottom.value = true
  })
}

watch(messages, () => {
  if (isAtBottom.value) scrollToBottom()
  else hasNewMessage.value = true
}, { deep: true })

// ==================== 工具函数 ====================
function formatConvTime(ts: string) {
  const d = dayjs(ts)
  const today = dayjs().startOf('day')
  const msgDay = d.startOf('day')
  const diffDays = today.diff(msgDay, 'day')

  if (diffDays === 0) return d.format('HH:mm')
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return d.format('ddd')
  return d.format('M/D')
}

function getRemainingTime(deadline: string) {
  const diff = dayjs(deadline).diff(dayjs(), 'hour')
  if (diff < 0) return '已超时'
  if (diff < 24) return `${diff}小时`
  return `${Math.floor(diff / 24)}天`
}

function getNotifIcon(type: string) {
  const map: Record<string, any> = {
    order: Tickets,
    review: FolderChecked,
    audit: List,
    finance: 'Money' as any,
    system: Bell,
  }
  return map[type] || Bell
}

function autoResizeTextarea() {
  const ta = inputTextRef.value
  if (!ta) return
  ta.style.height = 'auto'
  const maxH = 120
  ta.style.height = Math.min(ta.scrollHeight, maxH) + 'px'
}

// ==================== 系统通知 ====================
function setActiveTab(tab: 'conversations' | 'system') {
  activeTab.value = tab
  if (tab === 'conversations') {
    selectedNotification.value = null
  }
}

function notifTypeLabel(type: string) {
  const map: Record<string, string> = {
    order: '订单',
    review: '评价',
    audit: '审核',
    finance: '财务',
    system: '系统',
  }
  return map[type] || type
}

function goRelatedNotif(n: SystemNotification) {
  if (!n.relatedId) return
  const id = n.relatedId
  switch (n.type) {
    case 'order':
      router.push({ path: '/host/orders', query: { id: String(id) } })
      break
    case 'review':
    case 'audit':
      router.push({ path: '/host/properties' })
      break
    case 'finance':
      router.push({ path: '/host/finance' })
      break
    default:
      break
  }
}

function handleNotifClick(notif: SystemNotification) {
  notif.isRead = true
  selectedNotification.value = notif
}

// ==================== 投诉处理 ====================
function handleComplaint(type: 'agree' | 'negotiate' | 'reject' | 'arbitration') {
  const titles: Record<string, string> = {
    agree: '同意退款',
    negotiate: '协商方案',
    reject: '拒绝投诉',
    arbitration: '申请仲裁',
  }
  complaintDialog.value = { visible: true, title: titles[type] ?? '', type }
}

async function confirmComplaintAction() {
  if (complaintDialog.value.type === 'reject' && !complaintForm.note.trim()) {
    ElMessage.warning('请填写拒绝理由')
    return
  }
  if ((complaintDialog.value.type === 'agree' || complaintDialog.value.type === 'negotiate') && complaintForm.refundAmount <= 0) {
    ElMessage.warning('请输入退款金额')
    return
  }
  complaintDialog.value.visible = false
  showComplaintPanel.value = false

  const messages: Record<string, string> = {
    agree: `已同意退款 ¥${complaintForm.refundAmount.toLocaleString()}`,
    negotiate: `已发起协商，退款金额 ¥${complaintForm.refundAmount.toLocaleString()}（${complaintForm.note}）`,
    reject: `已拒绝投诉，原因：${complaintForm.note}`,
    arbitration: '已申请平台仲裁，等待平台介入处理',
  }
  ElMessage.success(messages[complaintDialog.value.type])
}

// ==================== 导航跳转 ====================
function jumpToOrder(orderId?: number) {
  if (orderId) window.location.href = `/host/orders?id=${orderId}`
  else ElMessage.info('该会话暂无关联订单')
}

function jumpToHomestay(homestayId: number) {
  window.location.href = `/homestay/${homestayId}`
}

function markResolved() {
  if (!activeConversation.value) return
  if (activeConversation.value.type !== 'complaint') {
    ElMessage.info('该会话暂无需要解决的问题')
    return
  }
  ElMessageBox.confirm('确认标记该投诉为已解决？', '标记已解决', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    activeConversation.value!.type = 'consult'
    activeConversation.value!.complaintInfo = undefined
    ElMessage.success('已标记为已解决')
  }).catch(() => {})
}

function archiveConversation() {
  if (!activeConversation.value) return
  ElMessageBox.confirm('确认归档该会话？归档后将移出列表', '归档会话', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    conversations.value = conversations.value.filter(c => c.id !== activeConversation.value?.id)
    activeConversation.value = null
    ElMessage.success('会话已归档')
  }).catch(() => {})
}

// ==================== 右键菜单 ====================
function openContextMenu(e: MouseEvent, msg: ChatMessage) {
  ctxMenuTargetMsg.value = msg
  ctxMenu.value = {
    visible: true,
    style: { top: `${Math.min(e.clientY, window.innerHeight - 160)}px`, left: `${Math.min(e.clientX, window.innerWidth - 160)}px` },
    items: [
      { label: '复制', action: () => { navigator.clipboard.writeText(msg.content); closeCtxMenu(); ElMessage.success('已复制'); } },
      { label: '撤回', action: () => recallMessage(msg), danger: true, disabled: msg.sender !== 'host' },
      { label: '删除', action: () => { messages.value = messages.value.filter(m => m.id !== msg.id); closeCtxMenu(); ElMessage.success('已删除'); }, danger: true },
    ]
  }
}

function closeCtxMenu() { ctxMenu.value.visible = false }

// 点击其他区域关闭表情/快捷回复面板
function handleGlobalClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.emoji-panel') && !target.closest('.toolbar-left .el-button')) showEmoji.value = false
  if (!target.closest('.quick-reply-panel') && !target.closest('.toolbar-left .el-button')) showQuickReply.value = false
}

watch(activeConversation, () => {
  typingStatus.value = false
})

// ==================== 生命周期 ====================
onMounted(() => {
  loadConversations()
  loadNotifications()
  document.addEventListener('click', handleGlobalClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick)
})
</script>

<style scoped lang="scss">
// ==================== 页面布局 ====================
.messages-page {
  display: flex;
  height: 100%;
  overflow: hidden;
  background: #f5f5f5;
}

// ==================== 左侧会话列表 ====================
.conv-list {
  width: 280px;
  flex-shrink: 0;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.conv-search {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  :deep(.el-input__wrapper) { background: #f5f5f5; border-radius: 4px; box-shadow: none; }
}

.conv-tabs {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}

.conv-tab {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  font-size: 13px;
  color: #595959;
  cursor: pointer;
  position: relative;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;

  &.active { color: #1890ff; font-weight: 600; }
  &:hover:not(.active) { background: #fafafa; }

  .tab-badge {
    background: #ff4d4f;
    color: white;
    font-size: 10px;
    padding: 1px 5px;
    border-radius: 10px;
    font-weight: 600;
    min-width: 16px;
    text-align: center;
  }
}

.conv-items {
  flex: 1;
  overflow-y: auto;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: #d9d9d9; border-radius: 2px; }
}

.conv-empty {
  text-align: center;
  padding: 48px 20px;
  color: #bfbfbf;
  p { margin-top: 8px; font-size: 13px; }
}

.conv-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f9f9f9;

  &:hover { background: #e9e9e9; }
  &.active {
    background: #c6c6c6;
    border-left: 2px solid #1890ff;
  }
  &.is-complaint {
    background: #fff7e6;
    &:hover { background: #ffe7b0; }
    &.active { background: #ffd591; }
  }
}

.conv-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.conv-avatar {
  width: 44px;
  height: 44px;
  border-radius: 4px;
  overflow: hidden;
  background: #f0f0f0;

  .avatar-img { width: 100%; height: 100%; }
  &.complaint-avatar { background: #ff4d4f; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
  &.system-avatar { background: #1890ff; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
}

.online-dot {
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 10px;
  height: 10px;
  background: #52c41a;
  border-radius: 50%;
  border: 2px solid white;
}

.conv-body {
  flex: 1;
  min-width: 0;
}

.conv-row1 {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;

  .conv-name {
    font-size: 14px;
    color: #1a1a1a;
    font-weight: 500;
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    &.complaint-name { color: #ff4d4f; }
  }

  .conv-time { font-size: 12px; color: #999; flex-shrink: 0; }
}

.conv-row2 {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .conv-lastmsg {
    font-size: 13px;
    color: #999;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }

  .unread-badge {
    background: #ff3b30;
    color: white;
    font-size: 10px;
    min-width: 18px;
    height: 18px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    font-weight: 700;
    flex-shrink: 0;
    border: 1px solid white;
    &.badge-large { min-width: 24px; }
  }
}

// ==================== 系统通知 ====================
.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f9f9f9;
  position: relative;

  &:hover { background: #f5f5f5; }
  &.unread { background: #f0f7ff; .notif-title { font-weight: 700; } }
}

.notif-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  &.order { background: #1890ff; }
  &.review { background: #52c41a; }
  &.audit { background: #faad14; }
  &.finance { background: #722ed1; }
  &.system { background: #8c8c8c; }
}

.notif-body { flex: 1; min-width: 0; }
.notif-title { font-size: 13px; font-weight: 500; color: #262626; margin-bottom: 4px; }
.notif-content { font-size: 12px; color: #8c8c8c; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.notif-time { font-size: 11px; color: #bfbfbf; margin-top: 4px; }
.notif-dot { width: 8px; height: 8px; border-radius: 50%; background: #ff3b30; flex-shrink: 0; margin-top: 4px; }

// ==================== 右侧聊天区域 ====================
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f5f5f5;
}

.chat-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 0;
  .chat-empty-text { font-size: 14px; color: #bfbfbf; }
}

// 系统通知详情（右侧）
.notif-detail-panel {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.notif-detail-inner {
  max-width: 560px;
  width: 100%;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.notif-detail-title {
  margin: 12px 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
  line-height: 1.4;
}

.notif-detail-meta {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 16px;
}

.notif-detail-content {
  font-size: 14px;
  line-height: 1.8;
  color: #595959;
  white-space: pre-wrap;
}

.notif-detail-link {
  margin-top: 20px;
}

// ==================== 聊天头部 ====================
.chat-header {
  height: 58px;
  background: white;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  padding: 0 16px;
  flex-shrink: 0;
  gap: 12px;

  .back-btn { color: #595959; }
  .chat-header-info { flex: 1; }
  .chat-username { font-size: 16px; font-weight: 700; color: #1a1a1a; }
  .chat-homestay-title { font-size: 12px; color: #999; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 320px; }
  .chat-header-actions { display: flex; gap: 4px; }
}

// ==================== 投诉横幅 ====================
.complaint-banner {
  background: #fffbe6;
  border-bottom: 1px solid #ffe58f;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;

  .banner-left { display: flex; align-items: center; gap: 10px; }
  .banner-text { display: flex; flex-direction: column; }
  .banner-title { font-size: 13px; font-weight: 700; color: #ad6800; }
  .banner-desc { font-size: 12px; color: #8c6d1f; margin-top: 2px; }
  .banner-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .banner-deadline { font-size: 12px; color: #ff4d4f; font-weight: 600; }
}

.complaint-panel {
  background: white;
  border-bottom: 1px solid #e6e6e6;
  padding: 14px 16px;
  flex-shrink: 0;

  .panel-label { font-size: 12px; color: #8c8c8c; margin-bottom: 8px; }
  .evidence-images { display: flex; gap: 8px; overflow-x: auto; margin-bottom: 12px; &::-webkit-scrollbar { height: 3px; } &::-webkit-scrollbar-thumb { background: #d9d9d9; } }
  .evidence-img { width: 80px; height: 60px; border-radius: 6px; cursor: pointer; flex-shrink: 0; }
  .panel-actions { display: flex; gap: 8px; flex-wrap: wrap; }
}

// ==================== 消息区域 ====================
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  position: relative;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #d9d9d9; border-radius: 3px; }
}

.loading-more {
  text-align: center;
  padding: 10px;
  font-size: 12px;
  color: #8c8c8c;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.new-msg-btn {
  position: sticky;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  background: #1890ff;
  color: white;
  font-size: 12px;
  padding: 5px 14px;
  border-radius: 12px;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(24,144,255,0.4);
  width: fit-content;
  &:hover { background: #096dd9; }
}

// 时间分割线
.time-divider {
  text-align: center;
  margin: 16px 0 10px;
  span {
    font-size: 12px;
    color: #999;
    background: rgba(0,0,0,0.04);
    padding: 3px 10px;
    border-radius: 3px;
  }
}

// 消息行（房东侧：气泡在左、头像在右，与常见 IM 一致；顶部对齐）
.message-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 4px 16px;
  margin-bottom: 2px;

  &.user {
    flex-direction: row;
    justify-content: flex-start;
  }
  &.host {
    flex-direction: row;
    justify-content: flex-end;
  }
  &.system {
    justify-content: center;
  }
}

.message-row.host .bubble-wrap {
  align-items: flex-end;
}

.message-row.host .msg-status {
  width: 100%;
  justify-content: flex-end;
}

// 系统消息
.system-msg {
  flex: 1;
  text-align: center;
  span {
    font-size: 12px;
    color: #999;
    background: rgba(0,0,0,0.04);
    padding: 3px 12px;
    border-radius: 3px;
  }
}

// 头像
.msg-avatar {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  flex-shrink: 0;
  overflow: hidden;
}

// 气泡
.bubble-wrap {
  max-width: 60%;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bubble {
  padding: 9px 13px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-all;
  position: relative;

  &.user {
    background: white;
    color: #1a1a1a;
    border-top-left-radius: 0;
    box-shadow: 0 1px 2px rgba(0,0,0,0.08);
  }
  &.host {
    background: #95EC69;
    color: #1a1a1a;
    border-top-right-radius: 0;
    box-shadow: 0 1px 2px rgba(0,0,0,0.08);
  }
}

// 图片气泡
.image-bubble {
  padding: 4px !important;
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 8px;
  overflow: hidden;
  .msg-image { max-width: 200px; max-height: 200px; border-radius: 8px; display: block; cursor: pointer; }
}

// 房源卡片
.card-bubble {
  background: white !important;
  border-radius: 8px !important;
  padding: 0 !important;
  overflow: hidden;
  cursor: pointer;
  &:hover .card-footer { color: #1890ff; }
  .card-content { display: flex; gap: 10px; padding: 10px; }
  .card-cover { width: 80px; height: 60px; border-radius: 6px; flex-shrink: 0; }
  .card-info { flex: 1; display: flex; flex-direction: column; gap: 3px; }
  .card-title { font-size: 13px; font-weight: 600; color: #262626; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px; }
  .card-price { font-size: 14px; font-weight: 700; color: #ff4d4f; .card-unit { font-size: 11px; font-weight: 400; color: #8c8c8c; } }
  .card-dates { font-size: 11px; color: #8c8c8c; }
  .card-footer { text-align: center; padding: 7px; font-size: 12px; color: #8c8c8c; border-top: 1px solid #f0f0f0; transition: color 0.15s; }
}

// 引用
.quoted-msg {
  font-size: 12px;
  color: #8c8c8c;
  background: rgba(0,0,0,0.04);
  padding: 3px 8px;
  border-radius: 3px;
  margin-bottom: 3px;
  border-left: 2px solid #d9d9d9;
}

// 状态
.msg-status {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  min-height: 14px;
  .read-text { color: #bfbfbf; }
  .recall-text { color: #bfbfbf; }
  .el-icon { cursor: pointer; }
}

// 对方输入
.typing-indicator {
  text-align: center;
  padding: 4px 0;
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
  .typing-dots { animation: blink 1.2s infinite; }
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }

// ==================== 输入区 ====================
.chat-input-area {
  background: white;
  border-top: 1px solid #e6e6e6;
  flex-shrink: 0;
  position: relative;
}

.input-toolbar {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-bottom: 1px solid #f0f0f0;
  .toolbar-left { display: flex; gap: 2px; }
}

.emoji-panel {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e6e6e6;
  border-radius: 8px 8px 0 0;
  padding: 8px;
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 2px;
  max-height: 180px;
  overflow-y: auto;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.08);
  z-index: 10;
  .emoji-item { text-align: center; font-size: 22px; padding: 4px; cursor: pointer; border-radius: 4px; &:hover { background: #f5f5f5; } }
}

.quick-reply-panel {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e6e6e6;
  border-radius: 8px 8px 0 0;
  padding: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  z-index: 10;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.08);
  .quick-reply-item {
    font-size: 12px;
    color: #595959;
    background: #f5f5f5;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    &:hover { background: #e6f7ff; color: #1890ff; }
  }
}

.input-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 12px;
}

.input-textarea {
  flex: 1;
  border: none;
  background: #f5f5f5;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 14px;
  color: #262626;
  resize: none;
  outline: none;
  line-height: 1.6;
  min-height: 36px;
  max-height: 120px;
  &::placeholder { color: #bfbfbf; }
}

.send-btn {
  flex-shrink: 0;
  border-radius: 4px !important;
  padding: 7px 16px !important;
  background: #1890ff !important;
  border-color: #1890ff !important;
  &:disabled { background: #d9d9d9 !important; border-color: #d9d9d9 !important; }
}

// 图片预览
.image-preview-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-top: 1px solid #f0f0f0;
  .preview-item { position: relative; }
  .preview-img { width: 60px; height: 60px; border-radius: 6px; }
  .preview-del { position: absolute; top: -6px; right: -6px; background: rgba(0,0,0,0.5); color: white; border-radius: 50%; cursor: pointer; font-size: 14px; }
}

// ==================== 右键菜单 ====================
.ctx-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
}

.ctx-menu {
  position: fixed;
  background: white;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  min-width: 140px;
  padding: 4px;
  z-index: 10000;

  .ctx-item {
    padding: 7px 12px;
    font-size: 13px;
    color: #262626;
    cursor: pointer;
    border-radius: 4px;
    &:hover { background: #f5f5f5; }
    &.danger { color: #ff4d4f; &:hover { background: #fff1f0; } }
    &.disabled { color: #d9d9d9; cursor: not-allowed; }
  }
}

.ctx-fade-enter-active, .ctx-fade-leave-active { transition: opacity 0.12s; }
.ctx-fade-enter-from, .ctx-fade-leave-to { opacity: 0; }

// ==================== 动画 ====================
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.2s ease; overflow: hidden; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-8px); max-height: 0; }
.slide-down-enter-to, .slide-down-leave-from { max-height: 400px; }

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.18s ease; overflow: hidden; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(8px); }
.slide-up-enter-to, .slide-up-leave-from { opacity: 1; transform: translateY(0); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

// ==================== 表单辅助 ====================
.form-tip {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
  &.warning { color: #fa8c16; }
}

// ==================== 响应式 ====================
@media (max-width: 768px) {
  .conv-list {
    width: 100%;
    &.mobile-hidden { display: none; }
  }
  .chat-area {
    display: none;
    &.mobile-show { display: flex; width: 100%; }
  }
}
</style>
