import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/es/components/icon/style/css'

import vueAspectCropper from "@/components/index";

const app = createApp(App);

app.use(vueAspectCropper);
app.use(ElementPlus)
app.mount('#app')
