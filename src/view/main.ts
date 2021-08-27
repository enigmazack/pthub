import { createApp } from 'vue'
import App from './App.vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.less'
import i18n from './i18n'
import { store, key } from './store'

createApp(App)
  .use(Antd)
  .use(i18n)
  .use(store, key)
  .mount('#app')
