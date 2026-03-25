<template>
  <div class="properties-page">
    <!-- ====== 顶部操作栏 ====== -->
    <div class="page-toolbar">
      <div class="toolbar-left">
        <!-- 搜索框 -->
        <el-input
          v-model="searchKeyword"
          placeholder="搜索房源标题或地址..."
          clearable
          class="search-input"
          @input="handleFilter"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>

        <!-- 城市筛选 -->
        <el-select v-model="filterCity" placeholder="城市" clearable @change="handleFilter" style="width: 130px">
          <el-option v-for="c in cityOptions" :key="c.value" :label="c.label" :value="c.value" />
        </el-select>

        <!-- 排序 -->
        <el-select v-model="sortBy" placeholder="排序" style="width: 130px" @change="handleFilter">
          <el-option label="按价格从高到低" value="price_desc" />
          <el-option label="按价格从低到高" value="price_asc" />
          <el-option label="按评分从高到低" value="rating_desc" />
          <el-option label="按最新上架" value="created_desc" />
        </el-select>
      </div>

      <div class="toolbar-right">
        <el-button type="primary" @click="openPublishDrawer(null)">
          <el-icon><Plus /></el-icon>
          发布房源
        </el-button>
      </div>
    </div>

    <!-- ====== 状态标签筛选 ====== -->
    <div class="status-tabs">
      <span
        v-for="tab in statusTabs"
        :key="tab.value"
        class="status-tab"
        :class="{ active: activeStatusTab === tab.value }"
        @click="activeStatusTab = tab.value; handleFilter()"
      >
        {{ tab.label }}
        <span class="tab-count">{{ getTabCount(tab.value) }}</span>
      </span>
    </div>

    <!-- ====== 房源卡片网格 ====== -->
    <div v-loading="loading" element-loading-text="加载中..." class="card-grid-wrapper">
      <!-- 空状态 -->
      <div v-if="!loading && filteredList.length === 0" class="empty-state">
        <el-empty description="暂无房源" :image-size="120">
          <el-button type="primary" @click="openPublishDrawer(null)">立即发布房源</el-button>
        </el-empty>
      </div>

      <!-- 骨架屏 -->
      <div v-else-if="loading" class="card-grid">
        <el-skeleton v-for="i in 8" :key="i" animated class="card-skeleton">
          <template #template>
            <el-skeleton-item variant="image" class="skeleton-img" />
            <div class="skeleton-body">
              <el-skeleton-item variant="text" style="width: 80%; height: 18px;" />
              <el-skeleton-item variant="text" style="width: 60%; height: 14px; margin-top: 8px;" />
              <el-skeleton-item variant="text" style="width: 70%; height: 14px; margin-top: 6px;" />
              <div class="skeleton-tags">
                <el-skeleton-item variant="text" style="width: 48px; height: 22px; border-radius: 11px;" />
                <el-skeleton-item variant="text" style="width: 48px; height: 22px; border-radius: 11px;" />
              </div>
              <el-skeleton-item variant="text" style="width: 50%; height: 20px; margin-top: 8px;" />
            </div>
          </template>
        </el-skeleton>
      </div>

      <!-- 卡片网格 -->
      <div v-else class="card-grid">
        <div
          v-for="item in filteredList"
          :key="item.homestayId"
          class="homestay-card"
          @mouseenter="hoveredId = item.homestayId"
          @mouseleave="hoveredId = null"
        >
          <!-- ====== 图片区 ====== -->
          <div class="card-image">
            <!-- 轮播 -->
            <div
              class="carousel-container"
              @mouseenter="activeCarousel = item.homestayId"
              @mouseleave="activeCarousel = null"
            >
              <el-carousel
                trigger="hover"
                :autoplay="false"
                arrow="never"
                indicator-position="none"
                height="200px"
                @change="(idx) => carouselIndex[item.homestayId] = idx"
              >
                <el-carousel-item v-for="(img, idx) in (item.images && item.images.length > 0 ? item.images : ['https://picsum.photos/seed/default/800/600'])" :key="idx">
                  <el-image
                    :src="img"
                    fit="cover"
                    class="card-img"
                    lazy
                    :initial-index="idx"
                    :preview-src-list="item.images"
                    preview-teleported
                  />
                </el-carousel-item>
              </el-carousel>

              <!-- 左右切换箭头（hover 显示） -->
              <template v-if="item.images && item.images.length > 1">
                <div v-show="activeCarousel === item.homestayId" class="carousel-arrow left" @click="prevImg(item)">
                  <el-icon><ArrowLeft /></el-icon>
                </div>
                <div v-show="activeCarousel === item.homestayId" class="carousel-arrow right" @click="nextImg(item)">
                  <el-icon><ArrowRight /></el-icon>
                </div>
                <!-- 指示器 -->
                <div class="carousel-dots">
                  <span
                    v-for="(_, idx) in item.images"
                    :key="idx"
                    class="dot"
                    :class="{ active: (carouselIndex[item.homestayId] || 0) === idx }"
                  />
                </div>
              </template>

              <!-- 状态标签 -->
              <div class="status-badge" :class="getStatusClass(item)">
                {{ getStatusText(item) }}
              </div>

              <!-- 悬浮操作按钮 -->
              <div v-show="hoveredId === item.homestayId" class="card-hover-actions">
                <el-button size="small" type="primary" plain @click.stop="openPublishDrawer(item)">
                  <el-icon><Edit /></el-icon> 编辑
                </el-button>
                <el-dropdown trigger="click" @command="(cmd) => handleCardCommand(cmd, item)">
                  <el-button size="small" plain @click.stop>
                    <el-icon><MoreFilled /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="copy">复制链接</el-dropdown-item>
                      <el-dropdown-item command="delete" divided style="color: #ff4d4f">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>

              <!-- 标题遮罩 -->
              <div class="title-overlay">{{ item.title }}</div>
            </div>
          </div>

          <!-- ====== 信息区 ====== -->
          <div class="card-info">
            <!-- 位置 + 评分 -->
            <div class="info-row row1">
              <span class="location">
                <el-icon color="#8c8c8c"><LocationInformation /></el-icon>
                {{ getCityName(item.cityCode) }}
              </span>
              <span class="rating">
                <el-icon color="#FF9645"><StarFilled /></el-icon>
                {{ item.rating.toFixed(1) }}
                <span class="review-count">({{ item.reviewCount }})</span>
              </span>
            </div>

            <!-- 房型 + 面积 + 床型 -->
            <div class="info-row row2">
              <span class="tag-pill">
                <el-icon color="#1890ff"><House /></el-icon> 整套{{ item.roomCount }}室
              </span>
              <span class="info-item">{{ item.area }}㎡</span>
              <span class="info-item">可住{{ item.maxGuests }}人</span>
            </div>

            <!-- 设施图标 -->
            <div class="info-row row3">
              <el-tooltip
                v-for="(fac, idx) in (item.facilities || []).slice(0, 4)"
                :key="idx"
                :content="fac"
                placement="top"
              >
                <span class="facility-tag">{{ getFacilityIcon(fac) }}</span>
              </el-tooltip>
              <span v-if="(item.facilities || []).length > 4" class="facility-more">+{{ item.facilities.length - 4 }}</span>
            </div>

            <!-- 价格 -->
            <div class="info-row row4">
              <span class="price-main">
                <span class="yen">¥</span>{{ item.price }}
                <span class="per-night">/晚</span>
              </span>
            </div>
          </div>

          <!-- ====== 操作区 ====== -->
          <div class="card-actions">
            <div class="status-toggle">
              <span class="toggle-label">{{ item.status === 1 ? '上架中' : '已下架' }}</span>
              <el-switch
                v-model="item.status"
                :active-value="1"
                :inactive-value="0"
                size="small"
                active-color="#52c41a"
                @change="handleToggleStatus(item)"
              />
            </div>
            <div class="action-btns">
              <el-button link type="primary" size="small" @click="openPublishDrawer(item)">编辑</el-button>
              <el-button link type="primary" size="small" @click="openStats(item)">数据</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ====== 发布/编辑房源全屏抽屉 ====== -->
    <el-drawer
      v-model="publishDrawerVisible"
      :title="null"
      :size="'90%'"
      :destroy-on-close="true"
      class="publish-drawer"
    >
      <template #header>
        <div class="drawer-header">
          <div class="drawer-title">
            <el-icon size="20"><OfficeBuilding /></el-icon>
            <span>{{ editingHomestay ? '编辑房源' : '发布房源' }}</span>
            <el-tag v-if="editingHomestay && editingHomestay.auditStatus === 0" type="warning" size="small" style="margin-left: 8px">审核中</el-tag>
          </div>
          <div class="drawer-header-actions">
            <el-button @click="handleSaveDraft">保存草稿</el-button>
            <el-button type="primary" plain @click="publishDrawerVisible = false">关闭</el-button>
          </div>
        </div>
      </template>

      <div class="drawer-body">
        <!-- 步骤条 -->
        <div class="step-indicator">
          <div
            v-for="(step, idx) in publishSteps"
            :key="idx"
            class="step-item"
            :class="{
              active: publishStep === idx,
              done: publishStep > idx
            }"
            @click="publishStep = idx"
          >
            <div class="step-num">
              <el-icon v-if="publishStep > idx"><Check /></el-icon>
              <span v-else>{{ idx + 1 }}</span>
            </div>
            <div class="step-label">{{ step.label }}</div>
          </div>
          <div class="step-line">
            <div class="step-line-fill" :style="{ width: `${(publishStep / (publishSteps.length - 1)) * 100}%` }" />
          </div>
        </div>

        <!-- ====== Step 1: 基础信息 ====== -->
        <div v-show="publishStep === 0" class="step-content">
          <div class="step-section-title">
            <el-icon color="#1890ff"><InfoFilled /></el-icon>
            基础信息
          </div>

          <!-- 地图选址占位 -->
          <div class="map-placeholder">
            <el-icon size="48" color="#bfbfbf"><MapLocation /></el-icon>
            <p>地图选址区域</p>
            <p class="tip">TODO: 集成高德地图 API</p>
            <div class="map-search">
              <el-input v-model="publishForm.address" placeholder="输入地址搜索，或在地图上点击标记" size="large">
                <template #prefix><el-icon><Search /></el-icon></template>
              </el-input>
            </div>
          </div>

          <el-form :model="publishForm" :rules="publishRules" label-width="100px" class="publish-form">
            <el-form-item label="房源标题" prop="title">
              <el-input
                v-model="publishForm.title"
                placeholder="例：成都太古里·云端全景落地窗江景房"
                maxlength="30"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="房源类型" prop="roomType">
              <div class="room-type-cards">
                <div
                  v-for="rt in roomTypes"
                  :key="rt.value"
                  class="room-type-card"
                  :class="{ selected: publishForm.roomType === rt.value }"
                  @click="publishForm.roomType = rt.value"
                >
                  <el-icon size="28" :color="publishForm.roomType === rt.value ? '#1890ff' : '#8c8c8c'">
                    <component :is="rt.icon" />
                  </el-icon>
                  <span>{{ rt.label }}</span>
                </div>
              </div>
            </el-form-item>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="房间数" prop="roomCount">
                  <el-input-number v-model="publishForm.roomCount" :min="1" :max="20" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="客厅数" prop="livingRoomCount">
                  <el-input-number v-model="publishForm.livingRoomCount" :min="0" :max="5" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="卫生间数" prop="bathroomCount">
                  <el-input-number v-model="publishForm.bathroomCount" :min="1" :max="10" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="面积 (㎡)" prop="area">
                  <el-input-number v-model="publishForm.area" :min="1" :max="2000" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="可住人数" prop="maxGuests">
                  <el-input-number v-model="publishForm.maxGuests" :min="1" :max="20" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="详细地址" prop="address">
              <el-input v-model="publishForm.address" placeholder="省/市/区/街道/门牌号" />
            </el-form-item>
          </el-form>
        </div>

        <!-- ====== Step 2: 设施与服务 ====== -->
        <div v-show="publishStep === 1" class="step-content">
          <div class="step-section-title">
            <el-icon color="#52c41a"><Setting /></el-icon>
            设施选择
          </div>

          <div class="facility-groups">
            <div v-for="group in facilityGroups" :key="group.name" class="facility-group">
              <div class="group-label">
                <el-icon :color="group.color"><component :is="group.icon" /></el-icon>
                {{ group.name }}
              </div>
              <div class="facility-tags">
                <span
                  v-for="item in group.items"
                  :key="item"
                  class="facility-tag-item"
                  :class="{ selected: publishForm.facilities.includes(item) }"
                  @click="toggleFacility(item)"
                >
                  {{ item }}
                </span>
              </div>
            </div>
          </div>

          <div class="step-section-title" style="margin-top: 28px">
            <el-icon color="#faad14"><Collection /></el-icon>
            特色标签
          </div>

          <div class="special-tags">
            <span
              v-for="tag in specialTags"
              :key="tag"
              class="special-tag-item"
              :class="{ selected: publishForm.specialTags.includes(tag) }"
              @click="toggleSpecialTag(tag)"
            >
              {{ tag }}
            </span>
            <el-input
              v-model="customTagInput"
              placeholder="添加自定义标签"
              size="small"
              style="width: 140px"
              @keydown.enter="addCustomTag"
            >
              <template #append>
                <el-button @click="addCustomTag">添加</el-button>
              </template>
            </el-input>
          </div>

          <div class="step-section-title" style="margin-top: 28px">
            <el-icon color="#722ed1"><Document /></el-icon>
            房源描述
          </div>

          <div class="desc-toolbar">
            <el-button size="small" @click="insertTemplate('交通指南')">交通指南</el-button>
            <el-button size="small" @click="insertTemplate('周边推荐')">周边推荐</el-button>
            <el-button size="small" @click="insertTemplate('入住须知')">入住须知</el-button>
          </div>
          <el-input
            v-model="publishForm.description"
            type="textarea"
            :rows="5"
            placeholder="描述您的房源特色、周边环境、配套设施等，让房客更了解您的房源..."
            maxlength="2000"
            show-word-limit
          />
        </div>

        <!-- ====== Step 3: 价格与房态 ====== -->
        <div v-show="publishStep === 2" class="step-content">
          <div class="step-section-title">
            <el-icon color="#faad14"><Money /></el-icon>
            价格设置
          </div>

          <div class="price-cards">
            <div class="price-card">
              <div class="price-card-label">基础价格 <span class="tip">(元/晚)</span></div>
              <div class="price-input-row">
                <el-input-number v-model="publishForm.price" :min="1" :max="99999" size="large" />
              </div>
              <div class="price-hint">
                <el-icon color="#faad14"><Warning /></el-icon>
                根据区域和市场情况，建议价格区间 ¥300-800
              </div>
            </div>

            <div class="price-card">
              <div class="price-card-label">周末价格 <span class="tip">(周五/周六)</span></div>
              <div class="price-input-row">
                <el-input-number v-model="publishForm.weekendPrice" :min="1" :max="99999" size="large" />
              </div>
            </div>

            <div class="price-card">
              <div class="price-card-label">押金 <span class="tip">(退房无损坏后退还)</span></div>
              <div class="price-input-row">
                <el-input-number v-model="publishForm.deposit" :min="0" :max="9999" size="large" />
                <span class="unit-label">元</span>
              </div>
            </div>
          </div>

          <!-- 价格模板 -->
          <div class="step-section-title" style="margin-top: 24px">
            <el-icon color="#1890ff"><Ticket /></el-icon>
            长住优惠
          </div>
          <div class="discount-rules">
            <div class="discount-rule">
              <el-switch v-model="publishForm.discountRules.weekly.enabled" active-color="#52c41a" />
              <span>入住满 7 天，享受 <el-input-number v-model="publishForm.discountRules.weekly.discount" :min="0" :max="100" size="small" style="width: 70px; margin: 0 4px" />% 折扣</span>
            </div>
            <div class="discount-rule">
              <el-switch v-model="publishForm.discountRules.monthly.enabled" active-color="#52c41a" />
              <span>入住满 30 天，享受 <el-input-number v-model="publishForm.discountRules.monthly.discount" :min="0" :max="100" size="small" style="width: 70px; margin: 0 4px" />% 折扣</span>
            </div>
          </div>

          <div class="step-section-title" style="margin-top: 24px">
            <el-icon color="#1890ff"><Calendar /></el-icon>
            退订政策
          </div>
          <div class="cancel-policies">
            <div
              v-for="policy in cancelPolicies"
              :key="policy.value"
              class="policy-card"
              :class="{ selected: publishForm.cancellationPolicy === policy.value }"
              @click="publishForm.cancellationPolicy = policy.value"
            >
              <div class="policy-name">{{ policy.label }}</div>
              <div class="policy-desc">{{ policy.desc }}</div>
            </div>
          </div>
        </div>

        <!-- ====== Step 4: 图片与视频 ====== -->
        <div v-show="publishStep === 3" class="step-content">
          <div class="step-section-title">
            <el-icon color="#1890ff"><Picture /></el-icon>
            图片上传
          </div>

          <div class="image-req">
            <el-alert type="info" :closable="false" show-icon>
              <template #title>
                图片要求：至少上传 5 张，建议尺寸 1200×800，首图将作为封面图。
                已上传 <strong>{{ publishForm.images.length }}</strong> 张，还需 <strong>{{ Math.max(0, 5 - publishForm.images.length) }}</strong> 张。
              </template>
            </el-alert>
          </div>

          <ImageUploader v-model="publishForm.images" :max="20" />

          <div class="step-section-title" style="margin-top: 28px">
            <el-icon color="#722ed1"><VideoCamera /></el-icon>
            视频上传 <span class="optional-tag">可选</span>
          </div>
          <div class="video-upload-zone">
            <el-icon size="32" color="#bfbfbf"><VideoCamera /></el-icon>
            <p>上传15秒房源视频（可选）</p>
            <p class="tip">支持 MP4/AVI，最大 50MB</p>
          </div>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="drawer-footer">
        <el-button v-if="publishStep > 0" @click="publishStep--">
          <el-icon><ArrowLeft /></el-icon> 上一步
        </el-button>
        <el-button v-if="publishStep < publishSteps.length - 1" type="primary" @click="handleNextStep">
          下一步 <el-icon><ArrowRight /></el-icon>
        </el-button>
        <el-button v-if="publishStep === publishSteps.length - 1" type="success" :loading="publishing" @click="handleSubmit">
          {{ editingHomestay ? '保存修改' : '提交审核' }}
        </el-button>
      </div>
    </el-drawer>

    <!-- ====== 房源数据统计弹窗 ====== -->
    <el-dialog v-model="statsVisible" title="房源数据" width="600px">
      <div v-if="statsItem" class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #e6f7ff;">
            <el-icon color="#1890ff" size="20"><View /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statsItem.reviewCount * 12 }}</div>
            <div class="stat-label">本月浏览</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #f6ffed;">
            <el-icon color="#52c41a" size="20"><Tickets /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">18</div>
            <div class="stat-label">本月订单</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #fff7e6;">
            <el-icon color="#faad14" size="20"><Money /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">¥{{ (statsItem.price * 18 * 3.5).toLocaleString() }}</div>
            <div class="stat-label">本月收入</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #fff1f0;">
            <el-icon color="#ff4d4f" size="20"><StarFilled /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statsItem.rating.toFixed(1) }}</div>
            <div class="stat-label">综合评分</div>
          </div>
        </div>
      </div>
      <div v-else>
        <el-empty description="暂无数据" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Plus, Edit, MoreFilled, ArrowLeft, ArrowRight,
  Check, OfficeBuilding, InfoFilled, MapLocation, LocationInformation,
  StarFilled, House, Setting, Collection, Document, Money, Ticket,
  Picture, VideoCamera, Warning, View, Tickets
} from '@element-plus/icons-vue'
import { homestays as mockHomestays } from '@/mock/data'
import type { Homestay } from '@/types'
import ImageUploader from '@/components/host/ImageUploader.vue'

