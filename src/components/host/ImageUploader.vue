<template>
  <div class="image-uploader">
    <!-- 已上传图片网格 -->
    <div v-if="modelValue.length > 0" class="uploaded-grid">
      <div
        v-for="(img, index) in modelValue"
        :key="index"
        class="uploaded-item"
        :class="{ 'is-cover': index === 0 }"
        draggable="true"
        @dragstart="onDragStart(index, $event)"
        @dragover.prevent="onDragOver(index)"
        @drop="onDrop(index)"
        @dragend="onDragEnd"
      >
        <el-image
          :src="img"
          fit="cover"
          class="uploaded-img"
          :preview-src-list="modelValue"
          :initial-index="index"
          preview-teleported
        />
        <!-- 封面角标 -->
        <div v-if="index === 0" class="cover-badge">封面</div>
        <!-- 删除按钮 -->
        <div class="uploaded-actions">
          <el-icon @click="handleRemove(index)"><Close /></el-icon>
        </div>
      </div>
    </div>

    <!-- 上传区域 -->
    <div
      class="upload-zone"
      :class="{ 'is-dragover': isDragover }"
      @click="triggerUpload"
      @dragover.prevent="isDragover = true"
      @dragleave="isDragover = false"
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        multiple
        style="display: none"
        @change="handleFileChange"
      />
      <div class="upload-hint">
        <el-icon size="32" color="#bfbfbf"><Plus /></el-icon>
        <span>点击或拖拽上传图片</span>
        <span class="upload-tip">支持 JPG/PNG，建议 1200×800</span>
      </div>
    </div>

    <!-- 提示语 -->
    <div class="upload-info">
      <el-icon color="#faad14" size="14"><Warning /></el-icon>
      <span>至少上传 5 张图片，第一张将作为封面图，拖拽可调整顺序</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Close, Warning } from '@element-plus/icons-vue'

interface Props {
  modelValue: string[]
  max?: number
}

interface Emits {
  (e: 'update:modelValue', val: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  max: 20
})
const emit = defineEmits<Emits>()

const fileInputRef = ref<HTMLInputElement>()
const isDragover = ref(false)
const dragFromIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

function triggerUpload() {
  fileInputRef.value?.click()
}

function handleFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files) processFiles(Array.from(files))
  ;(e.target as HTMLInputElement).value = ''
}

function handleDrop(e: DragEvent) {
  isDragover.value = false
  const files = Array.from(e.dataTransfer?.files || []).filter(f => f.type.startsWith('image/'))
  if (files.length) processFiles(files)
}

function processFiles(files: File[]) {
  const remaining = props.max - props.modelValue.length
  if (remaining <= 0) {
    ElMessage.warning(`最多上传 ${props.max} 张图片`)
    return
  }
  const toProcess = files.slice(0, remaining)
  toProcess.forEach(file => {
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.error(`${file.name} 超过 5MB 限制`)
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const url = e.target?.result as string
      emit('update:modelValue', [...props.modelValue, url])
    }
    reader.readAsDataURL(file)
  })
}

function handleRemove(index: number) {
  const list = [...props.modelValue]
  list.splice(index, 1)
  emit('update:modelValue', list)
}

// 拖拽排序
function onDragStart(index: number, _e: DragEvent) {
  dragFromIndex.value = index
}
function onDragOver(index: number) {
  dragOverIndex.value = index
}
function onDrop(index: number) {
  if (dragFromIndex.value === null || dragFromIndex.value === index) return
  const list = [...props.modelValue]
  const [removed] = list.splice(dragFromIndex.value, 1)
  list.splice(index, 0, removed)
  emit('update:modelValue', list)
  dragFromIndex.value = null
  dragOverIndex.value = null
}
function onDragEnd() {
  dragFromIndex.value = null
  dragOverIndex.value = null
}
</script>

<style scoped lang="scss">
.image-uploader {
  width: 100%;
}

.uploaded-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.uploaded-item {
  position: relative;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  cursor: grab;
  border: 2px solid transparent;
  transition: all 0.2s;

  &:hover {
    border-color: #1890ff;
    .uploaded-actions { opacity: 1; }
  }

  &.is-cover {
    border-color: #1890ff;
  }

  .uploaded-img {
    width: 100%;
    height: 100%;
    display: block;
  }

  .cover-badge {
    position: absolute;
    top: 0;
    left: 0;
    background: linear-gradient(135deg, #1890ff, #36cfc9);
    color: #fff;
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 0 0 8px 0;
    font-weight: 600;
  }

  .uploaded-actions {
    position: absolute;
    top: 4px;
    right: 4px;
    opacity: 0;
    transition: opacity 0.2s;
    display: flex;
    gap: 4px;

    .el-icon {
      width: 22px;
      height: 22px;
      background: rgba(0, 0, 0, 0.55);
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      cursor: pointer;
      &:hover { background: rgba(255, 0, 0, 0.75); }
    }
  }
}

.upload-zone {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 32px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;

  &:hover, &.is-dragover {
    border-color: #1890ff;
    background: #f0f7ff;
    .upload-hint { color: #1890ff; }
  }
}

.upload-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #8c8c8c;
  font-size: 14px;
  user-select: none;

  .upload-tip {
    font-size: 12px;
    color: #bfbfbf;
  }
}

.upload-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 10px;
}
</style>
