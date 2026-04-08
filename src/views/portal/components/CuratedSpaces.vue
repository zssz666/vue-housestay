<template>
  <section class="spaces-gallery" id="spaces" ref="sectionRef">
    <div class="section-header" :class="{ 'is-visible': isVisible }">
      <span class="section-tag">精选空间</span>
      <h2>探索独特住宿体验</h2>
      <p>旅客可通过 APP 浏览完整房源并预订</p>
    </div>

    <!-- 横向滚动展示 -->
    <div class="spaces-scroll" :class="{ 'is-visible': isVisible }">
      <div class="spaces-track">
        <div
          v-for="(space, index) in curatedSpaces"
          :key="space.id"
          class="space-card"
          :style="{ transitionDelay: `${0.2 + index * 0.1}s` }"
        >
          <div class="space-image">
            <img :src="space.image" :alt="space.name" loading="lazy" />
            <div class="space-overlay">
              <span class="space-location">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                {{ space.location }}
              </span>
            </div>
            <!-- 价格标签 -->
            <div class="price-badge">
              <span class="currency">¥</span>
              <span class="amount">{{ space.price }}</span>
              <span class="unit">/晚</span>
            </div>
          </div>
          <div class="space-info">
            <h3>{{ space.name }}</h3>
            <div class="space-meta">
              <div class="rating">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#D4A574">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span>{{ space.rating }}</span>
              </div>
              <span class="divider">·</span>
              <span class="type">{{ space.type }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const sectionRef = ref<HTMLElement>();
const isVisible = ref(false);

const curatedSpaces = [
  {
    id: 1,
    name: '洱海日出海景套房',
    location: '云南·大理',
    type: '整套民宿',
    price: 399,
    rating: 4.9,
    image: '/imgs/dali.jpg',
  },
  {
    id: 2,
    name: '西湖畔禅意小院',
    location: '浙江·杭州',
    type: '整套别墅',
    price: 999,
    rating: 4.8,
    image: '/imgs/hangzhou1.jpg',
  },
  {
    id: 3,
    name: '宽窄巷子里院',
    location: '四川·成都',
    type: '整套民居',
    price: 298,
    rating: 4.7,
    image: '/imgs/chengdu1.jpg',
  },
  {
    id: 4,
    name: '鼓浪屿老别墅',
    location: '福建·厦门',
    type: '整套别墅',
    price: 666,
    rating: 4.9,
    image: '/imgs/xiamen1.jpg',
  },
  {
    id: 5,
    name: '古城纳西庭院',
    location: '云南·丽江',
    type: '整套民居',
    price: 520,
    rating: 4.8,
    image: '/imgs/dali3.jpg',
  },
];

let observer: IntersectionObserver | null = null;

const setupObserver = () => {
  if (!sectionRef.value) return;

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isVisible.value = true;
        }
      });
    },
    { threshold: 0.1 }
  );

  observer.observe(sectionRef.value);
};

onMounted(() => {
  setupObserver();
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});
</script>

<style scoped lang="scss">
.spaces-gallery {
  padding: 120px 0;
  background: #ffffff;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
  padding: 0 24px;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);

  &.is-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .section-tag {
    display: inline-block;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: #D4A574;
    margin-bottom: 16px;
    font-weight: 500;
  }

  h2 {
    font-size: clamp(26px, 4vw, 38px);
    font-weight: 300;
    color: #1A1A1A;
    margin-bottom: 14px;
    letter-spacing: 0.01em;
  }

  p {
    font-size: 15px;
    color: #999999;
    font-weight: 400;
  }
}

// 横向滚动区域
.spaces-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: #D4A574 transparent;
  cursor: grab;
  padding-bottom: 20px;

  &:active {
    cursor: grabbing;
  }

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #D4A574;
    border-radius: 2px;
  }

  .spaces-track {
    display: flex;
    gap: 24px;
    padding: 0 48px;
    width: max-content;
  }
}

.space-card {
  width: 320px;
  border-radius: 16px;
  overflow: hidden;
  background: #fafafa;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateY(20px);

  .spaces-scroll.is-visible & {
    opacity: 1;
    transform: translateY(0);
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);

    .space-image img {
      transform: scale(1.06);
    }
  }

  .space-image {
    position: relative;
    height: 220px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s ease;
    }

    .space-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        180deg,
        transparent 50%,
        rgba(0, 0, 0, 0.5) 100%
      );
      display: flex;
      align-items: flex-end;
      padding: 16px;

      .space-location {
        display: flex;
        align-items: center;
        gap: 6px;
        color: rgba(255, 255, 255, 0.9);
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.02em;
      }
    }

    // 价格标签
    .price-badge {
      position: absolute;
      bottom: 12px;
      right: 12px;
      background: white;
      padding: 8px 14px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: baseline;
      gap: 2px;

      .currency {
        font-size: 14px;
        font-weight: 500;
        color: #D4A574;
      }

      .amount {
        font-size: 20px;
        font-weight: 600;
        color: #1A1A1A;
        line-height: 1;
      }

      .unit {
        font-size: 12px;
        color: #666;
        margin-left: 2px;
      }
    }
  }

  .space-info {
    padding: 20px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #1A1A1A;
      margin-bottom: 8px;
      letter-spacing: 0.01em;
      transition: color 0.3s;
    }

    &:hover h3 {
      color: #D4A574;
    }

    .space-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #666;

      .rating {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #1A1A1A;
        font-weight: 500;
      }

      .divider {
        color: #ccc;
      }

      .type {
        color: #999;
      }
    }
  }
}

// CTA 区域
.gallery-cta {
  text-align: center;
  margin-top: 60px;
  padding: 0 24px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.5s;

  &.is-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .cta-text {
    font-size: 14px;
    color: #666666;
    margin-bottom: 20px;
  }

  .download-btn-group {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .btn-app {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: #1A1A1A;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    svg {
      width: 18px;
      height: 18px;
    }

    &:hover {
      background: #333333;
      transform: translateY(-2px);
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .spaces-gallery {
    padding: 80px 0;
  }

  .section-header {
    margin-bottom: 40px;
  }

  .spaces-scroll .spaces-track {
    padding: 0 20px;
    gap: 16px;
  }

  .space-card {
    width: 260px;

    .space-image {
      height: 180px;
    }
  }

  .gallery-cta {
    margin-top: 40px;

    .download-btn-group {
      flex-direction: column;
      align-items: center;
    }

    .btn-app {
      width: 200px;
      justify-content: center;
    }
  }
}
</style>
