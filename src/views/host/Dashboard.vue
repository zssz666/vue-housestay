<template>
  <div class="dashboard-page">
    <!-- 顶部数据卡片区域 -->
    <el-row :gutter="24" class="stat-cards">
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="card-content">
            <div class="title">今日入住</div>
            <div class="value">
              8
              <span class="trend up"><el-icon><CaretTop /></el-icon> 12%</span>
            </div>
            <div class="footer">较昨日 +1</div>
          </div>
          <el-icon class="icon-bg" :size="48" color="#e6f7ff"><House /></el-icon>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="card-content">
            <div class="title">今日退房</div>
            <div class="value">5</div>
            <div class="footer">待查房 2</div>
          </div>
          <el-icon class="icon-bg" :size="48" color="#fff1f0"><Bell /></el-icon>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="card-content">
            <div class="title">本月营收</div>
            <div class="value">¥24,800</div>
            <div class="footer">完成度 82%</div>
          </div>
          <el-icon class="icon-bg" :size="48" color="#f6ffed"><Wallet /></el-icon>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="card-content">
            <div class="title">待处理订单</div>
            <div class="value danger">3</div>
            <div class="footer">需尽快确认</div>
          </div>
          <el-icon class="icon-bg" :size="48" color="#fff7e6"><List /></el-icon>
        </el-card>
      </el-col>
    </el-row>

    <!-- 中间图表区域（保持原样） -->
    <el-row :gutter="24" class="charts-section">
      <el-col :span="16">
        <el-card header="近30天营收趋势">
          <v-chart class="chart-line" :option="lineOption" autoresize />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card header="房源收入占比">
          <v-chart class="chart-pie" :option="pieOption" autoresize />
        </el-card>
      </el-col>
    </el-row>

    <!-- 底部区域：左右分栏 -->
    <el-row :gutter="20" class="bottom-section">
      <!-- 左侧：待办事项 -->
      <el-col :xs="24" :sm="24" :md="12">
        <el-card class="todo-card">
          <template #header>
            <div class="card-header">
              <span>待办事项</span>
              <span class="todo-count" v-if="todos.length > 0">{{ todos.length }}项待处理</span>
            </div>
          </template>

          <!-- 空状态 -->
          <div v-if="todos.length === 0" class="empty-state">
            <el-icon :size="48" color="#d9d9d9"><CoffeeCup /></el-icon>
            <p>暂无待办事项，休息一下吧~</p>
          </div>

          <!-- 待办列表 -->
          <div v-else class="todo-list">
            <div
              v-for="todo in todos"
              :key="todo.id"
              class="todo-item"
              :class="`todo-${todo.type}`"
            >
              <div class="todo-main">
                <div class="todo-icon">
                  <el-icon :size="20">
                    <component :is="getTodoIcon(todo.type)" />
                  </el-icon>
                </div>
                <div class="todo-info">
                  <div class="todo-title">{{ todo.title }}</div>
                  <div class="todo-content">{{ todo.content }}</div>
                  <div class="todo-detail">{{ todo.detail }}</div>
                </div>
              </div>
              <div class="todo-actions">
                <!-- 待确认订单：确认/拒绝 -->
                <template v-if="todo.type === 'order_confirm'">
                  <el-button type="primary" size="small" @click="handleConfirm(todo)">
                    立即确认
                  </el-button>
                  <el-button size="small" @click="handleReject(todo)">拒绝</el-button>
                </template>

                <!-- 今日入住：发送指引 -->
                <template v-else-if="todo.type === 'checkin'">
                  <el-dropdown trigger="click" @command="(cmd) => handleSendGuide(todo, cmd)">
                    <el-button type="primary" plain size="small">
                      发送指引
                      <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="location">发送位置</el-dropdown-item>
                        <el-dropdown-item command="password">发送密码</el-dropdown-item>
                        <el-dropdown-item command="custom">自定义内容</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </template>

                <!-- 今日退房：去验房 -->
                <template v-else-if="todo.type === 'checkout'">
                  <el-button type="warning" plain size="small" @click="handleCheckRoom(todo)">
                    去验房
                  </el-button>
                </template>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：评价管理 -->
      <el-col :xs="24" :sm="24" :md="12">
        <el-card class="review-card">
          <template #header>
            <div class="card-header">
              <span>
                最新评价
                <el-badge :value="unreadReviewCount" :hidden="unreadReviewCount === 0" type="danger" />
              </span>
            </div>
          </template>

          <!-- 空状态 -->
          <div v-if="reviews.length === 0" class="empty-state">
            <el-icon :size="48" color="#d9d9d9"><ChatDotRound /></el-icon>
            <p>暂无新评价</p>
          </div>

          <!-- 评价列表 -->
          <div v-else class="review-list">
            <div
              v-for="review in displayedReviews"
              :key="review.id"
              class="review-item"
            >
              <!-- 第一行：头像+昵称+评分+时间 -->
              <div class="review-header">
                <div class="review-user">
                  <el-avatar :size="32" :src="review.user.avatar">
                    {{ review.user.name.charAt(0) }}
                  </el-avatar>
                  <span class="user-name">{{ review.user.name }}</span>
                </div>
                <div class="review-meta">
                  <span class="rating">
                    <el-icon v-for="i in 5" :key="i" :color="i <= review.rating ? '#fadb14' : '#d9d9d9'">
                      <StarFilled />
                    </el-icon>
                  </span>
                  <span class="review-time">{{ review.createTime }}</span>
                </div>
              </div>

              <!-- 第二行：评价内容 -->
              <div class="review-content">
                <p :class="{ 'content-collapsed': !review.expanded && review.content.length > 60 }">
                  {{ review.expanded ? review.content : (review.content.length > 60 ? review.content.slice(0, 60) + '...' : review.content) }}
                </p>
                <el-button
                  v-if="review.content.length > 60"
                  type="primary"
                  link
                  size="small"
                  @click="toggleReviewExpand(review)"
                >
                  {{ review.expanded ? '收起' : '展开' }}
                </el-button>
              </div>

              <!-- 第三行：关联房源 -->
              <div class="review-source">
                <span>来自：{{ review.homestayTitle }}</span>
              </div>

              <!-- 操作区：回复 -->
              <div class="review-actions">
                <template v-if="!review.reply">
                  <el-button
                    v-if="activeReplyId !== review.id"
                    type="primary"
                    link
                    @click="startReply(review)"
                  >
                    回复
                  </el-button>

                  <!-- 回复输入区域 -->
                  <div v-else class="reply-input-area">
                    <!-- 快捷回复按钮 -->
                    <div class="quick-reply-btns">
                      <el-tag
                        v-for="quickReply in quickReplies"
                        :key="quickReply"
                        class="quick-reply-tag"
                        @click="applyQuickReply(review, quickReply)"
                      >
                        {{ quickReply }}
                      </el-tag>
                    </div>
                    <el-input
                      v-model="review.replyContent"
                      type="textarea"
                      :rows="2"
                      placeholder="感谢评价..."
                      class="reply-textarea"
                    />
                    <div class="reply-submit">
                      <el-button size="small" @click="cancelReply(review)">取消</el-button>
                      <el-button type="primary" size="small" @click="submitReply(review)">
                        提交
                      </el-button>
                    </div>
                  </div>
                </template>

                <!-- 已回复：显示回复内容 -->
                <div v-else class="replied-content">
                  <div class="reply-label">我的回复：</div>
                  <div class="reply-text">{{ review.reply }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 查看更多 -->
          <div v-if="reviews.length > 3" class="view-more">
            <el-button type="primary" link @click="router.push('/host/reviews')">
              查看全部评价 ({{ reviews.length }})
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 确认订单弹窗 -->
    <el-dialog v-model="confirmDialogVisible" title="确认订单" width="400px">
      <div class="confirm-dialog-content">
        <p>确认接受 <strong>{{ currentTodo?.content }}</strong> 的预订请求？</p>
        <p class="confirm-detail">{{ currentTodo?.detail }}</p>
      </div>
      <template #footer>
        <el-button @click="confirmDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmOrder">确认接受</el-button>
      </template>
    </el-dialog>

    <!-- 拒绝订单弹窗 -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝订单" width="400px">
      <div class="reject-dialog-content">
        <p>确定要拒绝 <strong>{{ currentTodo?.content }}</strong> 的预订请求吗？</p>
        <el-input
          v-model="rejectReason"
          type="textarea"
          :rows="3"
          placeholder="请输入拒绝原因（可选）"
        />
      </div>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="rejectOrder">确认拒绝</el-button>
      </template>
    </el-dialog>

    <!-- 发送指引弹窗 -->
    <el-dialog v-model="guideDialogVisible" title="发送入住指引" width="500px">
      <div class="guide-dialog-content">
        <p>选择或编辑要发送给客人的指引内容：</p>
        <el-input
          v-model="guideContent"
          type="textarea"
          :rows="4"
          placeholder="请输入入住指引..."
        />
        <div class="guide-templates">
          <el-tag
            v-for="template in guideTemplates"
            :key="template.label"
            class="template-tag"
            @click="applyTemplate(template.content)"
          >
            {{ template.label }}
          </el-tag>
        </div>
      </div>
      <template #footer>
        <el-button @click="guideDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="sendGuide">发送</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  House,
  Bell,
  Wallet,
  List,
  CaretTop,
  CoffeeCup,
  ChatDotRound,
  StarFilled,
  ArrowDown,
  BellFilled,
  UserFilled,
  Van
} from '@element-plus/icons-vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, PieChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components';

