<template>
  <div class="homestay-audit-content">
    <!-- 加载状态 -->
    <el-skeleton :loading="loading" animated :rows="10">
      <template #template>
        <div class="skeleton-card">
          <el-skeleton-item variant="image" style="width: 100%; height: 200px" />
          <div style="margin-top: 16px">
            <el-skeleton-item variant="text" style="width: 60%" />
            <el-skeleton-item variant="text" style="width: 40%" />
          </div>
        </div>
      </template>

      <!-- 房源预览卡片 -->
      <div class="info-card preview-card">
        <el-carousel height="200px" indicator-position="outside" class="homestay-carousel">
          <el-carousel-item v-for="(img, index) in detail.homestay.images" :key="index">
            <div class="carousel-image-wrapper">
              <el-image
                :src="img"
                :preview-src-list="detail.homestay.images"
                fit="cover"
                class="carousel-image"
              />
              <!-- 违规图片警告 -->
              <div v-if="isViolationImage(index)" class="violation-badge">
                <el-icon><Warning /></el-icon>
                违规
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>

        <div class="homestay-basic">
          <h3 class="homestay-title">{{ detail.homestay.title }}</h3>
          <div class="homestay-meta">
            <span class="price" :class="{ 'price-abnormal': isPriceAbnormal }">
              ¥{{ detail.homestay.price }}/晚
              <el-tag v-if="isPriceAbnormal" type="danger" size="small">价格异常</el-tag>
            </span>
            <span class="location">
              <el-icon><Location /></el-icon>
              {{ detail.homestay.address }}
            </span>
          </div>
        </div>
      </div>

      <!-- 详细信息 -->
      <div class="info-card">
        <div class="section-title">房源信息</div>

        <el-descriptions :column="2" border class="homestay-descriptions">
          <el-descriptions-item label="房型">{{ detail.homestay.roomType }}</el-descriptions-item>
          <el-descriptions-item label="面积">{{ detail.homestay.area }}㎡</el-descriptions-item>
          <el-descriptions-item label="房间数">{{ detail.homestay.roomCount }}间</el-descriptions-item>
          <el-descriptions-item label="床型">{{ detail.homestay.bedType }}</el-descriptions-item>
          <el-descriptions-item label="可住人数" :span="2">{{ detail.homestay.maxGuests }}人</el-descriptions-item>
        </el-descriptions>

        <div class="section-subtitle">设施标签</div>
        <div class="facilities">
          <el-tag v-for="facility in detail.homestay.facilities" :key="facility" class="facility-tag">
            {{ facility }}
          </el-tag>
        </div>

        <div class="section-subtitle">房源描述</div>
        <el-input
          type="textarea"
          :value="detail.homestay.description"
          :rows="4"
          readonly
          class="description-textarea"
        />
      </div>

      <!-- 违规检测 -->
      <div v-if="hasViolations" class="info-card violation-card">
        <div class="section-title">
          <el-icon color="#f5222d"><WarningFilled /></el-icon>
          违规检测
        </div>

        <!-- 敏感词检测 -->
        <div v-if="detail.violations?.sensitiveWords?.length" class="violation-section">
          <div class="violation-label">敏感词检测</div>
          <div class="violation-content">
            <el-tag
              v-for="word in detail.violations.sensitiveWords"
              :key="word.word"
              type="danger"
              class="violation-tag"
            >
              "{{ word.word }}"（出现{{ word.count }}次）
            </el-tag>
          </div>
          <div class="violation-highlight">
            <span class="highlight-label">原文中高亮：</span>
            <span v-html="highlightSensitiveWords(detail.homestay.description, detail.violations.sensitiveWords)" />
          </div>
        </div>

        <!-- 图片违规 -->
        <div v-if="detail.violations?.abnormalImages?.length" class="violation-section">
          <div class="violation-label">图片违规</div>
          <div class="violation-images">
            <div
              v-for="img in detail.violations.abnormalImages"
              :key="img.index"
              class="violation-image-item"
            >
              <el-image
                :src="detail.homestay.images[img.index]"
                fit="cover"
                class="violation-thumbnail"
              />
              <div class="violation-reason">{{ img.reason }}</div>
            </div>
          </div>
        </div>

        <!-- 价格异常 -->
        <div v-if="detail.violations?.priceAbnormal" class="violation-section">
          <div class="violation-label">价格异常</div>
          <div class="price-compare">
            <div class="price-item">
              <span class="price-label">当前定价：</span>
              <span class="price-value">¥{{ detail.homestay.price }}</span>
            </div>
            <div class="price-item">
              <span class="price-label">同区域均价：</span>
              <span class="price-value">¥{{ detail.homestay.areaPrice }}</span>
            </div>
            <div class="price-item highlight">
              <span class="price-label">偏离幅度：</span>
              <span class="price-value danger">{{ priceDeviation }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 对比查看（修改后重新提交） -->
      <div v-if="detail.previousVersion" class="info-card">
        <el-collapse>
          <el-collapse-item title="查看上次审核版本" name="compare">
            <div class="compare-section">
              <div class="compare-item">
                <span class="compare-label">标题变更：</span>
                <div class="compare-diff">
                  <span class="diff-old" v-if="detail.previousVersion.title !== detail.homestay.title">
                    {{ detail.previousVersion.title }}
                  </span>
                  <span class="diff-new" v-if="detail.previousVersion.title !== detail.homestay.title">
                    {{ detail.homestay.title }}
                  </span>
                  <span v-else>{{ detail.homestay.title }}</span>
                </div>
              </div>
              <div class="compare-item">
                <span class="compare-label">价格变更：</span>
                <div class="compare-diff">
                  <span class="diff-old" v-if="detail.previousVersion.price !== detail.homestay.price">
                    ¥{{ detail.previousVersion.price }}
                  </span>
                  <span class="diff-new" v-if="detail.previousVersion.price !== detail.homestay.price">
                    ¥{{ detail.homestay.price }}
                  </span>
                  <span v-else>¥{{ detail.homestay.price }}</span>
                </div>
              </div>
              <div class="compare-item">
                <span class="compare-label">描述变更：</span>
                <el-input
                  type="textarea"
                  :value="detail.homestay.description"
                  :rows="3"
                  readonly
                  class="compare-description"
                />
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-skeleton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Location, Warning, WarningFilled } from '@element-plus/icons-vue';
import type { HomestayAuditDetail } from '@/types';

