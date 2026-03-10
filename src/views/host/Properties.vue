<template>
  <div class="properties-page">
    <div class="page-header">
      <h2>房源管理</h2>
      <el-button type="primary" @click="openWizard">发布房源</el-button>
    </div>

    <el-table :data="properties" style="width: 100%" v-loading="loading">
      <el-table-column prop="image" label="封面" width="100">
        <template #default="{ row }">
          <el-image :src="row.images[0]" style="width: 60px; height: 40px; border-radius: 4px;" fit="cover" />
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
      <el-table-column prop="cityCode" label="城市" width="100" />
      <el-table-column prop="price" label="价格" width="100">
        <template #default="{ row }">¥{{ row.price }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '已上架' : '已下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="editProperty(row)">编辑</el-button>
          <el-button link type="primary" @click="router.push(`/host/calendar?id=${row.homestayId}`)">日历</el-button>
          <el-switch
            v-model="row.status"
            :active-value="1"
            :inactive-value="0"
            style="margin-left: 12px"
            @change="toggleStatus(row)"
          />
        </template>
      </el-table-column>
    </el-table>

    <!-- Wizard Dialog -->
    <el-dialog v-model="wizardVisible" title="发布房源" width="800px" destroy-on-close>
      <el-steps :active="activeStep" finish-status="success" simple style="margin-bottom: 24px">
        <el-step title="基础信息" />
        <el-step title="设施" />
        <el-step title="价格" />
        <el-step title="图片" />
      </el-steps>

      <el-form :model="form" label-width="100px" style="max-height: 500px; overflow-y: auto; padding-right: 10px;">
        <!-- Step 1 -->
        <div v-show="activeStep === 0">
          <el-form-item label="房源标题">
            <el-input v-model="form.title" placeholder="吸引人的标题" />
          </el-form-item>
          <el-form-item label="详细地址">
            <el-input v-model="form.address" placeholder="省/市/区/街道" />
          </el-form-item>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="房间数">
                <el-input-number v-model="form.roomCount" :min="1" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="最大入住">
                <el-input-number v-model="form.maxGuests" :min="1" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="面积 (㎡)">
            <el-input-number v-model="form.area" :min="1" />
          </el-form-item>
        </div>

        <!-- Step 2 -->
        <div v-show="activeStep === 1">
          <el-form-item label="基础设施">
            <el-checkbox-group v-model="form.facilities">
              <el-checkbox label="wifi">WiFi</el-checkbox>
              <el-checkbox label="ac">空调</el-checkbox>
              <el-checkbox label="tv">电视</el-checkbox>
              <el-checkbox label="washer">洗衣机</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="厨房设施">
            <el-checkbox-group v-model="form.facilities">
              <el-checkbox label="kitchen">厨房</el-checkbox>
              <el-checkbox label="fridge">冰箱</el-checkbox>
              <el-checkbox label="microwave">微波炉</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </div>

        <!-- Step 3 -->
        <div v-show="activeStep === 2">
          <el-form-item label="基础价格">
            <el-input v-model="form.price" placeholder="每晚价格">
              <template #prefix>¥</template>
            </el-input>
          </el-form-item>
          <el-form-item label="周末价格">
            <el-input v-model="form.weekendPrice" placeholder="周五/周六价格">
              <template #prefix>¥</template>
            </el-input>
          </el-form-item>
          <el-form-item label="退订政策">
            <el-select v-model="form.cancellationPolicy">
              <el-option label="宽松 (入住前1天可退)" value="flexible" />
              <el-option label="适中 (入住前5天可退)" value="moderate" />
              <el-option label="严格 (不可退)" value="strict" />
            </el-select>
          </el-form-item>
        </div>

        <!-- Step 4 -->
        <div v-show="activeStep === 3">
          <el-upload
            v-model:file-list="fileList"
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            drag
            multiple
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </div>
      </el-form>

      <template #footer>
        <el-button @click="prevStep" v-if="activeStep > 0">上一步</el-button>
        <el-button type="primary" @click="nextStep" v-if="activeStep < 3">下一步</el-button>
        <el-button type="success" @click="submitProperty" v-if="activeStep === 3">提交审核</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { homestays } from '@/mock/data';
import type { Homestay } from '@/types';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';

const router = useRouter();
const loading = ref(false);
const properties = ref<Homestay[]>([]);
const wizardVisible = ref(false);
const activeStep = ref(0);
const fileList = ref([]);

const form = reactive({
  title: '',
  address: '',
  roomCount: 1,
  maxGuests: 2,
  area: 30,
  facilities: [],
  price: '',
  weekendPrice: '',
  cancellationPolicy: 'flexible'
});

const openWizard = () => {
  wizardVisible.value = true;
  activeStep.value = 0;
};

const nextStep = () => {
  if (activeStep.value < 3) activeStep.value++;
};

const prevStep = () => {
  if (activeStep.value > 0) activeStep.value--;
};

const submitProperty = () => {
  wizardVisible.value = false;
  ElMessage.success('房源已提交审核');
};

const editProperty = (_row: Homestay) => {
  // Fill form and open wizard
  openWizard();
};

const toggleStatus = (row: Homestay) => {
  ElMessage.success(`房源已${row.status === 1 ? '上架' : '下架'}`);
};

onMounted(() => {
  loading.value = true;
  setTimeout(() => {
    properties.value = homestays;
    loading.value = false;
  }, 500);
});
</script>

<style scoped lang="scss">
.properties-page {
  background: white;
  padding: 24px;
  border-radius: 2px;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    h2 { margin: 0; font-size: 20px; color: rgba(0,0,0,0.85); }
  }
}
</style>