use([CanvasRenderer, LineChart, PieChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent]);

const router = useRouter();

// ==================== 数据定义 ====================

// 待办数据类型
interface Todo {
  id: number;
  type: 'order_confirm' | 'checkin' | 'checkout';
  title: string;
  content: string;
  detail: string;
  action: string;
}

// 评价数据类型
interface Review {
  id: string;
  user: { name: string; avatar: string };
  rating: number;
  content: string;
  homestayTitle: string;
  createTime: string;
  reply: string | null;
  expanded?: boolean;
  replyContent?: string;
}

// ==================== 待办事项数据 ====================

const todos = ref<Todo[]>([
  {
    id: 1,
    type: 'order_confirm',
    title: '新订单待确认',
    content: '张三预订了【海景大床房】',
    detail: '10-01至10-03 · ¥1,280',
    action: 'confirm'
  },
  {
    id: 2,
    type: 'checkin',
    title: '今日入住提醒',
    content: '王五即将入住【山景套房】',
    detail: '预计14:00入住',
    action: 'send_guide'
  },
  {
    id: 3,
    type: 'checkout',
    title: '退房验房提醒',
    content: '李四已退房【亲子房】',
    detail: '退房时间：12:00',
    action: 'check_room'
  },
  {
    id: 4,
    type: 'order_confirm',
    title: '新订单待确认',
    content: '赵六预订了【城市公寓】',
    detail: '10-05至10-07 · ¥980',
    action: 'confirm'
  }
]);

