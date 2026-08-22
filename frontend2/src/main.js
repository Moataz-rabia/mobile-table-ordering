import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(router); // Important: tells Vue to use the router instance
app.mount('#app');