const props = defineProps<{
  detail: HomestayAuditDetail;
  loading?: boolean;
}>();

// 价格是否异常（高于均价50%或低于30%）
const isPriceAbnormal = computed(() => {
  if (!props.detail.homestay.areaPrice) return false;
  const ratio = props.detail.homestay.price / props.detail.homestay.areaPrice;
  return ratio > 1.5 || ratio < 0.7;
});

// 价格偏离幅度
const priceDeviation = computed(() => {
  if (!props.detail.homestay.areaPrice) return 0;
  return Math.round((props.detail.homestay.price / props.detail.homestay.areaPrice - 1) * 100);
});

// 是否有违规
const hasViolations = computed(() => {
  return (
    (props.detail.violations?.sensitiveWords?.length || 0) > 0 ||
    (props.detail.violations?.abnormalImages?.length || 0) > 0 ||
    props.detail.violations?.priceAbnormal
  );
});

// 判断某张图片是否违规
function isViolationImage(index: number): boolean {
  return props.detail.violations?.abnormalImages?.some((img) => img.index === index) || false;
}

// 高亮敏感词
function highlightSensitiveWords(text: string, sensitiveWords: { word: string }[]): string {
  let result = text;
  sensitiveWords.forEach(({ word }) => {
    const regex = new RegExp(`(${word})`, 'gi');
    result = result.replace(regex, '<mark style="background-color: #fff2f0; color: #f5222d;">$1</mark>');
  });
  return result;
}
</script>

