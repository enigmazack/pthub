import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import App from './App.vue'
import i18n from './i18n'
import router from './router'
import { store } from '~/store'
import sites from '~/sites'

declare module 'vue' {
  export interface ComponentCustomProperties {
    $dayjs: typeof dayjs
  }
}

const app = createApp(App)

app.use(Antd)
app.use(store)
app.use(i18n)
app.use(router)

dayjs.locale('zh-cn')
dayjs.extend(relativeTime)
app.config.globalProperties.$dayjs = dayjs

app.provide('sites', sites)

app.mount('#app')

declare global {
  interface Window {
    sites: any
  }
}

window.sites = sites
