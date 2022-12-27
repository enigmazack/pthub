import { createI18n } from 'vue-i18n'
import zhCN from '~/locale/zh_CN.json'
import en from '~/locale/en.json'

const i18n = createI18n({
  legacy: false,
  locale: 'zh_CN',
  fallbackLocale: 'en',
  messages: {
    zh_CN: zhCN,
    en,
  },
})

export default i18n