const router = useRouter()

// ==================== 列表数据 ====================
const loading = ref(false)
const list = ref<Homestay[]>([])
const hoveredId = ref<number | null>(null)
const activeCarousel = ref<number | null>(null)
const carouselIndex = reactive<Record<number, number>>({})

// 筛选
const searchKeyword = ref('')
const filterCity = ref('')
const sortBy = ref('created_desc')
const activeStatusTab = ref('all')

const statusTabs = [
  { label: '全部', value: 'all' },
  { label: '已上架', value: 'online' },
  { label: '已下架', value: 'offline' },
  { label: '审核中', value: 'pending' },
]

const cityOptions = [
  { label: '成都', value: 'chengdu' },
  { label: '大理', value: 'dali' },
  { label: '杭州', value: 'hangzhou' },
  { label: '厦门', value: 'xiamen' },
  { label: '西安', value: 'xian' },
]

const filteredList = computed(() => {
  let result = [...list.value]
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    result = result.filter(h =>
      h.title.toLowerCase().includes(kw) || h.address.toLowerCase().includes(kw)
    )
  }
  if (filterCity.value) result = result.filter(h => h.cityCode === filterCity.value)
  if (activeStatusTab.value === 'online') result = result.filter(h => h.status === 1)
  else if (activeStatusTab.value === 'offline') result = result.filter(h => h.status === 0)
  else if (activeStatusTab.value === 'pending') result = result.filter(h => h.auditStatus === 0)

  if (sortBy.value === 'price_desc') result.sort((a, b) => b.price - a.price)
  else if (sortBy.value === 'price_asc') result.sort((a, b) => a.price - b.price)
  else if (sortBy.value === 'rating_desc') result.sort((a, b) => b.rating - a.rating)
  else if (sortBy.value === 'created_desc') result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return result
})

