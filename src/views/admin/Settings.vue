<template>
  <div class="settings-page">
    <el-tabs v-model="activeTab" class="settings-tabs">
      <!-- 参数配置标签页 -->
      <el-tab-pane label="参数配置" name="params">
        <el-form label-width="140px" style="max-width: 650px">
          <el-form-item label="平台服务费">
            <el-input v-model="config.serviceFee" type="number" placeholder="平台收取的服务费比例">
              <template #append>%</template>
            </el-input>
          </el-form-item>
          <el-form-item label="最低提现金额">
            <el-input v-model="config.minWithdraw" type="number" placeholder="房东最低提现金额">
              <template #prefix>¥</template>
            </el-input>
          </el-form-item>
          <el-form-item label="默认押金">
            <el-input v-model="config.defaultDeposit" type="number" placeholder="房源默认押金金额">
              <template #prefix>¥</template>
            </el-input>
          </el-form-item>
          <el-form-item label="退款规则">
            <div class="refund-slider">
              <span>入住前7天退款比例</span>
              <el-slider v-model="config.refundRate7" :step="10" show-stops :min="0" :max="100" />
            </div>
            <div class="refund-slider">
              <span>入住前3-7天退款比例</span>
              <el-slider v-model="config.refundRate3" :step="10" show-stops :min="0" :max="100" />
            </div>
          </el-form-item>
          <el-form-item label="自动确认时间">
            <el-input v-model="config.autoConfirmHours" type="number" placeholder="房东需在X小时内确认订单">
              <template #append>小时</template>
            </el-input>
          </el-form-item>
          <el-form-item label="免费取消时限">
            <el-input v-model="config.freeCancelHours" type="number" placeholder="入住前X小时可免费取消">
              <template #append>小时</template>
            </el-input>
          </el-form-item>
          <el-form-item label="违约金比例">
            <div class="penalty-slider">
              <el-slider v-model="config.penaltyRate" :min="0" :max="100" :step="5" />
              <span class="penalty-value">{{ config.penaltyRate }}%</span>
            </div>
          </el-form-item>
          <el-form-item label="敏感词过滤">
            <el-input
              v-model="config.sensitiveWords"
              type="textarea"
              :rows="3"
              placeholder="用逗号分隔，如：微信,支付宝,转账"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveConfig">保存配置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 公告管理标签页 -->
      <el-tab-pane label="公告管理" name="notice">
        <div class="notice-header">
          <el-button type="primary" @click="openNoticeDialog">发布公告</el-button>
        </div>
        <el-table :data="announcements" style="width: 100%; margin-top: 16px" stripe>
          <el-table-column prop="title" label="公告标题" min-width="200">
            <template #default="{ row }">
              <span class="notice-title">{{ row.title }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="getTypeTag(row.type)" size="small">{{ getTypeText(row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="time" label="发布时间" width="180" />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusTag(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="editNotice(row)">编辑</el-button>
              <el-button link type="warning" size="small" @click="toggleStatus(row)" v-if="row.status === 'published'">下架</el-button>
              <el-button link type="success" size="small" @click="toggleStatus(row)" v-else-if="row.status === 'offline'">上架</el-button>
              <el-button link type="danger" size="small" @click="deleteNotice(row)" v-if="row.status === 'draft'">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 操作日志标签页 -->
      <el-tab-pane label="操作日志" name="logs">
        <div class="logs-filter">
          <el-select v-model="logFilter.type" placeholder="操作类型" clearable style="width: 140px">
            <el-option label="全部" value="" />
            <el-option label="参数修改" value="settings" />
            <el-option label="审核操作" value="audit" />
            <el-option label="公告发布" value="notice" />
            <el-option label="用户处罚" value="punish" />
          </el-select>
          <el-date-picker
            v-model="logFilter.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 260px; margin-left: 12px"
          />
          <el-button type="primary" style="margin-left: 12px" @click="queryLogs">查询</el-button>
          <el-button @click="resetLogs">重置</el-button>
        </div>
        <el-table :data="filteredLogs" style="width: 100%; margin-top: 16px" stripe height="450">
          <el-table-column prop="time" label="时间" width="180" />
          <el-table-column prop="operator" label="操作员" width="120" align="center" />
          <el-table-column prop="type" label="操作类型" width="120" align="center">
            <template #default="{ row }">
              <el-tag size="small">{{ getLogTypeText(row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="content" label="操作内容" min-width="280" />
          <el-table-column prop="ip" label="IP地址" width="140" align="center" />
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 公告发布/编辑弹窗 -->
    <el-dialog v-model="noticeDialogVisible" title="发布公告" width="500px" @close="resetNoticeForm">
      <el-form :model="noticeForm" label-width="80px">
        <el-form-item label="标题" required>
          <el-input v-model="noticeForm.title" placeholder="请输入公告标题" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="内容" required>
          <el-input
            v-model="noticeForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入公告内容"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="noticeForm.type" style="width: 100%">
            <el-option label="平台公告" value="platform" />
            <el-option label="活动通知" value="activity" />
            <el-option label="系统维护" value="system" />
          </el-select>
        </el-form-item>
        <el-form-item label="发布范围">
          <el-checkbox-group v-model="noticeForm.scope">
            <el-checkbox label="user">用户端</el-checkbox>
            <el-checkbox label="host">房东端</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="noticeDialogVisible = false">取消</el-button>
        <el-button @click="saveDraft">保存草稿</el-button>
        <el-button type="primary" @click="publishNow">立即发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const activeTab = ref('params');

// ==================== 参数配置 ====================
const config = reactive({
  serviceFee: 10,
  minWithdraw: 100,
  defaultDeposit: 200,
  refundRate7: 100,
  refundRate3: 50,
  autoConfirmHours: 24,
  freeCancelHours: 48,
  penaltyRate: 30,
  sensitiveWords: ''
});

const saveConfig = () => {
  console.log('保存配置:', config);
  ElMessage.success('保存成功');
};

// ==================== 公告管理 ====================
const announcements = ref([
  { id: 1, title: '平台服务费调整公告', type: 'platform', content: '平台服务费将于下月调整为10%...', status: 'published', time: '2025-10-15 10:30:00', scope: ['user', 'host'] },
  { id: 2, title: '双十一活动通知', type: 'activity', content: '双十一期间所有房源8折优惠...', status: 'published', time: '2025-10-10 14:20:00', scope: ['user'] },
  { id: 3, title: '系统维护通知', type: 'system', content: '本周日凌晨2点-6点系统维护...', status: 'offline', time: '2025-10-08 09:00:00', scope: ['user', 'host'] },
  { id: 4, title: '新功能上线通知', type: 'platform', content: '新增智能推荐功能...', status: 'draft', time: '2025-10-18 16:45:00', scope: ['user'] }
]);

const noticeDialogVisible = ref(false);
const noticeForm = reactive({
  id: null as number | null,
  title: '',
  content: '',
  type: 'platform',
  scope: ['user', 'host']
});

const openNoticeDialog = () => {
  noticeForm.id = null;
  noticeForm.title = '';
  noticeForm.content = '';
  noticeForm.type = 'platform';
  noticeForm.scope = ['user', 'host'];
  noticeDialogVisible.value = true;
};

const editNotice = (row: any) => {
  noticeForm.id = row.id;
  noticeForm.title = row.title;
  noticeForm.content = row.content;
  noticeForm.type = row.type;
  noticeForm.scope = [...row.scope];
  noticeDialogVisible.value = true;
};

const resetNoticeForm = () => {
  noticeForm.id = null;
  noticeForm.title = '';
  noticeForm.content = '';
  noticeForm.type = 'platform';
  noticeForm.scope = ['user', 'host'];
};

const saveDraft = () => {
  if (!noticeForm.title || !noticeForm.content) {
    ElMessage.warning('请填写标题和内容');
    return;
  }
  if (noticeForm.id) {
    const idx = announcements.value.findIndex(a => a.id === noticeForm.id);
    if (idx !== -1) {
      announcements.value[idx] = { ...announcements.value[idx], ...noticeForm, status: 'draft', time: formatTime(new Date()) };
    }
  } else {
    announcements.value.unshift({
      id: Date.now(),
      title: noticeForm.title,
      content: noticeForm.content,
      type: noticeForm.type,
      scope: [...noticeForm.scope],
      status: 'draft',
      time: formatTime(new Date())
    });
  }
  noticeDialogVisible.value = false;
  ElMessage.success('已保存草稿');
};

const publishNow = () => {
  if (!noticeForm.title || !noticeForm.content) {
    ElMessage.warning('请填写标题和内容');
    return;
  }
  if (noticeForm.id) {
    const idx = announcements.value.findIndex(a => a.id === noticeForm.id);
    if (idx !== -1) {
      announcements.value[idx] = { ...announcements.value[idx], ...noticeForm, status: 'published', time: formatTime(new Date()) };
    }
  } else {
    announcements.value.unshift({
      id: Date.now(),
      title: noticeForm.title,
      content: noticeForm.content,
      type: noticeForm.type,
      scope: [...noticeForm.scope],
      status: 'published',
      time: formatTime(new Date())
    });
  }
  noticeDialogVisible.value = false;
  ElMessage.success('发布成功');
};

const toggleStatus = (row: any) => {
  const newStatus = row.status === 'published' ? 'offline' : 'published';
  const action = newStatus === 'offline' ? '下架' : '上架';
  ElMessageBox.confirm(`确定要${action}该公告吗？`, '提示').then(() => {
    const idx = announcements.value.findIndex(a => a.id === row.id);
    if (idx !== -1) {
      announcements.value[idx].status = newStatus;
    }
    ElMessage.success(`${action}成功`);
  }).catch(() => {});
};

const deleteNotice = (row: any) => {
  ElMessageBox.confirm('确定要删除该草稿吗？', '提示').then(() => {
    announcements.value = announcements.value.filter(a => a.id !== row.id);
    ElMessage.success('删除成功');
  }).catch(() => {});
};

const getTypeText = (type: string) => {
  const map: Record<string, string> = { platform: '平台公告', activity: '活动通知', system: '系统维护' };
  return map[type] || type;
};

const getTypeTag = (type: string) => {
  const map: Record<string, string> = { platform: '', activity: 'success', system: 'warning' };
  return map[type] || '';
};

const getStatusText = (status: string) => {
  const map: Record<string, string> = { published: '已发布', draft: '草稿', offline: '已下架' };
  return map[status] || status;
};

const getStatusTag = (status: string) => {
  const map: Record<string, string> = { published: 'success', draft: 'info', offline: 'danger' };
  return map[status] || '';
};

// ==================== 操作日志 ====================
const logs = ref([
  { id: 1, time: '2025-10-18 14:30:00', operator: 'admin_001', type: 'settings', content: '修改服务费为12%', ip: '192.168.1.101' },
  { id: 2, time: '2025-10-18 11:20:00', operator: 'admin_001', type: 'audit', content: '通过房东王强的资质申请', ip: '192.168.1.101' },
  { id: 3, time: '2025-10-17 16:45:00', operator: 'admin_002', type: 'notice', content: '发布"双十一活动通知"', ip: '192.168.1.102' },
  { id: 4, time: '2025-10-17 10:30:00', operator: 'admin_001', type: 'settings', content: '设置最低提现金额为200元', ip: '192.168.1.101' },
  { id: 5, time: '2025-10-16 15:20:00', operator: 'admin_003', type: 'punish', content: '封禁用户test_user，原因：恶意差评', ip: '192.168.1.103' },
  { id: 6, time: '2025-10-16 09:00:00', operator: 'admin_001', type: 'audit', content: '拒绝房源申请ID-1002，理由：资质不全', ip: '192.168.1.101' },
  { id: 7, time: '2025-10-15 14:00:00', operator: 'admin_002', type: 'notice', content: '下架"系统维护通知"', ip: '192.168.1.102' },
  { id: 8, time: '2025-10-15 10:30:00', operator: 'admin_001', type: 'settings', content: '修改免费取消时限为48小时', ip: '192.168.1.101' },
]);

const logFilter = reactive({
  type: '',
  dateRange: null as [Date, Date] | null
});

const filteredLogs = computed(() => {
  let result = [...logs.value];
  if (logFilter.type) {
    result = result.filter(log => log.type === logFilter.type);
  }
  if (logFilter.dateRange && logFilter.dateRange.length === 2) {
    const [start, end] = logFilter.dateRange;
    const startStr = formatDate(start);
    const endStr = formatDate(end) + ' 23:59:59';
    result = result.filter(log => log.time >= startStr && log.time <= endStr);
  }
  return result;
});

const queryLogs = () => {
  // 筛选已通过 computed 自动完成
};

const resetLogs = () => {
  logFilter.type = '';
  logFilter.dateRange = null;
};

const getLogTypeText = (type: string) => {
  const map: Record<string, string> = { settings: '参数修改', audit: '审核', notice: '公告发布', punish: '用户处罚' };
  return map[type] || type;
};

// ==================== 工具函数 ====================
const formatTime = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const formatDate = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};
</script>

<style scoped lang="scss">
.settings-page {
  background: white;
  padding: 24px;
  border-radius: 4px;
  min-height: 500px;

  .settings-tabs {
    :deep(.el-tabs__item) {
      font-size: 15px;
    }
  }

  .refund-slider {
    width: 100%;
    margin-bottom: 12px;
    span {
      font-size: 13px;
      color: #666;
      display: block;
      margin-bottom: 4px;
    }
  }

  .penalty-slider {
    display: flex;
    align-items: center;
    width: 100%;
    :deep(.el-slider) {
      flex: 1;
      margin-right: 16px;
    }
    .penalty-value {
      font-size: 16px;
      font-weight: 600;
      color: #409eff;
      min-width: 50px;
    }
  }

  .notice-header {
    display: flex;
    justify-content: flex-end;
  }

  .notice-title {
    font-weight: 600;
  }

  .logs-filter {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }
}
</style>