// ==================== 评价数据 ====================

const reviews = ref<Review[]>([
  {
    id: 'rev_001',
    user: { name: '张三', avatar: 'https://via.placeholder.com/32' },
    rating: 5,
    content: '房间非常干净整洁，视野超棒！能看到整片海景。房东非常热情，提前发送了入住指引，还推荐了很多当地美食。入住体验非常棒，下次来还会选择这里！',
    homestayTitle: '海景大床房',
    createTime: '10-03 14:30',
    reply: null
  },
  {
    id: 'rev_002',
    user: { name: '李四', avatar: 'https://via.placeholder.com/32' },
    rating: 4,
    content: '房间布置得很温馨，位置也很好，离地铁站很近。唯一的遗憾是隔音稍微差了点，不过整体来说还是很满意的。',
    homestayTitle: '城市公寓',
    createTime: '10-02 10:15',
    reply: '感谢您的入住和好评！关于隔音问题我们已经注意到了，后续会加强处理。欢迎下次再来~'
  },
  {
    id: 'rev_003',
    user: { name: '王五', avatar: 'https://via.placeholder.com/32' },
    rating: 5,
    content: '超赞的入住体验！房间比照片还要漂亮，设施齐全，老板人特别好，下次来一定还住这里！',
    homestayTitle: '山景套房',
    createTime: '10-01 18:45',
    reply: null
  },
  {
    id: 'rev_004',
    user: { name: '赵六', avatar: 'https://via.placeholder.com/32' },
    rating: 3,
    content: '房间还行，但是价格有点贵了。',
    homestayTitle: '海景大床房',
    createTime: '09-28 20:00',
    reply: null
  }
]);

