<template>
  <div class="audit-page">
    <el-tabs v-model="activeTab" type="card">
      <!-- 房东资质审核 -->
      <el-tab-pane label="房东资质审核" name="landlord">
        <el-table :data="landlordAudits" style="width: 100%" @row-click="handleRowClick">
          <el-table-column prop="submitTime" label="申请时间" width="180" />
          <el-table-column label="申请人" width="150">
            <template #default="{ row }">
              <div class="applicant-cell">
                <el-avatar :size="32" :src="row.applicant.avatar">
                  {{ row.applicant.name.charAt(0) }}
                </el-avatar>
                <span>{{ row.applicant.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="applicant.phone" label="手机号" width="130">
            <template #default="{ row }">{{ maskPhone(row.applicant.phone) }}</template>
          </el-table-column>
          <el-table-column prop="applicant.idCardName" label="姓名" width="120" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.status === 0" type="warning">待审核</el-tag>
              <el-tag v-else-if="row.status === 1" type="success">已通过</el-tag>
              <el-tag v-else type="danger">已驳回</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="success" size="small" @click.stop="openAuditDrawer('landlord', row)">
                审核
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 房源发布审核 -->
      <el-tab-pane label="房源发布审核" name="homestay">
        <el-table :data="homestayAudits" style="width: 100%" @row-click="handleRowClick">
          <el-table-column prop="submitTime" label="申请时间" width="180" />
          <el-table-column prop="homestay.title" label="房源标题" min-width="200" />
          <el-table-column prop="landlord.name" label="房东" width="120" />
          <el-table-column label="价格" width="100">
            <template #default="{ row }">
              <span :class="{ 'price-high': row.homestay.price > row.homestay.areaPrice * 1.5 }">
                ¥{{ row.homestay.price }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.status === 0" type="warning">待审核</el-tag>
              <el-tag v-else-if="row.status === 1" type="success">已通过</el-tag>
              <el-tag v-else type="danger">已驳回</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="success" size="small" @click.stop="openAuditDrawer('homestay', row)">
                审核
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 提现审核 -->
      <el-tab-pane label="提现审核" name="withdrawal">
        <el-table :data="withdrawalAudits" style="width: 100%" @row-click="handleRowClick">
          <el-table-column prop="submitTime" label="申请时间" width="180" />
          <el-table-column label="申请人" width="150">
            <template #default="{ row }">
              <div class="applicant-cell">
                <el-avatar :size="32" :src="row.applicant?.avatar || ''">
                  {{ row.applicant?.name?.charAt(0) || '?' }}
                </el-avatar>
                <span>{{ row.applicant?.name || '未知' }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="提现金额" width="150">
            <template #default="{ row }">
              <span :class="{ 'amount-large': row.withdrawal.amount >= 20000 }">
                ¥{{ row.withdrawal.amount.toLocaleString() }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="withdrawal.bankName" label="银行" width="120" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.status === 0" type="warning">待审核</el-tag>
              <el-tag v-else-if="row.status === 1" type="success">已通过</el-tag>
              <el-tag v-else type="danger">已驳回</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="success" size="small" @click.stop="openAuditDrawer('withdrawal', row)">
                审核
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 评价内容审核 -->
      <el-tab-pane label="评价内容审核" name="review">
        <el-table :data="reviewAudits" style="width: 100%">
          <el-table-column prop="content" label="评价内容" min-width="300" />
          <el-table-column label="举报次数" prop="reports" width="100" sortable />
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button type="info" size="small" @click="ignoreReview(row)">忽略</el-button>
              <el-button type="danger" size="small" @click="deleteReview(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 审核详情抽屉 -->
    <AuditDetailDrawer
      v-model="drawerVisible"
      :type="auditType"
      :detail="currentAudit"
      :loading="drawerLoading"
      @audit="handleAudit"
      @close="handleDrawerClose"
    />

    <!-- 驳回原因弹窗（备用） -->
    <el-dialog v-model="rejectDialogVisible" title="驳回原因" width="400px">
      <el-input v-model="rejectReason" type="textarea" placeholder="请输入驳回原因..." :rows="4" />
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmReject">确认驳回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import AuditDetailDrawer from './components/AuditDetailDrawer.vue';
import type {
  AuditType,
  AuditDetail,
  LandlordAuditDetail,
  HomestayAuditDetail,
  WithdrawalAuditDetail,
  AuditActionParams
} from '@/types';

const activeTab = ref('landlord');
const rejectDialogVisible = ref(false);
const rejectReason = ref('');
const currentItem = ref<any>(null);

// 抽屉相关
const drawerVisible = ref(false);
const drawerLoading = ref(false);
const auditType = ref<AuditType>('landlord');
const currentAudit = ref<AuditDetail | undefined>();

// ========== 模拟数据 ==========

const landlordAudits = ref<LandlordAuditDetail[]>([
  {
    id: 'landlord_001',
    type: 'landlord',
    status: 0,
    submitTime: '2025-03-24 10:30',
    applicant: {
      id: 101,
      name: '王强',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      phone: '13888888888',
      idCardName: '王强',
      idCardNumber: '510101199001011234',
      idCardExpireDate: '2030-01-01',
      registerTime: '2024-06-15'
    },
    idCardFront: 'https://via.placeholder.com/400x250/1890ff/ffffff?text=身份证正面',
    idCardBack: 'https://via.placeholder.com/400x250/52c41a/ffffff?text=身份证反面',
    handHoldIdCard: 'https://via.placeholder.com/400x250/faad14/ffffff?text=手持证件照',
    propertyCert: [
      'https://via.placeholder.com/400x250/722ed1/ffffff?text=房产证1',
      'https://via.placeholder.com/400x250/eb2f96/ffffff?text=房产证2'
    ],
    history: [{ id: 1, auditId: 'landlord_001', action: 'submit', operator: 'system', time: '2025-03-24 10:30' }]
  },
  {
    id: 'landlord_002',
    type: 'landlord',
    status: 0,
    submitTime: '2025-03-23 14:20',
    applicant: {
      id: 102,
      name: '刘芳',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
      phone: '13912345678',
      idCardName: '刘芳',
      idCardNumber: '510202199202025678',
      idCardExpireDate: '2028-06-15',
      registerTime: '2024-08-20'
    },
    idCardFront: 'https://via.placeholder.com/400x250/1890ff/ffffff?text=身份证正面',
    idCardBack: 'https://via.placeholder.com/400x250/52c41a/ffffff?text=身份证反面',
    handHoldIdCard: 'https://via.placeholder.com/400x250/faad14/ffffff?text=手持证件照',
    propertyCert: ['https://via.placeholder.com/400x250/722ed1/ffffff?text=房产证'],
    riskInfo: {
      phoneRegistered: true,
      relatedAccounts: ['刘芳_2'],
      riskLevel: 'warning',
      riskDesc: '该手机号关联多个账号'
    },
    history: [
      { id: 1, auditId: 'landlord_002', action: 'submit', operator: 'system', time: '2025-03-23 14:20' }
    ]
  }
]);

const homestayAudits = ref<HomestayAuditDetail[]>([
  {
    id: 'homestay_001',
    type: 'homestay',
    status: 0,
    submitTime: '2025-03-24 09:15',
    landlord: {
      id: 101,
      name: '王强',
      phone: '13888888888'
    },
    homestay: {
      id: 1001,
      title: '市中心豪华海景公寓',
      price: 680,
      areaPrice: 450,
      images: [
        'https://via.placeholder.com/600x400/1890ff/ffffff?text=客厅',
        'https://via.placeholder.com/600x400/52c41a/ffffff?text=卧室',
        'https://via.placeholder.com/600x400/faad14/ffffff?text=厨房'
      ],
      address: '成都市锦江区春熙路188号',
      roomType: '整套公寓',
      area: 85,
      roomCount: 2,
      bedType: '1张大床 + 1张沙发床',
      maxGuests: 4,
      facilities: ['WiFi', '空调', '洗衣机', '冰箱', '电视', '吹风机'],
      description: '位于成都市中心春熙路，步行5分钟可达太古里。全新装修，配备55寸大电视，智能门锁，24小时热水。楼下有地铁站，出行非常方便。'
    },
    violations: {
      sensitiveWords: [{ word: '微信', count: 2, position: 15 }],
      abnormalImages: [],
      priceAbnormal: true
    },
    history: [{ id: 1, auditId: 'homestay_001', action: 'submit', operator: 'system', time: '2025-03-24 09:15' }]
  },
  {
    id: 'homestay_002',
    type: 'homestay',
    status: 0,
    submitTime: '2025-03-23 16:40',
    landlord: {
      id: 103,
      name: '李明',
      phone: '13722223333'
    },
    homestay: {
      id: 1002,
      title: '近郊温馨花园别墅',
      price: 1280,
      areaPrice: 1100,
      images: [
        'https://via.placeholder.com/600x400/13c2c2/ffffff?text=花园',
        'https://via.placeholder.com/600x400/eb2f96/ffffff?text=客厅'
      ],
      address: '成都市双流区麓山大道200号',
      roomType: '独栋别墅',
      area: 200,
      roomCount: 4,
      bedType: '3张大床',
      maxGuests: 8,
      facilities: ['WiFi', '中央空调', '私人花园', '游泳池', '停车场', '厨房'],
      description: '位于麓山国际社区的高端独栋别墅，环境优美，私密性极佳。配备私人游泳池和花园，适合家庭聚会或朋友派对。'
    },
    history: [
      { id: 1, auditId: 'homestay_002', action: 'submit', operator: 'system', time: '2025-03-23 16:40' }
    ]
  }
]);

const withdrawalAudits = ref<WithdrawalAuditDetail[]>([
  {
    id: 'withdrawal_001',
    type: 'withdrawal',
    status: 0,
    submitTime: '2025-03-24 11:00',
    withdrawal: {
      id: 'wd_001',
      amount: 50000,
      fee: 0,
      actualAmount: 50000,
      bankName: '中国工商银行',
      cardNumber: '6222********8888',
      cardHolder: '王强',
      realNameMatch: true
    },
    account: {
      balance: 85000,
      guaranteeBalance: 10000,
      creditScore: 95,
      activeComplaints: 0
    },
    recentWithdrawals: [
      { time: '03-20 10:00', amount: 20000, status: 'approved' },
      { time: '03-22 15:30', amount: 15000, status: 'approved' }
    ],
    withdrawalCount7Days: 2,
    history: [{ id: 1, auditId: 'withdrawal_001', action: 'submit', operator: 'system', time: '2025-03-24 11:00' }]
  },
  {
    id: 'withdrawal_002',
    type: 'withdrawal',
    status: 0,
    submitTime: '2025-03-23 18:20',
    withdrawal: {
      id: 'wd_002',
      amount: 8000,
      fee: 0,
      actualAmount: 8000,
      bankName: '招商银行',
      cardNumber: '6225********1234',
      cardHolder: '刘芳',
      realNameMatch: false
    },
    account: {
      balance: 25000,
      guaranteeBalance: 10000,
      creditScore: 78,
      activeComplaints: 1
    },
    recentWithdrawals: [],
    withdrawalCount7Days: 0,
    history: [{ id: 1, auditId: 'withdrawal_002', action: 'submit', operator: 'system', time: '2025-03-23 18:20' }]
  }
]);

const reviewAudits = ref([
  { id: 1001, content: '房间很脏，根本没打扫！骗子！', reports: 5 },
  { id: 1002, content: '加微信私聊优惠更大...', reports: 3 }
]);

// ========== 工具函数 ==========

function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

// ========== 抽屉操作 ==========

function handleRowClick(row: any) {
  // 可选：点击行打开详情
}

function openAuditDrawer(type: AuditType, row: any) {
  auditType.value = type;
  currentAudit.value = row;
  drawerVisible.value = true;
}

function handleDrawerClose() {
  // 刷新列表
  refreshList();
}

function handleAudit(params: AuditActionParams) {
  console.log('审核操作:', params);
  // 根据审核结果更新列表
  if (params.action === 'approve') {
    ElMessage.success('审核已通过');
  } else if (params.action === 'reject') {
    ElMessage.info('已驳回');
  }
  // 实际项目中这里应该调用API
  refreshList();
}

function refreshList() {
  // 模拟刷新：移除已审核的项目
  if (auditType.value === 'landlord' && currentAudit.value) {
    const index = landlordAudits.value.findIndex(item => item.id === currentAudit.value?.id);
    if (index > -1) landlordAudits.value.splice(index, 1);
  } else if (auditType.value === 'homestay' && currentAudit.value) {
    const index = homestayAudits.value.findIndex(item => item.id === currentAudit.value?.id);
    if (index > -1) homestayAudits.value.splice(index, 1);
  } else if (auditType.value === 'withdrawal' && currentAudit.value) {
    const index = withdrawalAudits.value.findIndex(item => item.id === currentAudit.value?.id);
    if (index > -1) withdrawalAudits.value.splice(index, 1);
  }
}

// ========== 备用驳回方法 ==========

const rejectHost = (row: any) => {
  currentItem.value = row;
  rejectReason.value = '';
  rejectDialogVisible.value = true;
};

const confirmReject = () => {
  if (!rejectReason.value) {
    ElMessage.warning('请输入原因');
    return;
  }
  ElMessage.info(`已驳回申请，原因：${rejectReason.value}`);
  rejectDialogVisible.value = false;
};

const approveProperty = (_prop: any) => {
  ElMessage.success('房源已上架');
};

const rejectProperty = (prop: any) => {
  currentItem.value = prop;
  rejectReason.value = '';
  rejectDialogVisible.value = true;
};

const deleteReview = (_row: any) => {
  ElMessageBox.confirm('确定删除该评价吗？', '警告', { type: 'warning' }).then(() => {
    ElMessage.success('评价已删除');
  });
};

const ignoreReview = (_row: any) => {
  ElMessage.info('已忽略举报');
};
</script>

<style scoped lang="scss">
.audit-page {
  background: white;
  padding: 24px;
  border-radius: 4px;
  min-height: 500px;

  :deep(.el-table) {
    .el-table__row {
      cursor: pointer;

      &:hover {
        background-color: #f5f7fa;
      }
    }
  }

  .applicant-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .price-high {
    color: #f5222d;
    font-weight: 600;
  }

  .amount-large {
    color: #f5222d;
    font-weight: 600;
  }
}
</style>
