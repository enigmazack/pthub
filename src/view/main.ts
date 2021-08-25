import { createApp } from 'vue'
import App from './App.vue'
import { ElButton } from 'element-plus'

createApp(App)
  .use(ElButton)
  .mount('#app')