// ==================== 快捷回复选项 ====================

const quickReplies = ['感谢认可👍', '欢迎再来🎉', '已改进💪', '自定义输入'];

// ==================== 图表配置 ====================

const lineOption = ref({
  tooltip: { trigger: 'axis' },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['1日', '5日', '10日', '15日', '20日', '25日', '30日']
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: '营收',
      type: 'line',
      stack: 'Total',
      smooth: true,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: '#1890ff' }, { offset: 1, color: '#fff' }]
        }
      },
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      itemStyle: { color: '#1890ff' }
    }
  ]
});

const pieOption = ref({
  tooltip: { trigger: 'item' },
  legend: { bottom: '0%' },
  series: [
    {
      name: '收入来源',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: { label: { show: true, fontSize: '20', fontWeight: 'bold' } },
      data: [
        { value: 1048, name: '海景房' },
        { value: 735, name: '山景房' },
        { value: 580, name: '城市公寓' },
        { value: 484, name: '树屋' },
        { value: 300, name: '其他' }
      ]
    }
  ]
});

// ==================== 计算属性 ====================

const unreadReviewCount = computed(() => {
  return reviews.value.filter(r => !r.reply).length;
});

const displayedReviews = computed(() => {
  return reviews.value.slice(0, 3);
});

// ==================== 辅助函数 ====================

function getTodoIcon(type: string) {
  const iconMap: Record<string, any> = {
    order_confirm: BellFilled,
    checkin: UserFilled,
    checkout: Van
  };
  return iconMap[type] || BellFilled;
}

// ==================== 待办操作 ====================

const confirmDialogVisible = ref(false);
const rejectDialogVisible = ref(false);
const guideDialogVisible = ref(false);
const currentTodo = ref<Todo | null>(null);
const rejectReason = ref('');
const guideContent = ref('');
const guideTemplates = [
  { label: '📍 位置指引', content: '您好！欢迎入住【海景大床房】。我们的位置在：XX市XX区XX路XX号。到达后请联系房东获取门禁密码。' },
  { label: '🔑 密码指引', content: '您好！您的入住密码是：XXXX。入住时间为14:00，退房时间为12:00。如有任何问题请随时联系我。' },
  { label: '🍽️ 美食推荐', content: '您好！推荐您去附近的XX餐厅，味道很好，距离我们也很近。祝您入住愉快！' }
];

function handleConfirm(todo: Todo) {
  currentTodo.value = todo;
  confirmDialogVisible.value = true;
}

async function confirmOrder() {
  // 模拟确认操作
  ElMessage.success('订单已确认');
  // 移除该待办
  const index = todos.value.findIndex(t => t.id === currentTodo.value?.id);
  if (index > -1) {
    todos.value.splice(index, 1);
  }
  confirmDialogVisible.value = false;
  currentTodo.value = null;
}

