<template>
  <div class="tj-page tj-chat-page">
    <!-- 顶部房东信息栏 -->
    <div class="chat-header">
      <div class="chat-header__back" @click="$router.back()">
        <van-icon name="arrow-left" size="20" color="#333" />
      </div>
      <div class="chat-header__info">
        <img
          class="chat-header__avatar"
          :src="hostAvatar || 'https://picsum.photos/80/80?random=host'"
          :alt="hostName"
        />
        <div class="chat-header__text">
          <div class="chat-header__name">{{ hostName }}</div>
          <div class="chat-header__sub">{{ homestayTitle }}</div>
        </div>
      </div>
      <div class="chat-header__right"></div>
    </div>

    <!-- 消息列表 -->
    <div class="chat-messages" ref="messagesEl" @scroll="onScroll">
      <!-- 下拉加载历史 -->
      <div v-if="loadingMore" class="load-more">
        <van-loading type="spinner" size="18" color="#FF9645" />
      </div>
      <div v-if="noMoreHistory" class="load-more-tip">— 已加载全部消息 —</div>

      <div
        v-for="(msg, index) in messages"
        :key="msg.id"
        class="msg-wrap"
      >
        <!-- 时间分隔线 -->
        <div v-if="needTimeDivider(index)" class="time-divider">
          {{ formatTime(msg.timestamp) }}
        </div>

        <!-- 用户消息（右侧） -->
        <div v-if="msg.type === 'user'" class="msg-row msg-row--user">
          <div class="msg-bubble msg-bubble--user">
            {{ msg.content }}
          </div>
          <img
            class="msg-avatar msg-avatar--user"
            :src="userAvatar || 'https://picsum.photos/80/80?random=user'"
            alt="我"
          />
        </div>

        <!-- 房东消息（左侧） -->
        <div v-else class="msg-row msg-row--host">
          <img
            class="msg-avatar msg-avatar--host"
            :src="hostAvatar || 'https://picsum.photos/80/80?random=host'"
            :alt="hostName"
          />
          <div class="msg-bubble msg-bubble--host">
            {{ msg.content }}
          </div>
        </div>
      </div>

      <!-- 占位，保证内容不被底部输入框遮挡 -->
      <div style="height: 16px;"></div>
    </div>

    <!-- 底部输入区 -->
    <div class="chat-input-area">
      <!-- 快捷短语 -->
      <div v-if="showQuickPhrases" class="quick-phrases">
        <div
          v-for="phrase in quickPhrases"
          :key="phrase"
          class="quick-phrase-tag"
          @click="usePhrase(phrase)"
        >
          {{ phrase }}
        </div>
      </div>

      <div class="input-row">
        <div class="input-row__left">
          <van-icon
            name="add-o"
            size="22"
            color="#999"
            @click="showQuickPhrases = !showQuickPhrases"
          />
        </div>
        <van-field
          v-model="inputText"
          class="chat-field"
          placeholder="输入消息..."
          :border="false"
          @keyup.enter="sendMessage"
          @focus="showQuickPhrases = false"
        />
        <van-button
          class="send-btn"
          type="primary"
          size="small"
          round
          :disabled="!inputText.trim()"
          @click="sendMessage"
        >
          发送
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { showToast } from 'vant';

const route = useRoute();

const conversationId = Number(route.params.conversationId);
const homestayId = Number(route.query.homestayId) || 0;
const hostName = String(route.query.hostName || '房东');
const hostAvatar = String(route.query.hostAvatar || '');
const homestayTitle = String(route.query.homestayTitle || '');

const messagesEl = ref<HTMLElement | null>(null);
const inputText = ref('');
const loadingMore = ref(false);
const noMoreHistory = ref(false);
const showQuickPhrases = ref(false);

const userAvatar = ref('');
const quickPhrases = ['请问还有房吗？', '能便宜吗？', '入住时间几点？', '有停车位吗？'];

interface ChatMessage {
  id: number;
  type: 'user' | 'host';
  content: string;
  timestamp: number;
}

const messages = ref<ChatMessage[]>([
  {
    id: 1,
    type: 'host',
    content: '您好，欢迎入住！有什么问题随时联系我~',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: 2,
    type: 'user',
    content: '您好，请问入住时间是几点呢？',
    timestamp: Date.now() - 1000 * 60 * 90,
  },
  {
    id: 3,
    type: 'host',
    content: '下午2点以后可以入住，早上10点前需要退房哦。',
    timestamp: Date.now() - 1000 * 60 * 85,
  },
  {
    id: 4,
    type: 'user',
    content: '好的，知道了，谢谢！',
    timestamp: Date.now() - 1000 * 60 * 80,
  },
]);

let msgIdSeq = messages.value.length + 1;

function scrollToBottom(smooth = true) {
  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTo({
        top: messagesEl.value.scrollHeight,
        behavior: smooth ? 'smooth' : 'instant',
      });
    }
  });
}

async function onScroll() {
  const el = messagesEl.value;
  if (!el || loadingMore.value || noMoreHistory.value) return;
  if (el.scrollTop < 60) {
    await loadHistory();
  }
}

