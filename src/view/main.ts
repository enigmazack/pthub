import { createApp } from 'vue'
import App from './App.vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import { createI18n } from 'vue-i18n'
import zhCN from '../locale/zh_CN.json'
import en from '../locale/en.json'

const i18n = createI18n({
  locale: 'zh_CN',
  fallbackLocale: 'en',
  messages: {
    zh_CN: zhCN,
    en
  }
})

createApp(App)
  .use(i18n)
  .use(Antd)
  .mount('#app')