function handleReject(todo: Todo) {
  currentTodo.value = todo;
  rejectReason.value = '';
  rejectDialogVisible.value = true;
}

async function rejectOrder() {
  ElMessageBox.confirm('确定要拒绝该订单吗？', '确认拒绝', {
    confirmButtonText: '确认拒绝',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.info('订单已拒绝');
    const index = todos.value.findIndex(t => t.id === currentTodo.value?.id);
    if (index > -1) {
      todos.value.splice(index, 1);
    }
    rejectDialogVisible.value = false;
    currentTodo.value = null;
  }).catch(() => {});
}

function handleSendGuide(todo: Todo, command: string) {
  currentTodo.value = todo;
  if (command === 'location') {
    guideContent.value = guideTemplates[0]?.content || '';
  } else if (command === 'password') {
    guideContent.value = guideTemplates[1]?.content || '';
  } else {
    guideContent.value = '';
  }
  guideDialogVisible.value = true;
}

function applyTemplate(content: string) {
  guideContent.value = content;
}

async function sendGuide() {
  if (!guideContent.value.trim()) {
    ElMessage.warning('请输入指引内容');
    return;
  }
  ElMessage.success('指引已发送');
  guideDialogVisible.value = false;
  guideContent.value = '';
}

function handleCheckRoom(_todo: Todo) {
  router.push('/host/orders');
}

// ==================== 评价操作 ====================

const activeReplyId = ref<string | null>(null);

function toggleReviewExpand(review: Review) {
  review.expanded = !review.expanded;
}

function startReply(review: Review) {
  activeReplyId.value = review.id;
  review.replyContent = '';
}

function cancelReply(review: Review) {
  activeReplyId.value = null;
  review.replyContent = '';
}

function applyQuickReply(review: Review, quickReply: string) {
  if (quickReply === '自定义输入') {
    return;
  }
  review.replyContent = quickReply.replace(/[\uD83C-\uDBFF][\uDC00-\uDFFF]/g, ''); // 移除emoji
}

async function submitReply(review: Review) {
  if (!review.replyContent?.trim()) {
    ElMessage.warning('请输入回复内容');
    return;
  }
  review.reply = review.replyContent;
  activeReplyId.value = null;
  ElMessage.success('回复成功');
}
</script>

