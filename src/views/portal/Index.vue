<template>
  <div class="portal-index">
    <!-- 首屏 Hero 区域 -->
    <HeroSection />

    <!-- 平台能力展示 -->
    <FeatureShowcase />

    <!-- 精选房源展示 -->
    <CuratedSpaces />

    <!-- 经营者入口 -->
    <OperatorEntry />

    <!-- 页脚 -->
    <PortalFooter />
  </div>
</template>

<script setup lang="ts">
import HeroSection from './components/HeroSection.vue';
import FeatureShowcase from './components/FeatureShowcase.vue';
import CuratedSpaces from './components/CuratedSpaces.vue';
import OperatorEntry from './components/OperatorEntry.vue';
import PortalFooter from './components/PortalFooter.vue';
</script>

<style scoped lang="scss">
.portal-index {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
