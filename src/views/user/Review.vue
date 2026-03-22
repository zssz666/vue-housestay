<template>
  <div class="review-page">
    <div class="review-container">
      <div class="header">
        <h1>评价您的入住体验</h1>
        <p class="subtitle">您的评价将帮助其他房客做出更好的选择</p>
      </div>

      <div class="homestay-summary" v-if="order">
        <el-image :src="order.homestayInfo.images[0]" class="cover-img" fit="cover" />
        <div class="info">
          <h3>{{ order.homestayInfo.title }}</h3>
          <p>{{ order.checkInDate }} - {{ order.checkOutDate }}</p>
        </div>
      </div>

      <el-form :model="form" class="review-form">
        <!-- Rating -->
        <div class="form-section rating-section">
          <label>总体评分</label>
          <div class="rating-wrapper">
            <el-rate 
              v-model="form.rating" 
              :max="5" 
              size="large" 
              allow-half
              show-text
              :texts="['非常差', '差', '一般', '满意', '完美']"
              text-color="#FF5A5F"
            />
          </div>
        </div>

        <!-- Tags -->
        <div class="form-section">
          <label>您对哪些方面印象深刻？</label>
          <div class="tags-wrapper">
            <el-check-tag 
              v-for="tag in availableTags" 
              :key="tag" 
              :checked="form.tags.includes(tag)"
              @change="toggleTag(tag)"
              class="review-tag"
            >
              {{ tag }}
            </el-check-tag>
          </div>
        </div>

        <!-- Content -->
        <div class="form-section">
          <label>详细评价</label>
          <el-input 
            v-model="form.content" 
            type="textarea" 
            :rows="6" 
            placeholder="分享您的入住体验，例如房间整洁度、房东服务、周边环境等..."
            maxlength="500"
            show-word-limit
          />
          <div class="word-count-alert" v-if="form.content.length > 0 && form.content.length < 15">
            加油，再写 {{ 15 - form.content.length }} 个字即可提交
          </div>
        </div>

        <!-- Images -->
        <div class="form-section">
          <label>上传照片 (最多9张)</label>
          <el-upload
            v-model:file-list="fileList"
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :limit="9"
            :on-preview="handlePictureCardPreview"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </div>

        <!-- Submit -->
        <div class="form-actions">
          <el-button @click="router.back()">取消</el-button>
          <el-button 
            type="primary" 
            :disabled="!isValid" 
            :loading="submitting"
            @click="handleSubmit"
          >
            提交评价
          </el-button>
        </div>
      </el-form>

      <el-dialog v-model="dialogVisible">
        <img w-full :src="dialogImageUrl" alt="Preview Image" />
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { orderApi } from '@/api/modules/order';
import { reviewApi } from '@/api/modules/review';
import type { Order } from '@/types';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();

const order = ref<Order | null>(null);
const submitting = ref(false);
const dialogImageUrl = ref('');
const dialogVisible = ref(false);
const fileList = ref([]);

const availableTags = ["干净整洁", "交通便利", "房东热情", "设施齐全", "性价比高", "风景优美", "安静舒适"];

const form = reactive({
  rating: 0,
  tags: [] as string[],
  content: ''
});

// 加载订单详情
const loadOrder = async () => {
  try {
    const orderId = Number(route.params.id);
    order.value = await orderApi.getDetail(orderId);
  } catch (error) {
    console.error('加载订单失败:', error);
    ElMessage.error('加载订单失败');
  }
};

const isValid = computed(() => {
  return form.rating > 0 && form.content.length >= 15;
});

const toggleTag = (tag: string) => {
  const index = form.tags.indexOf(tag);
  if (index > -1) {
    form.tags.splice(index, 1);
  } else {
    form.tags.push(tag);
  }
};

const handlePictureCardPreview = (uploadFile: any) => {
  dialogImageUrl.value = uploadFile.url!;
  dialogVisible.value = true;
};

const handleSubmit = () => {
  if (!isValid.value) return;
  
  submitting.value = true;
  // Simulate API
  setTimeout(() => {
    submitting.value = false;
    ElMessage.success('评价提交成功！感谢您的分享');
    router.push('/user/orders');
  }, 1500);
};

onMounted(() => {
  const orderId = Number(route.query.orderId);
  if (orderId) {
    order.value = orders.find(o => o.orderId === orderId) || null;
  }
  
  if (!order.value) {
    ElMessage.error('订单不存在');
    router.push('/user/orders');
  }
});
</script>

<style scoped lang="scss">
.review-page {
  padding: 40px 20px;
  background-color: white;
  min-height: 100vh;
}

.review-container {
  max-width: 800px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 40px;
  h1 { font-size: 28px; margin-bottom: 8px; color: #222; }
  .subtitle { color: #717171; font-size: 16px; }
}

.homestay-summary {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 12px;
  margin-bottom: 32px;
  align-items: center;

  .cover-img {
    width: 120px;
    height: 80px;
    border-radius: 8px;
  }

  .info {
    h3 { margin: 0 0 8px; font-size: 18px; }
    p { margin: 0; color: #717171; }
  }
}

.review-form {
  .form-section {
    margin-bottom: 32px;
    
    label {
      display: block;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #484848;
    }
  }
}

.rating-wrapper {
  display: flex;
  align-items: center;
}

.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.review-tag {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  &.is-checked {
    background-color: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }
  
  &:not(.is-checked) {
    background-color: white;
    border: 1px solid #ddd;
    color: #717171;
    &:hover { border-color: #222; }
  }
}

.word-count-alert {
  font-size: 12px;
  color: #ff5a5f;
  margin-top: 4px;
  text-align: right;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 40px;
  
  .el-button--primary {
    padding: 12px 32px;
    font-weight: 600;
  }
}
</style>
