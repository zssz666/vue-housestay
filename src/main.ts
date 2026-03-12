import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

import App from './App.vue';
import router from './router';
import '@/assets/styles/main.scss';

const app = createApp(App);

// Pinia
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);

// Router
app.use(router);

// Element Plus (Full import for safety, though auto-import is configured)
// app.use(ElementPlus) // If using auto-import, we don't strictly need this, but for some global components like ElMessage it's safer if not fully relying on auto-import for everything.
// However, since we used auto-import plugin, let's stick to it. But we need to register icons globally if we use dynamic component :is="iconName".
// In my code I used <component :is="cat.icon" /> where cat.icon is the component object, so that's fine.
// But HomestayCard uses <component :is="isFavorite ? 'StarFilled' : 'Star'" /> which requires global registration or local import.
// I imported them locally in HomestayCard, but <component :is="'StringName'"> only works if registered globally.
// So I should register all icons.

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.mount('#app');
