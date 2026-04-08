<template>
  <el-dialog
    v-model="visible"
    title="下载栖居APP"
    width="400px"
    :show-close="true"
    class="qrcode-modal"
    align-center
  >
    <div class="modal-content">
      <p class="modal-tip">{{ tip }}</p>
      <div class="qrcode-wrapper">
        <div class="qrcode-placeholder">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="#ddd">
            <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/>
          </svg>
          <p class="qrcode-hint">APP下载二维码</p>
        </div>
      </div>
      <p class="download-desc">扫码下载栖居APP<br/>体验完整民宿预订功能</p>
    </div>
    <template #footer>
      <div class="modal-footer">
        <el-button @click="visible = false">关闭</el-button>
        <el-button type="primary" @click="handleDownload">前往下载</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const visible = ref(false);
const tip = ref('请使用手机APP体验完整功能');

const open = (message?: string) => {
  if (message) {
    tip.value = message;
  }
  visible.value = true;
};

const handleDownload = () => {
  window.open('https:// housestay-app.example.com/download', '_blank');
};

defineExpose({ open });
</script>

<style scoped lang="scss">
.qrcode-modal {
  :deep(.el-dialog) {
    border-radius: 16px;
    overflow: hidden;
  }

  :deep(.el-dialog__header) {
    padding: 20px 24px 16px;
    border-bottom: 1px solid #f0f0f0;

    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
      color: #222;
    }
  }

  :deep(.el-dialog__body) {
    padding: 24px;
  }

  :deep(.el-dialog__footer) {
    padding: 16px 24px 20px;
    border-top: 1px solid #f0f0f0;
  }
}

.modal-content {
  text-align: center;
}

.modal-tip {
  font-size: 15px;
  color: #484848;
  margin-bottom: 24px;
}

.qrcode-wrapper {
  margin-bottom: 20px;
}

.qrcode-placeholder {
  width: 180px;
  height: 180px;
  margin: 0 auto;
  background: #fafafa;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border: 1px dashed #e0e0e0;

  .qrcode-hint {
    font-size: 12px;
    color: #999;
  }
}

.download-desc {
  font-size: 14px;
  color: #717171;
  line-height: 1.6;
}

.modal-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style>
