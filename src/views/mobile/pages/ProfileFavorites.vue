<template>
  <div class="tj-page tj-profile-fav-page">
    <!-- 顶部导航 -->
    <div class="tj-page__header">
      <div class="tj-page__header-left" @click="$router.back()">
        <van-icon name="arrow-left" size="20" color="#333" />
      </div>
      <span class="tj-page__header-title">我的收藏</span>
      <div class="tj-page__header-right"></div>
    </div>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="tj-profile-fav-content">
        <!-- 空状态 -->
        <div v-if="!loading && !favorites.length" class="tj-empty">
          <div class="tj-empty__icon">🤍</div>
          <div class="tj-empty__title">暂无收藏</div>
          <div class="tj-empty__desc">去首页看看心仪的民宿吧</div>
          <van-button type="primary" round size="small" class="tj-empty__btn" @click="$router.push('/')">
            去逛逛
          </van-button>
        </div>

        <!-- 收藏列表 -->
        <div v-else class="tj-profile-fav-list">
          <div
            v-for="item in favorites"
            :key="item.homestayId"
            class="tj-profile-fav-item tj-animate-in"
            @click="$router.push(`/homestay/${item.homestayId}`)"
          >
            <img :src="item.image" :alt="item.title" class="tj-profile-fav-item__img" />
            <div class="tj-profile-fav-item__info">
              <div class="tj-profile-fav-item__title">{{ item.title }}</div>
              <div class="tj-profile-fav-item__location">
                <van-icon name="location-o" size="11" color="#999" />
                {{ item.address }}
              </div>
              <div class="tj-profile-fav-item__footer">
                <div class="tj-price">
                  <span class="tj-price__symbol">¥</span>
                  <span class="tj-price__amount">{{ item.price }}</span>
                  <span class="tj-price__unit">/晚</span>
                </div>
              </div>
            </div>
            <div class="tj-profile-fav-item__remove" @click.stop="removeFav(item.homestayId)">
              <van-icon name="cross" size="14" color="#999" />
            </div>
          </div>
        </div>
      </div>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { showToast } from 'vant';
import { removeFavorite as apiRemoveFavorite } from '../api/mobileApi';

const refreshing = ref(false);
const loading = ref(false);

interface FavItem {
  homestayId: number;
  title: string;
  address: string;
  price: number;
  image: string;
}

const favorites = ref<FavItem[]>([
  { homestayId: 1, title: '春熙路近地铁轻奢两居室', address: '春熙路·近地铁站', price: 328, image: 'https://picsum.photos/375/500?random=10' },
  { homestayId: 3, title: '洱海日出·一线海景大床房', address: '洱海边·近洱海', price: 458, image: 'https://picsum.photos/375/500?random=13' },
  { homestayId: 5, title: '古城墙下现代轻奢公寓', address: '古城墙·市中心', price: 268, image: 'https://picsum.photos/375/500?random=16' },
  { homestayId: 7, title: '山谷幽居自然氧吧民宿', address: '西岭雪山·景区', price: 388, image: 'https://picsum.photos/375/500?random=19' },
]);

async function removeFav(id: number) {
  try {
    await apiRemoveFavorite(id);
    favorites.value = favorites.value.filter(f => f.homestayId !== id);
    showToast('已取消收藏');
  } catch {
    showToast('取消失败');
  }
}

async function onRefresh() {
  refreshing.value = false;
}
</script>

<style scoped lang="scss">
.tj-profile-fav-page {
  min-height: 100vh;
  background: var(--tj-bg-page);
}

.tj-page__header {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 16px;
  background: #fff;
  border-bottom: 1px solid var(--tj-border-light);
  position: sticky;
  top: 0;
  z-index: 100;
}

.tj-page__header-left,
.tj-page__header-right {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.tj-page__header-title {
  flex: 1;
  text-align: center;
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

.tj-profile-fav-content {
  padding: 12px 16px;
}

.tj-profile-fav-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tj-profile-fav-item {
  display: flex;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  position: relative;
  transition: box-shadow 0.15s;

  &:active { box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06); }
}

.tj-profile-fav-item__img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  flex-shrink: 0;
}

.tj-profile-fav-item__info {
  flex: 1;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}

.tj-profile-fav-item__title {
  font-size: 14px;
  font-weight: 500;
  color: var(--tj-text-title);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.tj-profile-fav-item__location {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  color: var(--tj-text-hint);
  margin-top: 4px;
}

.tj-profile-fav-item__footer {
  margin-top: auto;
}

.tj-profile-fav-item__remove {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.tj-empty__btn {
  margin-top: 16px;
  background: linear-gradient(135deg, #FF9645, #FF8C3B) !important;
  border: none !important;
}
</style>