function getTabCount(tab: string) {
  if (tab === 'all') return list.value.length
  if (tab === 'online') return list.value.filter(h => h.status === 1).length
  if (tab === 'offline') return list.value.filter(h => h.status === 0).length
  if (tab === 'pending') return list.value.filter(h => h.auditStatus === 0).length
  return 0
}

function handleFilter() { /* computed 自动响应 */ }

function getCityName(cityCode: string) {
  return cityOptions.find(c => c.value === cityCode)?.label || cityCode
}

function getStatusClass(item: Homestay) {
  if (item.auditStatus === 0) return 'status-pending'
  if (item.auditStatus === 2) return 'status-rejected'
  return item.status === 1 ? 'status-online' : 'status-offline'
}

function getStatusText(item: Homestay) {
  if (item.auditStatus === 0) return '审核中'
  if (item.auditStatus === 2) return '审核未通过'
  return item.status === 1 ? '已上架' : '已下架'
}

function getFacilityIcon(fac: string) {
  const map: Record<string, string> = {
    '免费wifi': '📶', '空调': '❄️', '洗衣机': '🧺', '厨房': '🍳',
    '停车场': '🅿️', '电视': '📺', '游泳池': '🏊', '健身房': '💪',
  }
  return map[fac] || '✓'
}

function prevImg(item: Homestay) {
  const len = (item.images || []).length
  if (len <= 1) return
  carouselIndex[item.homestayId] = (carouselIndex[item.homestayId] || 0) - 1 + len
  carouselIndex[item.homestayId] %= len
}
function nextImg(item: Homestay) {
  const len = (item.images || []).length
  if (len <= 1) return
  carouselIndex[item.homestayId] = ((carouselIndex[item.homestayId] || 0) + 1) % len
}

