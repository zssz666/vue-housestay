<template>
  <div class="tj-page tj-messages-page">
    <div class="tj-page__header">
      <div class="tj-page__header-left" @click="$router.back()">
        <van-icon name="arrow-left" size="20" color="#333" />
      </div>
      <span class="tj-page__header-title">消息中心</span>
      <div class="tj-page__header-right"></div>
    </div>

    <div class="messages-content">
      <!-- 系统通知 -->
      <div class="msg-section">
        <div class="msg-section__title">
          <van-icon name="volume-o" size="16" color="#FF9645" />
          系统通知
        </div>
        <div
          v-for="msg in systemMessages"
          :key="msg.id"
          class="msg-card"
          :class="{ 'is-unread': !msg.read }"
          @click="readMessage(msg)"
        >
          <div class="msg-card__icon">
            <van-icon name="bell" size="20" color="#FF9645" />
          </div>
          <div class="msg-card__body">
            <div class="msg-card__title">{{ msg.title }}</div>
            <div class="msg-card__desc">{{ msg.content }}</div>
            <div class="msg-card__time">{{ msg.time }}</div>
          </div>
          <div v-if="!msg.read" class="msg-card__dot"></div>
        </div>
      </div>

      <!-- 订单通知 -->
      <div class="msg-section">
        <div class="msg-section__title">
          <van-icon name="orders-o" size="16" color="#FF9645" />
          订单通知
        </div>
        <div
          v-for="msg in orderMessages"
          :key="msg.id"
          class="msg-card"
          :class="{ 'is-unread': !msg.read }"
          @click="readMessage(msg)"
        >
          <div class="msg-card__icon">
            <van-icon name="todo-list-o" size="20" color="#4A90D9" />
          </div>
          <div class="msg-card__body">
            <div class="msg-card__title">{{ msg.title }}</div>
            <div class="msg-card__desc">{{ msg.content }}</div>
            <div class="msg-card__time">{{ msg.time }}</div>
          </div>
          <div v-if="!msg.read" class="msg-card__dot"></div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && !allMessages.length" class="tj-empty">
        <div class="tj-empty__icon">💬</div>
        <div class="tj-empty__title">暂无消息</div>
        <div class="tj-empty__desc">有消息时会在这里通知您</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { showToast } from 'vant';

const loading = ref(false);

interface Message {
  id: number;
  type: 'system' | 'order';
  title: string;
  content: string;
  time: string;
  read: boolean;
}

const messages = ref<Message[]>([
  { id: 1, type: 'system', title: '欢迎使用民宿预订系统', content: '感谢您的注册，祝您旅途愉快！', time: '10分钟前', read: false },
  { id: 2, type: 'system', title: '实名认证提醒', content: '完成实名认证可享受更多权益，快去认证吧~', time: '昨天', read: false },
  { id: 3, type: 'order', title: '订单已确认', content: '您预订的「春熙路轻奢两居室」已确认，入住日期：3月25日', time: '今天 09:30', read: true },
  { id: 4, type: 'order', title: '入住提醒', content: '您预订的民宿明天可以入住了，记得带好身份证哦~', time: '今天 08:00', read: true },
]);

const systemMessages = computed(() => messages.value.filter(m => m.type === 'system'));
const orderMessages = computed(() => messages.value.filter(m => m.type === 'order'));
const allMessages = computed(() => messages.value);

const unreadCount = computed(() => messages.value.filter(m => !m.read).length);

function readMessage(msg: Message) {
  msg.read = true;
}
</script>

<style scoped lang="scss">
.tj-messages-page {
  min-height: 100vh;
  background: var(--tj-bg-page);
}

.tj-page__header {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 16px;
  background: #fff;
  border-bottom: 1px solid var(--tj-border-light);
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

.messages-content {
  padding: 12px 16px;
}

.msg-section {
  margin-bottom: 16px;
}

.msg-section__title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--tj-text-title);
  margin-bottom: 10px;
  padding-left: 4px;
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
  background: #F7F8FA;
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
  color: var(--tj-text-hint);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.msg-card__time {
  font-size: 11px;
  color: var(--tj-text-placeholder);
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