async function loadHistory() {
  loadingMore.value = true;
  // 模拟加载延迟
  await new Promise(resolve => setTimeout(resolve, 800));
  const newMsg: ChatMessage = {
    id: Date.now(),
    type: 'host',
    content: getAutoReply(),
    timestamp: Date.now() - 1000 * 60 * 60 * 3,
  };
  messages.value.unshift(newMsg);
  loadingMore.value = false;
  // 模拟最多只有一页历史
  noMoreHistory.value = true;
}

function getAutoReply(): string {
  const replies = [
    '好的，我这边帮您确认一下。',
    '没问题，随时联系我~',
    '祝您旅途愉快！',
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

function needTimeDivider(index: number): boolean {
  if (index === 0) return true;
  const cur = messages.value[index].timestamp;
  const prev = messages.value[index - 1].timestamp;
  return cur - prev > 1000 * 60 * 5;
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  if (isToday) return `今天 ${h}:${m}`;
  if (isYesterday) return `昨天 ${h}:${m}`;
  return `${d.getMonth() + 1}/${d.getDate()} ${h}:${m}`;
}

function usePhrase(phrase: string) {
  inputText.value = phrase;
  showQuickPhrases.value = false;
}

function sendMessage() {
  const text = inputText.value.trim();
  if (!text) return;

  messages.value.push({
    id: msgIdSeq++,
    type: 'user',
    content: text,
    timestamp: Date.now(),
  });

  inputText.value = '';
  showQuickPhrases.value = false;
  scrollToBottom();

  // 震动反馈
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }

  // 模拟房东回复
  setTimeout(() => {
    messages.value.push({
      id: msgIdSeq++,
      type: 'host',
      content: getAutoReply(),
      timestamp: Date.now(),
    });
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    scrollToBottom();
  }, 800 + Math.random() * 800);
}

onMounted(() => {
  scrollToBottom(false);
});
</script>

<style scoped lang="scss">
.tj-chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #F7F8FA;
  overflow: hidden;
}

/* 顶部信息栏 */
.chat-header {
  display: flex;
  align-items: center;
  height: 52px;
  padding: 0 4px 0 0;
  background: #fff;
  border-bottom: 1px solid #F0F0F0;
  flex-shrink: 0;
}

.chat-header__back {
  width: 44px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.chat-header__info {
  flex: 1;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding-left: 2px;
}

.chat-header__avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  margin-right: 10px;
}

.chat-header__text {
  overflow: hidden;
  min-width: 0;
}

.chat-header__name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-header__sub {
  font-size: 12px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-header__right {
  width: 44px;
}

/* 消息列表 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px 14px 0;
  -webkit-overflow-scrolling: touch;
}

.load-more {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 36px;
  margin-bottom: 8px;
}

.load-more-tip {
  text-align: center;
  font-size: 12px;
  color: #C0C0C0;
  height: 36px;
  line-height: 36px;
  margin-bottom: 8px;
}

.time-divider {
  text-align: center;
  font-size: 12px;
  color: #BFBFBF;
  margin: 8px 0;
}

/* 消息行 */
.msg-wrap {
  margin-bottom: 10px;
}

.msg-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;

  &--user {
    flex-direction: row-reverse;
  }

  &--host {
    flex-direction: row;
  }
}

.msg-avatar {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;

  &--user {
    margin-right: 0;
  }
}

/* 气泡 */
.msg-bubble {
  max-width: 70%;
  padding: 10px 14px;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;

  &--user {
    background: #FFF5EE;
    color: #FF9645;
    border-radius: 12px 4px 12px 12px;
  }

  &--host {
    background: #ffffff;
    color: #333;
    border-radius: 4px 12px 12px 12px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  }
}

/* 底部输入区 */
.chat-input-area {
  flex-shrink: 0;
  background: #fff;
  border-top: 1px solid #F0F0F0;
  padding: 8px 12px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
}

.quick-phrases {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.quick-phrase-tag {
  padding: 5px 12px;
  background: #F0F0F0;
  color: #666;
  font-size: 13px;
  border-radius: 16px;
  cursor: pointer;
  transition: background 0.15s;

  &:active {
    background: #E0E0E0;
  }
}

.input-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-row__left {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  padding: 4px 0;
}

:deep(.chat-field) {
  flex: 1;
  background: #F5F5F5;
  border-radius: 20px;
  padding: 6px 14px;
  height: 36px;

  .van-field__control {
    font-size: 14px;
    color: #333;
  }

  .van-field__control::placeholder {
    color: #BFBFBF;
  }
}

.send-btn {
  background: linear-gradient(135deg, #FF9645, #FF7B3D) !important;
  border: none !important;
  font-size: 14px;
  font-weight: 600;
  min-width: 52px;
  height: 36px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(255, 150, 69, 0.35);

  &:disabled {
    background: #D9D9D9 !important;
    box-shadow: none;
    color: #fff !important;
  }
}
</style>
