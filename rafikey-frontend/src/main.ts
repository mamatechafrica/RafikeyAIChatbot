import './assets/main.css'
import './assets/material-icons/material-icons.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueSweetalert2 from  'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

import App from './App.vue'
import router from './router'
import { useDark } from '@vueuse/core'

useDark()

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueSweetalert2)

app.mount('#app')