function handleCardCommand(cmd: string, item: Homestay) {
  if (cmd === 'copy') {
    navigator.clipboard.writeText(`${window.location.origin}/homestay/${item.homestayId}`)
    ElMessage.success('链接已复制')
  } else if (cmd === 'delete') {
    ElMessageBox.confirm('确定要删除该房源吗？删除后不可恢复。', '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }).then(() => {
      list.value = list.value.filter(h => h.homestayId !== item.homestayId)
      ElMessage.success('房源已删除')
    }).catch(() => {})
  }
}

async function handleToggleStatus(item: Homestay) {
  const newStatus = item.status === 1 ? '上架' : '下架'
  if (item.status === 0) {
    // 下架无需确认
    ElMessage.success(`房源已${newStatus}`)
    return
  }
  try {
    await ElMessageBox.confirm('下架后房源将不在平台展示，确定下架吗？', '确认下架', {
      confirmButtonText: '确定下架',
      cancelButtonText: '取消',
      type: 'warning'
    })
    ElMessage.success(`房源已${newStatus}`)
  } catch {
    item.status = 1
  }
}

// 统计数据
const statsVisible = ref(false)
const statsItem = ref<Homestay | null>(null)
function openStats(item: Homestay) {
  statsItem.value = item
  statsVisible.value = true
}

