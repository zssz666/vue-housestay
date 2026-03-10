<template>
  <div class="audit-page">
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="房东资质审核" name="host">
        <el-table :data="hostAudits" style="width: 100%">
          <el-table-column prop="date" label="申请时间" width="180" />
          <el-table-column prop="name" label="申请人" width="120" />
          <el-table-column prop="idCard" label="身份证号" width="180">
            <template #default="{ row }">{{ maskIdCard(row.idCard) }}</template>
          </el-table-column>
          <el-table-column label="证件照片" width="150">
            <template #default="{ row }">
              <el-image 
                :src="row.idCardImg" 
                :preview-src-list="[row.idCardImg]" 
                style="width: 50px; height: 30px" 
                fit="cover"
              />
            </template>
          </el-table-column>
          <el-table-column label="房产证" width="150">
            <template #default="{ row }">
              <el-image 
                :src="row.houseCertImg" 
                :preview-src-list="[row.houseCertImg]" 
                style="width: 50px; height: 30px" 
                fit="cover"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button type="success" size="small" @click="approveHost(row)">通过</el-button>
              <el-button type="danger" size="small" @click="rejectHost(row)">驳回</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="房源发布审核" name="property">
        <div v-for="prop in propertyAudits" :key="prop.id" class="property-audit-card">
          <div class="header">
            <span class="title">{{ prop.title }}</span>
            <span class="host">房东：{{ prop.hostName }}</span>
          </div>
          <div class="diff-view">
            <div class="old-ver">
              <h4>当前版本</h4>
              <div class="content">{{ prop.oldDesc || '无 (新发布)' }}</div>
            </div>
            <div class="new-ver">
              <h4>提交版本</h4>
              <div class="content highlight">{{ prop.newDesc }}</div>
            </div>
          </div>
          <div class="actions">
            <el-button type="success" @click="approveProperty(prop)">通过并上架</el-button>
            <el-button type="danger" @click="rejectProperty(prop)">驳回修改</el-button>
          </div>
        </div>
      </el-tab-pane>

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

    <!-- Reject Dialog -->
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

const activeTab = ref('host');
const rejectDialogVisible = ref(false);
const rejectReason = ref('');
const currentItem = ref<any>(null);

const hostAudits = ref([
  { id: 1, date: '2023-10-01 10:00', name: '王强', idCard: '510101199001011234', idCardImg: 'https://via.placeholder.com/150', houseCertImg: 'https://via.placeholder.com/150' },
  { id: 2, date: '2023-10-02 11:30', name: '刘芳', idCard: '510101199202025678', idCardImg: 'https://via.placeholder.com/150', houseCertImg: 'https://via.placeholder.com/150' },
]);

const propertyAudits = ref([
  { id: 101, title: '市中心豪华公寓', hostName: '王强', oldDesc: '位于市中心，交通便利。', newDesc: '位于市中心，交通便利，全新装修，配备55寸大电视。' },
]);

const reviewAudits = ref([
  { id: 1001, content: '房间很脏，根本没打扫！骗子！', reports: 5 },
  { id: 1002, content: '加微信私聊优惠更大...', reports: 3 },
]);

const maskIdCard = (id: string) => id.replace(/^(.{6})(?:\d+)(.{4})$/, '$1******$2');

const approveHost = (row: any) => {
  ElMessage.success(`已通过 ${row.name} 的房东资质申请`);
  // Remove from list
};

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
}

.property-audit-card {
  border: 1px solid #eee;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 4px;

  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 12px;
    .title { font-weight: bold; font-size: 16px; }
    .host { color: #666; }
  }

  .diff-view {
    display: flex;
    gap: 24px;
    margin-bottom: 20px;
    
    .old-ver, .new-ver {
      flex: 1;
      padding: 16px;
      background: #f9f9f9;
      border-radius: 4px;
      h4 { margin: 0 0 8px; font-size: 14px; color: #999; }
      .content { font-size: 14px; line-height: 1.6; }
      .highlight { background: #e6f7ff; padding: 4px; }
    }
  }

  .actions {
    text-align: right;
  }
}
</style>
