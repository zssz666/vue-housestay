<template>
  <section class="hero">
    <!-- 视频背景 -->
    <div class="hero-bg">
      <video autoplay muted loop playsinline class="hero-video">
        <source src="/home.mp4" type="video/mp4" />
      </video>
      <div class="hero-overlay"></div>
    </div>

    <!-- 内容层 -->
    <div class="hero-content">
      <div class="brand-tag">民宿数字化经营平台</div>
      <h1 class="hero-title">发现独特的住宿体验</h1>
      <p class="hero-subtitle">探索精选民宿，像当地人一样旅行</p>
    </div>

    <!-- 滚动指示器 -->
    <div class="scroll-indicator" @click="scrollToContent">
      <div class="mouse">
        <div class="wheel"></div>
      </div>
      <span class="scroll-text">向下探索</span>
    </div>
  </section>
</template>

<script setup lang="ts">
const scrollToContent = () => {
  window.scrollTo({
    top: window.innerHeight,
    behavior: 'smooth'
  });
};
</script>

<style scoped lang="scss">
.hero {
  height: 100vh;
  min-height: 700px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;

  .hero-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.3) 0%,
      rgba(0, 0, 0, 0.15) 50%,
      rgba(0, 0, 0, 0.4) 100%
    );
  }
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: white;
  animation: fadeInUp 1s ease-out;
  padding: 0 24px;

  .brand-tag {
    font-size: 12px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 24px;
    font-weight: 400;
  }

  .hero-title {
    font-size: clamp(36px, 6vw, 64px);
    font-weight: 300;
    letter-spacing: 0.05em;
    margin-bottom: 16px;
    line-height: 1.2;
  }

  .hero-subtitle {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.85);
    font-weight: 300;
    letter-spacing: 0.1em;
  }
}

.scroll-indicator {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s;

  &:hover {
    opacity: 1;
  }

  .mouse {
    width: 24px;
    height: 40px;
    border: 2px solid rgba(255, 255, 255, 0.6);
    border-radius: 12px;
    position: relative;

    .wheel {
      width: 4px;
      height: 8px;
      background: white;
      border-radius: 2px;
      position: absolute;
      top: 8px;
      left: 50%;
      transform: translateX(-50%);
      animation: scrollWheel 2s infinite;
    }
  }

  .scroll-text {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    letter-spacing: 0.2em;
  }
}

@keyframes scrollWheel {
  0% {
    opacity: 1;
    top: 8px;
  }
  100% {
    opacity: 0;
    top: 20px;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .hero-content {
    .hero-title {
      font-size: 32px;
    }

    .hero-subtitle {
      font-size: 16px;
    }
  }

  .scroll-indicator {
    bottom: 32px;
  }
}
</style>