<style scoped lang="scss">
.dashboard-page {
  padding: 24px;

  // 顶部数据卡片
  .stat-cards {
    margin-bottom: 24px;

    .stat-card {
      position: relative;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }

      .card-content {
        position: relative;
        z-index: 2;

        .title {
          color: rgba(0, 0, 0, 0.45);
          font-size: 14px;
          margin-bottom: 8px;
        }

        .value {
          font-size: 30px;
          font-weight: 700;
          color: rgba(0, 0, 0, 0.85);
          margin-bottom: 16px;

          &.danger {
            color: #cf1322;
            animation: pulse 2s infinite;
          }

          .trend {
            font-size: 14px;
            margin-left: 8px;

            &.up {
              color: #52c41a;
            }

            &.down {
              color: #cf1322;
            }
          }
        }

        .footer {
          font-size: 12px;
          color: rgba(0, 0, 0, 0.45);
          border-top: 1px solid #f0f0f0;
          padding-top: 8px;
        }
      }

      .icon-bg {
        position: absolute;
        right: 16px;
        top: 16px;
        opacity: 0.8;
        z-index: 1;
      }
    }
  }

  // 中间图表区域
  .charts-section {
    margin-bottom: 24px;

    .chart-line {
      height: 350px;
    }

    .chart-pie {
      height: 350px;
    }
  }

  // 底部区域
  .bottom-section {
    .todo-card,
    .review-card {
      height: 100%;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .todo-count {
          font-size: 12px;
          color: #ff4d4f;
          font-weight: normal;
        }
      }
    }

    // 空状态
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 0;
      color: #d9d9d9;

      p {
        margin-top: 16px;
        font-size: 14px;
      }
    }

    // 待办列表
    .todo-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .todo-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      margin-bottom: 12px;
      background: #fafafa;
      border-radius: 8px;
      border-left: 4px solid #1890ff;
      transition: all 0.3s ease;

      &:hover {
        background: #f0f7ff;
      }

      &.todo-order_confirm {
        border-left-color: #52c41a;
      }

      &.todo-checkin {
        border-left-color: #1890ff;
      }

      &.todo-checkout {
        border-left-color: #faad14;
      }

      .todo-main {
        display: flex;
        align-items: flex-start;
        flex: 1;

        .todo-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          flex-shrink: 0;
        }

        .todo-info {
          .todo-title {
            font-size: 14px;
            font-weight: 600;
            color: #262626;
            margin-bottom: 4px;
          }

          .todo-content {
            font-size: 13px;
            color: #595959;
            margin-bottom: 2px;
          }

          .todo-detail {
            font-size: 12px;
            color: #8c8c8c;
          }
        }
      }

      .todo-actions {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
        margin-left: 16px;
      }
    }

    // 评价列表
    .review-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .review-item {
      background: #fff;
      border: 1px solid #f0f0f0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      transition: box-shadow 0.3s ease;

      &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      .review-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .review-user {
          display: flex;
          align-items: center;

          .user-name {
            margin-left: 8px;
            font-size: 14px;
            font-weight: 500;
          }
        }

        .review-meta {
          display: flex;
          align-items: center;
          gap: 8px;

          .rating {
            display: flex;
            gap: 2px;
          }

          .review-time {
            font-size: 12px;
            color: #8c8c8c;
          }
        }
      }

      .review-content {
        margin-bottom: 8px;

        p {
          font-size: 14px;
          color: #262626;
          line-height: 1.6;
          margin: 0;

          &.content-collapsed {
            display: inline;
          }
        }
      }

      .review-source {
        font-size: 12px;
        color: #8c8c8c;
        margin-bottom: 12px;
      }

      .review-actions {
        .reply-input-area {
          margin-top: 12px;

          .quick-reply-btns {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 12px;

            .quick-reply-tag {
              cursor: pointer;
              transition: all 0.3s ease;

              &:hover {
                background: #1890ff;
                color: #fff;
                border-color: #1890ff;
              }
            }
          }

          .reply-textarea {
            margin-bottom: 12px;
          }

          .reply-submit {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
          }
        }

        .replied-content {
          background: #f5f5f5;
          border-radius: 6px;
          padding: 12px;
          margin-top: 8px;

          .reply-label {
            font-size: 12px;
            color: #8c8c8c;
            margin-bottom: 4px;
          }

          .reply-text {
            font-size: 13px;
            color: #595959;
            line-height: 1.5;
          }
        }
      }
    }

    .view-more {
      text-align: center;
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;
      margin-top: 12px;
    }
  }
}

// 弹窗样式
.confirm-dialog-content,
.reject-dialog-content,
.guide-dialog-content {
  p {
    margin-bottom: 12px;
    color: #262626;
  }

  .confirm-detail {
    color: #8c8c8c;
    font-size: 13px;
  }

  .guide-templates {
    margin-top: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .template-tag {
      cursor: pointer;

      &:hover {
        background: #1890ff;
        color: #fff;
        border-color: #1890ff;
      }
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}

// 响应式：移动端
@media screen and (max-width: 768px) {
  .dashboard-page {
    padding: 16px;

    .stat-cards {
      .stat-card {
        margin-bottom: 12px;

        .card-content {
          .value {
            font-size: 24px;
          }
        }
      }
    }

    .charts-section {
      .chart-line,
      .chart-pie {
        height: 280px;
      }
    }

    .bottom-section {
      .todo-item {
        flex-direction: column;
        align-items: flex-start;

        .todo-actions {
          margin-left: 0;
          margin-top: 12px;
          width: 100%;
          justify-content: flex-end;
        }
      }
    }
  }
}
</style>