// ==================== 发布/编辑抽屉 ====================
const publishDrawerVisible = ref(false)
const publishStep = ref(0)
const publishing = ref(false)
const editingHomestay = ref<Homestay | null>(null)

const publishSteps = [
  { label: '基础信息' },
  { label: '设施与服务' },
  { label: '价格与房态' },
  { label: '图片视频' },
]

const defaultPublishForm = () => ({
  title: '',
  address: '',
  roomType: 'entire',
  roomCount: 1,
  livingRoomCount: 1,
  bathroomCount: 1,
  area: 50,
  maxGuests: 2,
  facilities: [] as string[],
  specialTags: [] as string[],
  description: '',
  price: 300,
  weekendPrice: 400,
  deposit: 200,
  cancellationPolicy: 'flexible',
  images: [] as string[],
  discountRules: {
    weekly: { enabled: false, discount: 10 },
    monthly: { enabled: false, discount: 20 }
  }
})

const publishForm = reactive<ReturnType<typeof defaultPublishForm>>(defaultPublishForm())

const publishRules = {
  title: [{ required: true, message: '请输入房源标题', trigger: 'blur' }],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
  roomType: [{ required: true, message: '请选择房源类型', trigger: 'change' }],
}

const roomTypes = [
  { label: '整套房源', value: 'entire', icon: 'House' },
  { label: '独立房间', value: 'private', icon: 'User' },
  { label: '合住房间', value: 'shared', icon: 'Users' },
]

const facilityGroups = [
  { name: '基础设施', icon: 'Cpu', color: '#1890ff', items: ['免费wifi', '空调', '洗衣机', '电视', '热水器', '暖气'] },
  { name: '卫浴设施', icon: 'CoffeeCup', color: '#13c2c2', items: ['独立卫浴', '拖鞋', '吹风机', '洗漱用品'] },
  { name: '厨房', icon: 'Utensils', color: '#faad14', items: ['厨房', '冰箱', '微波炉', '电饭煲', '锅具餐具'] },
  { name: '娱乐', icon: 'Film', color: '#722ed1', items: ['投影仪', '音响', '智能音箱', '棋牌'] },
  { name: '安全设施', icon: 'Lock', color: '#52c41a', items: ['智能门锁', '监控', '烟雾报警器', '灭火器'] },
]

