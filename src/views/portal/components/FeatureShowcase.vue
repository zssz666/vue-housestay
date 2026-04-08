<template>
  <section class="showcase" id="showcase" ref="sectionRef">
    <div class="container">
      <!-- 左侧：大标题 -->
      <div class="showcase-header" :class="{ 'is-visible': isVisible }">
        <h2>为民宿经营提供的<br />完整数字基础设施</h2>
        <p class="subtitle">从房源发布到资金结算，一站式解决方案</p>
      </div>

      <!-- 右侧/下方：4 列能力展示 -->
      <div class="capabilities">
        <div
          v-for="(cap, index) in capabilities"
          :key="cap.title"
          class="cap-item"
          :class="{ 'is-visible': isVisible }"
          :style="{ transitionDelay: `${0.1 + index * 0.1}s` }"
        >
          <div class="cap-icon">
            <component :is="cap.icon" />
          </div>
          <h3>{{ cap.title }}</h3>
          <p>{{ cap.desc }}</p>
        </div>
      </div>

      <!-- 底部：实时数据条 -->
      <div class="live-stats" :class="{ 'is-visible': isVisible }">
        <div class="stat" v-for="stat in stats" :key="stat.label">
          <span class="stat-num">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, shallowRef, h } from 'vue';

const sectionRef = ref<HTMLElement>();
const isVisible = ref(false);

// SVG 图标组件
const ManagementIcon = shallowRef({
  render: () => h('svg', {
    width: 32, height: 32, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5'
  }, [
    h('rect', { x: 3, y: 4, width: 18, height: 18, rx: 2 }),
    h('path', { d: 'M16 2v4M8 2v4M3 10h18' }),
    h('path', { d: 'M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01' }),
  ])
});

const WalletIcon = shallowRef({
  render: () => h('svg', {
    width: 32, height: 32, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5'
  }, [
    h('rect', { x: 1, y: 4, width: 22, height: 16, rx: 2 }),
    h('path', { d: 'M1 10h22' }),
    h('circle', { cx: 18, cy: 15, r: 2 }),
  ])
});

const TrendChartsIcon = shallowRef({
  render: () => h('svg', {
    width: 32, height: 32, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5'
  }, [
    h('path', { d: 'M3 3v18h18' }),
    h('path', { d: 'M18 9l-5 5-4-4-3 3' }),
  ])
});

const ServiceIcon = shallowRef({
  render: () => h('svg', {
    width: 32, height: 32, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5'
  }, [
    h('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' }),
  ])
});

const capabilities = [
  { icon: ManagementIcon, title: '智能房态', desc: '多平台库存实时同步，超售预警' },
  { icon: WalletIcon, title: '资金托管', desc: 'T+1 自动结算，流水清晰透明' },
  { icon: TrendChartsIcon, title: '数据洞察', desc: '入住率分析，定价策略建议' },
  { icon: ServiceIcon, title: '运营支持', desc: '专业客服团队 7×24 小时响应' },
];

const stats = [
  { value: '10,000+', label: '精品房源' },
  { value: '200+', label: '覆盖城市' },
  { value: '99.9%', label: '系统稳定性' },
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
    { threshold: 0.15 }
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
.showcase {
  padding: 140px 0;
  background: #FAFAFA;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 48px;
}

// 大标题
.showcase-header {
  margin-bottom: 80px;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);

  &.is-visible {
    opacity: 1;
    transform: translateY(0);
  }

  h2 {
    font-size: clamp(28px, 4vw, 44px);
    font-weight: 300;
    color: #1A1A1A;
    line-height: 1.3;
    letter-spacing: 0.01em;
    margin-bottom: 20px;
  }

  .subtitle {
    font-size: 16px;
    color: #666666;
    font-weight: 400;
  }
}

// 能力网格
.capabilities {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 48px;
  margin-bottom: 80px;
}

.cap-item {
  opacity: 0;
  transform: translateY(24px);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);

  &.is-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .cap-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: rgba(26, 26, 26, 0.05);
    color: rgba(26, 26, 26, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    transition: all 0.3s;
  }

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1A1A1A;
    margin-bottom: 10px;
    letter-spacing: 0.01em;
  }

  p {
    font-size: 14px;
    color: #666666;
    line-height: 1.6;
    font-weight: 400;
  }

  &:hover .cap-icon {
    background: linear-gradient(135deg, #D4A574 0%, #C9956A 100%);
    color: #ffffff;
  }
}

// 实时数据条
.live-stats {
  display: flex;
  gap: 64px;
  padding: 32px 0;
  border-top: 1px solid rgba(26, 26, 26, 0.08);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s;

  &.is-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .stat-num {
      font-size: 28px;
      font-weight: 600;
      color: #1A1A1A;
      letter-spacing: -0.02em;
    }

    .stat-label {
      font-size: 13px;
      color: #999999;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
  }
}

// 响应式
@media (max-width: 1024px) {
  .capabilities {
    grid-template-columns: repeat(2, 1fr);
    gap: 40px;
  }
}

@media (max-width: 768px) {
  .showcase {
    padding: 80px 0;
  }

  .container {
    padding: 0 24px;
  }

  .showcase-header {
    margin-bottom: 56px;
  }

  .capabilities {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }

  .cap-item {
    .cap-icon {
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    h3 {
      font-size: 16px;
    }
  }

  .live-stats {
    flex-direction: column;
    gap: 32px;
    padding: 24px 0;

    .stat {
      .stat-num {
        font-size: 24px;
      }
    }
  }
}
</style>
