<template>
  <div class="tj-page tj-favorites-page">
    <div class="tj-page__header">
      <div class="tj-page__header-left" @click="$router.back()">
        <van-icon name="arrow-left" size="20" color="#333" />
      </div>
      <span class="tj-page__header-title">我的收藏</span>
      <div class="tj-page__header-right"></div>
    </div>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="favorites-content">
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
        <div v-else class="favorites-list">
          <div
            v-for="item in favorites"
            :key="item.homestayId"
            class="tj-home-card tj-animate-in"
            @click="$router.push(`/homestay/${item.homestayId}`)"
          >
            <div class="tj-home-card__img-wrap">
              <img :src="item.image" :alt="item.title" class="tj-home-card__img" loading="lazy" />
              <div class="tj-home-card__fav is-fav" @click.stop="removeFavorite(item.homestayId)">
                <van-icon name="star" color="#FF9645" size="15" />
              </div>
            </div>
            <div class="tj-home-card__body">
              <div class="tj-home-card__type" v-if="item.roomType">{{ item.roomType }}</div>
              <div class="tj-home-card__title">{{ item.title }}</div>
              <div class="tj-home-card__location">
                <van-icon name="location-o" size="11" color="#999" />
                {{ item.address }}
              </div>
              <div class="tj-home-card__footer">
                <div class="tj-price">
                  <span class="tj-price__symbol">¥</span>
                  <span class="tj-price__amount">{{ item.price }}</span>
                  <span class="tj-price__unit">/晚</span>
                </div>
              </div>
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

interface FavoriteItem {
  homestayId: number;
  title: string;
  address: string;
  price: number;
  image: string;
  roomType?: string;
}

const favorites = ref<FavoriteItem[]>([
  {
    homestayId: 1,
    title: '春熙路近地铁轻奢两居室',
    address: '春熙路·近地铁站',
    price: 328,
    image: 'https://picsum.photos/375/500?random=10',
    roomType: '整套出租',
  },
  {
    homestayId: 3,
    title: '洱海日出·一线海景大床房',
    address: '洱海边·近洱海',
    price: 458,
    image: 'https://picsum.photos/375/500?random=13',
    roomType: '独立房间',
  },
  {
    homestayId: 5,
    title: '古城墙下现代轻奢公寓',
    address: '古城墙·市中心',
    price: 268,
    image: 'https://picsum.photos/375/500?random=16',
    roomType: '整套出租',
  },
]);

async function removeFavorite(id: number) {
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
.tj-favorites-page {
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

.favorites-content {
  padding: 12px 16px;
}

.favorites-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.tj-empty__btn {
  margin-top: 16px;
  background: linear-gradient(135deg, #FF9645, #FF8C3B) !important;
  border: none !important;
}

.tj-home-card__img-wrap {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #F0F0F0;
}

.tj-home-card__img-wrap::before {
  content: '';
  display: block;
  padding-top: 133.33%;
}

.tj-home-card__img {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
}

.tj-home-card__fav {
  position: absolute;
  top: 8px; right: 8px;
  z-index: 2;
  width: 30px; height: 30px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);

  &:active { transform: scale(1.2); }
}

.tj-home-card__body { padding: 10px 11px 12px; }

.tj-home-card__type {
  display: inline-block;
  font-size: 10px;
  color: var(--tj-text-hint);
  background: var(--tj-bg-hover);
  padding: 2px 5px;
  border-radius: 2px;
  margin-bottom: 5px;
}

.tj-home-card__title {
  font-size: 15px;
  font-weight: 500;
  color: var(--tj-text-title);
  line-height: 1.4;
  margin-bottom: 5px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  min-height: 2.8em;
}

.tj-home-card__location {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  color: var(--tj-text-hint);
  margin-bottom: 7px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tj-home-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
</style>