const specialTags = ['近地铁', '落地窗', '江景', '投影', '智能门锁', '花园', '庭院', '亲子友好', '宠物友好', '免费停车']

const customTagInput = ref('')

function toggleFacility(item: string) {
  const idx = publishForm.facilities.indexOf(item)
  if (idx >= 0) publishForm.facilities.splice(idx, 1)
  else publishForm.facilities.push(item)
}

function toggleSpecialTag(tag: string) {
  const idx = publishForm.specialTags.indexOf(tag)
  if (idx >= 0) publishForm.specialTags.splice(idx, 1)
  else publishForm.specialTags.push(tag)
}

function addCustomTag() {
  const v = customTagInput.value.trim()
  if (v && !publishForm.specialTags.includes(v)) {
    publishForm.specialTags.push(v)
    customTagInput.value = ''
  }
}

function insertTemplate(type: string) {
  const templates: Record<string, string> = {
    '交通指南': '【交通指南】\n周边地铁站：XX号线 XX站（步行800米）\n公交线路：XX路、XX路\n自驾：附近有公共停车场',
    '周边推荐': '【周边推荐】\n🏪 超市/便利店：XX便利店（步行200米）\n🍜 餐饮：XX火锅（步行500米）\n🏥 医院：XX医院（1公里）',
    '入住须知': '【入住须知】\n1. 入住时间：14:00 之后\n2. 退房时间：12:00 之前\n3. 入住人数不超过约定人数\n4. 请保持安静，尊重邻居\n5. 禁止吸烟、携带宠物',
  }
  if (templates[type]) {
    publishForm.description = publishForm.description
      ? publishForm.description + '\n\n' + templates[type]
      : templates[type]
  }
}

const cancelPolicies = [
  { label: '宽松退订', value: 'flexible', desc: '入住前1天可免费退订' },
  { label: '适中退订', value: 'moderate', desc: '入住前5天可免费退订' },
  { label: '严格退订', value: 'strict', desc: '入住前7天可免费退订' },
]

function openPublishDrawer(item: Homestay | null) {
  editingHomestay.value = item
  publishStep.value = 0

  if (item) {
    // 填充编辑数据
    Object.assign(publishForm, {
      title: item.title,
      address: item.address,
      roomType: 'entire',
      roomCount: item.roomCount,
      livingRoomCount: 1,
      bathroomCount: 1,
      area: item.area,
      maxGuests: item.maxGuests,
      facilities: [...item.facilities],
      specialTags: [],
      description: item.description,
      price: item.price,
      weekendPrice: Math.round(item.price * 1.2),
      deposit: 200,
      cancellationPolicy: 'flexible',
      images: [...item.images],
      discountRules: { weekly: { enabled: false, discount: 10 }, monthly: { enabled: false, discount: 20 } }
    })
  } else {
    // 新建
    Object.assign(publishForm, defaultPublishForm())
  }

  publishDrawerVisible.value = true
}

function handleDrawerBeforeClose(done: () => void) {
  ElMessageBox.confirm('确定关闭吗？未保存的内容将丢失。', '提示', {
    confirmButtonText: '确定关闭',
    cancelButtonText: '继续编辑',
    type: 'warning'
  }).then(() => done()).catch(() => {})
}

function handleNextStep() {
  if (publishStep.value === 0) {
    if (!publishForm.title) {
      ElMessage.warning('请填写房源标题')
      return
    }
    if (!publishForm.address) {
      ElMessage.warning('请填写详细地址')
      return
    }
  }
  if (publishStep.value === 3 && publishForm.images.length < 5) {
    ElMessage.warning('至少需要上传 5 张图片')
    return
  }
  publishStep.value++
}

function handleSaveDraft() {
  ElMessage.success('草稿已保存')
}

async function handleSubmit() {
  publishing.value = true
  await new Promise(resolve => setTimeout(resolve, 1200))
  publishing.value = false

  if (editingHomestay.value) {
    // 更新
    Object.assign(editingHomestay.value, {
      title: publishForm.title,
      address: publishForm.address,
      area: publishForm.area,
      roomCount: publishForm.roomCount,
      maxGuests: publishForm.maxGuests,
      facilities: [...publishForm.facilities],
      images: [...publishForm.images],
      price: publishForm.price,
      description: publishForm.description,
    })
    ElMessage.success('房源已保存')
  } else {
    // 新增
    const newItem: Homestay = {
      homestayId: Date.now(),
      landlordId: 2,
      title: publishForm.title,
      description: publishForm.description,
      address: publishForm.address,
      cityCode: filterCity.value || 'chengdu',
      location: { lat: 30.65, lng: 104.06 },
      price: publishForm.price,
      area: publishForm.area,
      roomCount: publishForm.roomCount,
      maxGuests: publishForm.maxGuests,
      facilities: [...publishForm.facilities],
      images: [...publishForm.images],
      rating: 5.0,
      reviewCount: 0,
      auditStatus: 0,
      status: 0,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }
    list.value.unshift(newItem)
    ElMessage.success('房源已提交审核')
  }

  publishDrawerVisible.value = false
}

// ==================== 生命周期 ====================
onMounted(() => {
  loading.value = true
  setTimeout(() => {
    list.value = mockHomestays.filter(h => h.landlordId === 2)
    loading.value = false
  }, 600)
})
</script>

<style scoped lang="scss">
// ==================== 页面布局 ====================
.properties-page {
  min-height: 100%;
}

