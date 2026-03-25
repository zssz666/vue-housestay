<template>
  <div class="tj-page tj-chatlist-page">
    <!-- 顶部导航 -->
    <div class="tj-page__header">
      <div class="tj-page__header-left" @click="$router.back()">
        <van-icon name="arrow-left" size="20" color="#333" />
      </div>
      <span class="tj-page__header-title">消息中心</span>
      <div class="tj-page__header-right"></div>
    </div>

    <!-- 消息分类 -->
    <van-tabs v-model:active="activeTab" shrink sticky>
      <van-tab title="房东咨询" name="chat"></van-tab>
      <van-tab title="系统通知" name="system"></van-tab>
      <van-tab title="订单通知" name="order"></van-tab>
    </van-tabs>

    <!-- 房东咨询列表 -->
    <div v-if="activeTab === 'chat'" class="chat-list">
      <div
        v-for="item in chatList"
        :key="item.conversationId"
        class="chat-item"
        @click="goChat(item)"
      >
        <div class="chat-item__avatar">
          <img :src="item.hostAvatar || 'https://picsum.photos/80/80?random=host'" :alt="item.hostName" />
          <div v-if="item.unread > 0" class="chat-item__badge">
            {{ item.unread > 99 ? '99+' : item.unread }}
          </div>
        </div>
        <div class="chat-item__body">
          <div class="chat-item__top">
            <span class="chat-item__name">{{ item.hostName }}</span>
            <span class="chat-item__time">{{ formatTime(item.lastMessageTime) }}</span>
          </div>
          <div class="chat-item__bottom">
            <span class="chat-item__preview">{{ item.lastMessage }}</span>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && !chatList.length" class="tj-empty">
        <div class="tj-empty__icon">💬</div>
        <div class="tj-empty__title">暂无消息</div>
        <div class="tj-empty__desc">有消息时会在这里通知您</div>
      </div>
    </div>

    <!-- 系统通知列表 -->
    <div v-if="activeTab === 'system'" class="msg-section">
      <div
        v-for="msg in systemMessages"
        :key="msg.id"
        class="msg-card"
        :class="{ 'is-unread': !msg.read }"
        @click="readMsg(msg)"
      >
        <div class="msg-card__icon" style="background: #FFF3E0;">
          <van-icon name="bell" size="20" color="#FF9645" />
        </div>
        <div class="msg-card__body">
          <div class="msg-card__title">{{ msg.title }}</div>
          <div class="msg-card__desc">{{ msg.content }}</div>
          <div class="msg-card__time">{{ msg.time }}</div>
        </div>
        <div v-if="!msg.read" class="msg-card__dot"></div>
      </div>

      <div v-if="!loading && !systemMessages.length" class="tj-empty">
        <div class="tj-empty__icon">🔔</div>
        <div class="tj-empty__title">暂无系统通知</div>
      </div>
    </div>

    <!-- 订单通知列表 -->
    <div v-if="activeTab === 'order'" class="msg-section">
      <div
        v-for="msg in orderMessages"
        :key="msg.id"
        class="msg-card"
        :class="{ 'is-unread': !msg.read }"
        @click="readMsg(msg)"
      >
        <div class="msg-card__icon" style="background: #E8F4FD;">
          <van-icon name="todo-list-o" size="20" color="#4A90D9" />
        </div>
        <div class="msg-card__body">
          <div class="msg-card__title">{{ msg.title }}</div>
          <div class="msg-card__desc">{{ msg.content }}</div>
          <div class="msg-card__time">{{ msg.time }}</div>
        </div>
        <div v-if="!msg.read" class="msg-card__dot"></div>
      </div>

      <div v-if="!loading && !orderMessages.length" class="tj-empty">
        <div class="tj-empty__icon">📋</div>
        <div class="tj-empty__title">暂无订单通知</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(false);
const activeTab = ref('chat');

interface ChatConversation {
  conversationId: number;
  homestayId: number;
  homestayTitle: string;
  hostId: number;
  hostName: string;
  hostAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
}

interface SystemMsg {
  id: number;
  title: string;
  content: string;
  time: string;
  read: boolean;
}