<style scoped lang="scss">
.homestay-audit-content {
  .info-card {
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    border: 1px solid #f0f0f0;
  }

  .section-title {
    font-size: 15px;
    font-weight: 600;
    color: #262626;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-subtitle {
    font-size: 14px;
    font-weight: 500;
    color: #595959;
    margin: 16px 0 8px;
  }

  .preview-card {
    padding: 0;

    .homestay-carousel {
      border-radius: 8px 8px 0 0;
      overflow: hidden;

      .carousel-image-wrapper {
        position: relative;
        width: 100%;
        height: 100%;

        .carousel-image {
          width: 100%;
          height: 200px;
        }

        .violation-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #f5222d;
          color: #fff;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }

    .homestay-basic {
      padding: 16px;

      .homestay-title {
        margin: 0 0 12px;
        font-size: 18px;
        font-weight: 600;
        color: #262626;
      }

      .homestay-meta {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .price {
          font-size: 20px;
          font-weight: 600;
          color: #262626;

          &.price-abnormal {
            color: #f5222d;
          }
        }

        .location {
          font-size: 13px;
          color: #8c8c8c;
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }
  }

  .homestay-descriptions {
    :deep(.el-descriptions__label) {
      background: #fafafa;
    }
  }

  .facilities {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .facility-tag {
      border-radius: 4px;
    }
  }

  .description-textarea {
    :deep(.el-textarea__inner) {
      resize: none;
    }
  }

  // 违规卡片
  .violation-card {
    border-color: #ffccc7;
    background: #fff2f0;
  }

  .violation-section {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .violation-label {
    font-size: 13px;
    font-weight: 500;
    color: #f5222d;
    margin-bottom: 8px;
  }

  .violation-content {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 8px;

    .violation-tag {
      background: #fff2f0;
      border-color: #ffccc7;
      color: #f5222d;
    }
  }

  .violation-highlight {
    background: #fff;
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 13px;

    .highlight-label {
      color: #8c8c8c;
    }
  }

  .violation-images {
    display: flex;
    gap: 8px;

    .violation-image-item {
      position: relative;
      width: 80px;
      height: 80px;

      .violation-thumbnail {
        width: 100%;
        height: 100%;
        border-radius: 4px;
      }

      .violation-reason {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(245, 34, 45, 0.9);
        color: #fff;
        font-size: 10px;
        padding: 2px 4px;
        text-align: center;
      }
    }
  }

  .price-compare {
    background: #fff;
    border-radius: 4px;
    padding: 12px;

    .price-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      &.highlight {
        padding-top: 8px;
        border-top: 1px dashed #f0f0f0;
      }

      .price-label {
        color: #8c8c8c;
        font-size: 13px;
      }

      .price-value {
        color: #262626;
        font-weight: 500;

        &.danger {
          color: #f5222d;
          font-weight: 600;
        }
      }
    }
  }

  // 对比查看
  .compare-section {
    .compare-item {
      margin-bottom: 12px;

      .compare-label {
        display: block;
        font-size: 13px;
        color: #8c8c8c;
        margin-bottom: 4px;
      }

      .compare-diff {
        .diff-old {
          text-decoration: line-through;
          color: #f5222d;
          background: #fff2f0;
          padding: 2px 4px;
          border-radius: 2px;
          margin-right: 8px;
        }

        .diff-new {
          background: #f6ffed;
          color: #52c41a;
          padding: 2px 4px;
          border-radius: 2px;
        }
      }

      .compare-description {
        :deep(.el-textarea__inner) {
          background: #fafafa;
        }
      }
    }
  }

  :deep(.el-collapse) {
    border: none;

    .el-collapse-item__header {
      border: none;
      background: transparent;
      font-weight: 500;
      color: #1890ff;
    }

    .el-collapse-item__wrap {
      border-top: none;
    }

    .el-collapse-item__content {
      padding-bottom: 0;
    }
  }
}
</style>