// ==================== 顶部工具栏 ====================
.page-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    flex: 1;

    .search-input {
      width: 280px;
    }
  }

  .toolbar-right :deep(.el-button) {
    background: linear-gradient(135deg, #1890ff, #36cfc9);
    border: none;
    height: 36px;
    padding: 0 20px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
  }
}

// ==================== 状态标签 ====================
.status-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  background: white;
  border-radius: 10px;
  padding: 6px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  width: fit-content;

  .status-tab {
    padding: 6px 16px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    color: #595959;
    display: flex;
    align-items: center;
    gap: 6px;

    .tab-count {
      background: #f0f0f0;
      color: #8c8c8c;
      font-size: 12px;
      padding: 0 6px;
      border-radius: 10px;
      min-width: 20px;
      text-align: center;
      line-height: 18px;
    }

    &:hover {
      background: #f7f7f7;
    }

    &.active {
      background: #e6f4ff;
      color: #1890ff;
      font-weight: 600;

      .tab-count {
        background: #1890ff;
        color: white;
      }
    }
  }
}

// ==================== 卡片网格 ====================
.card-grid-wrapper {
  min-height: 400px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  background: white;
  border-radius: 12px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

// 骨架屏
.card-skeleton {
  border-radius: 12px;
  overflow: hidden;
  background: white;

  .skeleton-img {
    width: 100%;
    height: 200px;
  }

  .skeleton-body {
    padding: 16px;
  }

  .skeleton-tags {
    display: flex;
    gap: 8px;
    margin-top: 10px;
  }
}

// ==================== 房源卡片 ====================
.homestay-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: #e6f0ff;
  }
}

// 图片区
.card-image {
  position: relative;
}

.carousel-container {
  position: relative;
  height: 200px;
  overflow: hidden;

  .el-carousel {
    height: 200px;
  }
}

.card-img {
  width: 100%;
  height: 200px;
  display: block;
  cursor: pointer;
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);

  &.left { left: 8px; }
  &.right { right: 8px; }

  &:hover {
    background: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.25);
  }
}

.carousel-dots {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  z-index: 2;

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255,255,255,0.5);
    transition: all 0.2s;

    &.active {
      width: 18px;
      border-radius: 3px;
      background: white;
    }
  }
}

.status-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  z-index: 3;
  backdrop-filter: blur(4px);

  &.status-online { background: rgba(82, 196, 26, 0.9); color: white; }
  &.status-offline { background: rgba(0, 0, 0, 0.45); color: white; }
  &.status-pending { background: rgba(250, 173, 20, 0.9); color: white; }
  &.status-rejected { background: rgba(255, 77, 79, 0.9); color: white; }
}

.card-hover-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 6px;
  z-index: 3;
  animation: fadeIn 0.2s ease;

  :deep(.el-button) {
    background: rgba(255, 255, 255, 0.92) !important;
    border: none !important;
    backdrop-filter: blur(4px);
    font-size: 12px;
    padding: 4px 10px;
    height: 28px;
    display: flex;
    align-items: center;
    gap: 3px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.12);
    &:hover { background: white !important; }
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.title-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 32px 12px 10px;
  background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%);
  color: white;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  z-index: 2;
}

// 信息区
.card-info {
  padding: 14px 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.row1 {
  justify-content: space-between;

  .location {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #595959;
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .rating {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 13px;
    color: #595959;
    font-weight: 600;
    flex-shrink: 0;

    .review-count {
      font-weight: 400;
      color: #8c8c8c;
      font-size: 12px;
    }
  }
}

.row2 {
  gap: 8px;

  .tag-pill {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    background: #e6f4ff;
    color: #1890ff;
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 500;
  }

  .info-item {
    font-size: 12px;
    color: #8c8c8c;
  }
}

.row3 {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;

  .facility-tag {
    font-size: 14px;
    cursor: default;
  }

  .facility-more {
    font-size: 12px;
    color: #8c8c8c;
    background: #f5f5f5;
    padding: 0 6px;
    border-radius: 4px;
    height: 18px;
    display: inline-flex;
    align-items: center;
  }
}

.row4 {
  margin-top: auto;

  .price-main {
    font-size: 20px;
    color: #1890ff;
    font-weight: 700;
    display: flex;
    align-items: baseline;
    gap: 2px;

    .yen { font-size: 14px; font-weight: 600; }
    .per-night { font-size: 12px; color: #8c8c8c; font-weight: 400; margin-left: 2px; }
  }
}

// 操作区
.card-actions {
  border-top: 1px solid #f0f0f0;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .status-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #595959;
  }

  .action-btns {
    display: flex;
    gap: 4px;
  }
}

// ==================== 发布抽屉 ====================
:deep(.publish-drawer) {
  .el-drawer__body {
    padding: 0;
    display: flex;
    flex-direction: column;
  }
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 4px;

  .drawer-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 17px;
    font-weight: 700;
    color: #1a1a1a;
  }

  .drawer-header-actions {
    display: flex;
    gap: 10px;
  }
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  background: #f7f8fa;
}

// 步骤条
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 32px;
  padding: 0 40px;

  .step-line {
    position: absolute;
    left: 50px;
    right: 50px;
    top: 16px;
    height: 2px;
    background: #e8e8e8;
    z-index: 0;

    .step-line-fill {
      height: 100%;
      background: linear-gradient(90deg, #1890ff, #36cfc9);
      transition: width 0.4s ease;
    }
  }

  .step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    position: relative;
    z-index: 1;
    cursor: pointer;
    flex: 1;

    .step-num {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: white;
      border: 2px solid #d9d9d9;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 600;
      color: #8c8c8c;
      transition: all 0.3s;
    }

    .step-label {
      font-size: 13px;
      color: #8c8c8c;
      transition: color 0.3s;
      white-space: nowrap;
    }

    &.active {
      .step-num {
        border-color: #1890ff;
        background: #1890ff;
        color: white;
        box-shadow: 0 0 0 4px rgba(24, 144, 255, 0.2);
      }
      .step-label { color: #1890ff; font-weight: 600; }
    }

    &.done {
      .step-num {
        border-color: #52c41a;
        background: #52c41a;
        color: white;
      }
      .step-label { color: #52c41a; }
    }
  }
}

.step-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  min-height: 500px;
}

.step-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 20px;

  .optional-tag {
    font-size: 12px;
    color: #8c8c8c;
    font-weight: 400;
    background: #f5f5f5;
    padding: 1px 8px;
    border-radius: 10px;
  }
}

