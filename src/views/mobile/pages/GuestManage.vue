<template>
  <div class="page-container">
    <van-nav-bar
      title="同行人管理"
      left-arrow
      fixed
      placeholder
      @click-left="router.back()"
    />

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="guest-list-container">
        <!-- 同行人列表 -->
        <div
          v-for="(guest, idx) in guests"
          :key="guest.id || idx"
          class="guest-card"
        >
          <div class="guest-card__info">
            <div class="guest-card__avatar">
              <van-icon name="user-o" size="24" color="#999" />
            </div>
            <div class="guest-card__details">
              <div class="guest-card__name">{{ guest.name }}</div>
              <div class="guest-card__meta">
                <span>身份证：{{ formatIdCard(guest.idCard) }}</span>
              </div>
              <div class="guest-card__meta">
                <span>手机：{{ formatPhone(guest.phone) }}</span>
              </div>
            </div>
          </div>
          <div class="guest-card__actions">
            <van-button size="small" round plain @click="editGuest(idx)">编辑</van-button>
            <van-button size="small" round plain type="danger" @click="deleteGuest(idx)">删除</van-button>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && !guests.length" class="empty-state">
          <div class="empty-state__icon">👥</div>
          <div class="empty-state__text">暂无同行人信息</div>
          <div class="empty-state__sub">添加同行人信息，方便预订时快速填写</div>
        </div>

        <!-- 添加按钮 -->
        <div class="add-guest-section">
          <van-button
            block
            round
            type="primary"
            icon="plus"
            @click="showAddSheet = true"
          >
            添加同行人
          </van-button>
        </div>
      </div>
    </van-pull-refresh>

    <!-- 添加/编辑弹窗 -->
    <van-popup v-model:show="showAddSheet" position="bottom" round :style="{ height: 'auto' }">
      <div class="guest-form">
        <div class="guest-form__header">
          <span class="guest-form__title">{{ editingIndex !== null ? '编辑同行人' : '添加同行人' }}</span>
        </div>

        <van-form @submit="handleSubmit">
          <van-field
            v-model="form.name"
            label="姓名"
            placeholder="请输入真实姓名"
            :rules="[{ required: true, message: '请输入姓名' }]"
          />
          <van-field
            v-model="form.idCard"
            label="身份证号"
            placeholder="请输入身份证号码"
            maxlength="18"
            :rules="[
              { required: true, message: '请输入身份证号' },
              { pattern: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/, message: '身份证格式不正确' }
            ]"
          />
          <van-field
            v-model="form.phone"
            label="手机号"
            type="tel"
            placeholder="请输入手机号"
            maxlength="11"
            :rules="[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
            ]"
          />

          <div class="guest-form__buttons">
            <van-button round block @click="showAddSheet = false">取消</van-button>
            <van-button round block type="primary" native-type="submit">
              {{ editingIndex !== null ? '保存修改' : '确认添加' }}
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showConfirmDialog } from 'vant';
import type { MobileGuest } from '../types';
import { getGuestList, addGuest, updateGuest, deleteGuest as apiDeleteGuest } from '../api/mobileApi';
import { useGuestStore } from '../stores/guestStore';

const router = useRouter();
const guestStore = useGuestStore();

const guests = computed(() => guestStore.guests);
const loading = ref(false);
const refreshing = ref(false);
const showAddSheet = ref(false);
const editingIndex = ref<number | null>(null);

const form = ref<MobileGuest>({
  name: '',
  idCard: '',
  phone: '',
});

async function loadGuests() {
  loading.value = true;
  try {
    const res = await getGuestList();
    if (res.code === 200 && res.data) {
      guestStore.setGuests(res.data);
    } else {
      loadMockGuests();
    }
  } catch {
    loadMockGuests();
  }
  loading.value = false;
}

function loadMockGuests() {
  guestStore.setGuests([
    { id: 1, name: '张三', idCard: '510105199001011234', phone: '13800138001' },
    { id: 2, name: '李四', idCard: '510105199002022345', phone: '13900139002' },
  ]);
}

async function onRefresh() {
  await loadGuests();
  refreshing.value = false;
}

function editGuest(idx: number) {
  editingIndex.value = idx;
  const guest = guests.value[idx];
  form.value = { ...guest };
  showAddSheet.value = true;
}

async function deleteGuest(idx: number) {
  const guest = guests.value[idx];
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除同行人"${guest.name}"吗？`,
    });
    try {
      if (guest.id) {
        await apiDeleteGuest(guest.id);
      }
    } catch {
      // ignore API error in dev
    }
    guestStore.removeGuest(idx);
    showToast('删除成功');
  } catch {
    // cancelled
  }
}

async function handleSubmit() {
  if (editingIndex.value !== null) {
    // Edit
    try {
      if (guests.value[editingIndex.value].id) {
        await updateGuest(form.value);
      }
    } catch {
      // ignore
    }
    guestStore.updateGuest(editingIndex.value, { ...form.value });
    showToast('修改成功');
  } else {
    // Add
    try {
      const res = await addGuest(form.value);
      if (res.code === 200 && res.data) {
        guestStore.addGuest(res.data);
      } else {
        guestStore.addGuest({ ...form.value });
      }
    } catch {
      guestStore.addGuest({ ...form.value });
    }
    showToast('添加成功');
  }
  showAddSheet.value = false;
  editingIndex.value = null;
  form.value = { name: '', idCard: '', phone: '' };
}

function formatIdCard(idCard: string): string {
  if (!idCard || idCard.length < 18) return idCard;
  return `${idCard.slice(0, 6)}********${idCard.slice(14)}`;
}

function formatPhone(phone: string): string {
  if (!phone || phone.length < 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

onMounted(async () => {
  await loadGuests();
});
</script>

<style scoped>
.guest-list-container {
  padding: 12px 16px;
}

.guest-card {
  background: var(--van-white);
  border-radius: var(--van-radius-lg);
  padding: 16px;
  box-shadow: var(--van-shadow-sm);
  margin-bottom: 12px;
}

.guest-card__info {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.guest-card__avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--van-bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.guest-card__details {
  flex: 1;
  min-width: 0;
}

.guest-card__name {
  font-size: var(--van-font-size-md);
  font-weight: 700;
  color: var(--van-text-color);
  margin-bottom: 6px;
}

.guest-card__meta {
  font-size: var(--van-font-size-sm);
  color: var(--van-text-color-3);
  margin-bottom: 2px;
}

.guest-card__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #F0F0F0;
}

.empty-state__sub {
  font-size: var(--van-font-size-sm);
  color: var(--van-text-color-3);
  margin-top: 4px;
}

.add-guest-section {
  padding: 16px 0 24px;
}

/* 添加/编辑表单 */
.guest-form {
  padding: 16px;
}

.guest-form__header {
  margin-bottom: 16px;
}

.guest-form__title {
  font-size: var(--van-font-size-lg);
  font-weight: 700;
  color: var(--van-text-color);
}

.guest-form__buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-bottom: var(--van-safe-area-bottom);
}

.guest-form__buttons > * {
  flex: 1;
}
</style>
