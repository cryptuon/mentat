import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';
import App from './App.vue';
import router from './router';
import { walletPlugin } from './plugins/wallet';

const app = createApp(App);

app.use(createPinia());
app.use(VueQueryPlugin);
app.use(router);
app.use(walletPlugin, {
  autoConnect: true,
});

app.mount('#app');