// 发布表单
.publish-form {
  margin-top: 20px;

  :deep(.el-input-number) {
    width: 100%;
  }
}

// 地图占位
.map-placeholder {
  background: #f7f8fa;
  border: 2px dashed #d9d9d9;
  border-radius: 12px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #8c8c8c;
  font-size: 14px;
  margin-bottom: 20px;
  position: relative;

  .tip { font-size: 12px; color: #bfbfbf; }

  .map-search {
    width: 100%;
    max-width: 500px;
    margin-top: 12px;
  }
}

// 房源类型卡片
.room-type-cards {
  display: flex;
  gap: 12px;

  .room-type-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 20px 12px;
    border: 2px solid #f0f0f0;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 14px;
    color: #595959;

    &:hover { border-color: #1890ff; }
    &.selected {
      border-color: #1890ff;
      background: #f0f7ff;
      color: #1890ff;
      font-weight: 600;
    }
  }
}

// 设施分组
.facility-groups {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .facility-group {
    .group-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
      color: #262626;
      margin-bottom: 10px;
    }

    .facility-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .facility-tag-item {
        padding: 5px 14px;
        border-radius: 20px;
        border: 1px solid #d9d9d9;
        font-size: 13px;
        color: #595959;
        cursor: pointer;
        transition: all 0.2s;
        user-select: none;

        &:hover { border-color: #1890ff; color: #1890ff; }
        &.selected {
          background: #1890ff;
          border-color: #1890ff;
          color: white;
          font-weight: 500;
        }
      }
    }
  }
}

// 特色标签
.special-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;

  .special-tag-item {
    padding: 5px 14px;
    border-radius: 20px;
    border: 1px solid #d9d9d9;
    font-size: 13px;
    color: #595959;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;

    &:hover { border-color: #1890ff; color: #1890ff; }
    &.selected {
      background: #1890ff;
      border-color: #1890ff;
      color: white;
      font-weight: 500;
    }
  }
}

.desc-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

// 价格卡片
.price-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;

  .price-card {
    padding: 16px;
    border: 1px solid #f0f0f0;
    border-radius: 10px;
    background: #fafafa;

    .price-card-label {
      font-size: 13px;
      color: #595959;
      margin-bottom: 10px;

      .tip { color: #bfbfbf; font-size: 12px; margin-left: 4px; }
    }

    .price-input-row {
      display: flex;
      align-items: center;
      gap: 8px;

      .unit-label { font-size: 14px; color: #595959; }
    }

    .price-hint {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #8c8c8c;
      margin-top: 8px;
    }
  }
}

// 长住优惠
.discount-rules {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #fafafa;
  padding: 16px;
  border-radius: 10px;

  .discount-rule {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    color: #262626;
  }
}

// 退订政策
.cancel-policies {
  display: flex;
  gap: 12px;

  .policy-card {
    flex: 1;
    padding: 16px;
    border: 2px solid #f0f0f0;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;

    .policy-name {
      font-size: 14px;
      font-weight: 600;
      color: #262626;
      margin-bottom: 4px;
    }

    .policy-desc {
      font-size: 12px;
      color: #8c8c8c;
    }

    &:hover { border-color: #1890ff; }
    &.selected {
      border-color: #1890ff;
      background: #f0f7ff;
    }
  }
}

// 图片要求
.image-req {
  margin-bottom: 16px;

  :deep(.el-alert) {
    border-radius: 8px;
  }
}

// 视频上传区
.video-upload-zone {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
  color: #8c8c8c;
  font-size: 14px;

  &:hover {
    border-color: #1890ff;
    background: #f0f7ff;
  }

  .tip { font-size: 12px; color: #bfbfbf; }
}

// 抽屉底部
.drawer-footer {
  padding: 16px 32px;
  border-top: 1px solid #f0f0f0;
  background: white;
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  :deep(.el-button--primary) {
    background: linear-gradient(135deg, #1890ff, #36cfc9) !important;
    border: none !important;
  }

  :deep(.el-button--success) {
    background: linear-gradient(135deg, #52c41a, #389e0d) !important;
    border: none !important;
  }
}

// ==================== 统计弹窗 ====================
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  .stat-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border: 1px solid #f0f0f0;
    border-radius: 10px;

    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-info {
      .stat-value {
        font-size: 20px;
        font-weight: 700;
        color: #1a1a1a;
      }
      .stat-label {
        font-size: 12px;
        color: #8c8c8c;
        margin-top: 2px;
      }
    }
  }
}
</style>
