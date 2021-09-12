import { createApp } from 'vue'
import App from './App.vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.less'
import i18n from './i18n'
import { store } from './store'
import router from './router'
import sites from './sites'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'

declare module 'vue' {
  export interface ComponentCustomProperties {
    $dayjs: typeof dayjs,
 }
}

const app = createApp(App)

app.use(Antd)
  .use(i18n)
  .use(store)
  .use(router)

dayjs.locale('zh-cn')
dayjs.extend(relativeTime)
app.config.globalProperties.$dayjs = dayjs

app.provide('sites', sites)

app.mount('#app')
