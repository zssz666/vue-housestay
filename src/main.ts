import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { isMobileDevice } from '@/utils/device';

async function bootstrap() {
  if (isMobileDevice()) {
    const MobileApp = (await import('@/views/mobile/App.vue')).default;
    const mobileRouter = (await import('@/views/mobile/router')).default;
    const pinia = createPinia();
    pinia.use(piniaPluginPersistedstate);
    createApp(MobileApp).use(pinia).use(mobileRouter).mount('#app');
    return;
  }

  const App = (await import('./App.vue')).default;
  const router = (await import('./router')).default;

  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);

  const app = createApp(App);
  app.use(pinia);
  app.use(router);

  app.use(ElementPlus, { locale: zhCn });

  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
  }

  app.mount('#app');
}

bootstrap();
