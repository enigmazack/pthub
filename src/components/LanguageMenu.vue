<template>
  <a-dropdown>
    <template #overlay>
      <a-menu @click="handleClick">
        <a-menu-item key="zh_CN">中文</a-menu-item>
        <a-menu-item key="en">English</a-menu-item>
      </a-menu>
    </template>
    <GlobalOutlined />
  </a-dropdown>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue'
import { GlobalOutlined } from '@ant-design/icons-vue'
import { MenuInfo } from 'ant-design-vue/lib/menu/src/interface'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import { useStore, EActions } from '@/store'

export default defineComponent({
  name: 'languageMenu',
  components: {
    GlobalOutlined
  },
  setup () {
    const store = useStore()
    const i18nLocale = useI18n().locale
    const handleClick = (e: MenuInfo) => {
      const locale = e.key as string
      store.dispatch(EActions.setLocale, { locale })
    }

    watch(
      () => store.state.uiSettings.locale,
      (newLocale) => {
        switch (newLocale) {
          case 'en':
            i18nLocale.value = 'en'
            dayjs.locale('en')
            break
          case 'zh_CN':
          default:
            i18nLocale.value = 'zh_CN'
            dayjs.locale('zh-cn')
        }
      }
    )
    return {
      handleClick
    }
  }
})
</script>