const chatList = ref<ChatConversation[]>([
  {
    conversationId: 1,
    homestayId: 1,
    homestayTitle: '春熙路轻奢两居室',
    hostId: 501,
    hostName: '李房东',
    hostAvatar: 'https://picsum.photos/80/80?random=51',
    lastMessage: '您好，欢迎入住！有什么问题随时联系我~',
    lastMessageTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    unread: 2,
  },
  {
    conversationId: 2,
    homestayId: 3,
    homestayTitle: '宽窄巷子复古民宿',
    hostId: 502,
    hostName: '王房东',
    hostAvatar: 'https://picsum.photos/80/80?random=52',
    lastMessage: '请问入住时间是下午2点以后可以吗？',
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    unread: 0,
  },
  {
    conversationId: 3,
    homestayId: 5,
    homestayTitle: '太古里北欧风公寓',
    hostId: 503,
    hostName: '张房东',
    hostAvatar: 'https://picsum.photos/80/80?random=53',
    lastMessage: '好的，祝您旅途愉快！',
    lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    unread: 0,
  },
]);

const systemMessages = ref<SystemMsg[]>([
  { id: 1, title: '欢迎使用栖居民宿预订系统', content: '感谢您的注册，祝您旅途愉快！', time: '10分钟前', read: false },
  { id: 2, title: '实名认证提醒', content: '完成实名认证可享受更多权益，快去认证吧~', time: '昨天', read: false },
]);

const orderMessages = ref<SystemMsg[]>([
  { id: 3, title: '订单已确认', content: '您预订的「春熙路轻奢两居室」已确认，入住日期：3月25日', time: '今天 09:30', read: true },
  { id: 4, title: '入住提醒', content: '您预订的民宿明天可以入住了，记得带好身份证哦~', time: '今天 08:00', read: true },
]);

onMounted(() => {
  // TODO: 请求后端 /api/chat/list
});

function goChat(item: ChatConversation) {
  router.push(`/chat/${item.conversationId}?homestayId=${item.homestayId}&hostName=${encodeURIComponent(item.hostName)}&hostAvatar=${encodeURIComponent(item.hostAvatar)}`);
}

function readMsg(msg: SystemMsg) {
  msg.read = true;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days === 1) return '昨天';
  if (days < 7) return `${days}天前`;
  return `${date.getMonth() + 1}/${date.getDate()}`;
}
</script>

<style scoped lang="scss">
.tj-chatlist-page {
  min-height: 100vh;
  background: #F7F8FA;
}

.tj-page__header {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 16px;
  background: #fff;
  border-bottom: 1px solid #F0F0F0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.tj-page__header-left,
.tj-page__header-right {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.tj-page__header-title {
  flex: 1;
  text-align: center;
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

:deep(.van-tabs__nav) {
  background: #fff;
}

/* ---- 咨询列表 ---- */
.chat-list {
  padding: 12px 16px;
}

.chat-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 14px 12px;
  margin-bottom: 10px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: box-shadow 0.15s;

  &:active {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  }
}

.chat-item__avatar {
  position: relative;
  flex-shrink: 0;
  margin-right: 12px;

  img {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    object-fit: cover;
    display: block;
  }
}

.chat-item__badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  background: #FF4C4C;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid #fff;
  box-sizing: content-box;
}

.chat-item__body {
  flex: 1;
  overflow: hidden;
  min-width: 0;
}

.chat-item__top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 5px;
}

.chat-item__name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.chat-item__time {
  font-size: 12px;
  color: #B0B0B0;
  flex-shrink: 0;
  margin-left: 8px;
}

.chat-item__bottom {
  overflow: hidden;
}

.chat-item__preview {
  font-size: 13px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

/* ---- 系统/订单通知 ---- */
.msg-section {
  padding: 12px 16px;
}

.msg-card {
  display: flex;
  align-items: flex-start;
  background: #fff;
  border-radius: 12px;
  padding: 14px 12px;
  margin-bottom: 8px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  position: relative;
  transition: box-shadow 0.15s;

  &:active { box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06); }

  &.is-unread {
    background: #FFFCF8;

    .msg-card__title { color: #333; }
  }
}

.msg-card__icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 10px;
}

.msg-card__body {
  flex: 1;
  overflow: hidden;
}

.msg-card__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--tj-text-body);
  margin-bottom: 4px;
}

.msg-card__desc {
  font-size: 13px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.msg-card__time {
  font-size: 11px;
  color: #B0B0B0;
  margin-top: 4px;
}

.msg-card__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #FF4C4C;
  flex-shrink: 0;
  margin-top: 6px;
}
</style>
