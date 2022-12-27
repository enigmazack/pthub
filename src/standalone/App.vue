<script lang="ts" setup>
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import enUS from 'ant-design-vue/es/locale/en_US'
import { EActions, useStore } from '~/store'
import type { Sites } from '~/sites'

const sites = inject('sites') as Sites
const siteList = Object.keys(sites)
const store = useStore()
const locale = computed(() => {
  const slocale = store.state.uiSettings.locale
  switch (slocale) {
    case 'en':
      return enUS
    case 'zh_CN':
    default:
      return zhCN
  }
})
// get state from extention's local storage
store.dispatch(EActions.initUiSettings)
store.dispatch(EActions.initSiteSettings, { siteList })
store.dispatch(EActions.initUserData, { siteList })

watch(() => store.state.siteSettings.timeout, (newTimeout) => {
  Object.keys(sites).forEach((siteKey) => {
    sites[siteKey].setTimeout(newTimeout)
  })
})

const collapsed = computed(() => store.state.uiSettings.siderCollapsed)
</script>

<template>
  <a-config-provider :locale="locale">
    <a-layout class="layout-base" :style="{ height: '100vh' }">
      <a-layout-header class="header" :style="{ padding: '0px 20px' }">
        <AppHeader />
      </a-layout-header>
      <a-layout>
        <a-layout-sider
          v-model:collapsed="collapsed"
          :trigger="null"
          collapsible
          collapsed-width="0"
        >
          <Sider />
        </a-layout-sider>
        <a-layout :style="{ padding: '24px 24px', display: 'flex', flexDirection: 'column' }">
          <a-layout-content id="preview-content" :style="{ flex: 1, overflow: 'auto' }">
            <div class="preview-header" />
            <div class="preview">
              <router-view v-slot="{ Component }">
                <keep-alive include="importSites,userData,torrents">
                  <component :is="Component" />
                </keep-alive>
              </router-view>
            </div>
          </a-layout-content>
        </a-layout>
      </a-layout>
    </a-layout>
  </a-config-provider>
</template>

<style>
.layout-base .preview {
  max-width: 1600px;
}
.compact-table .ant-table-thead > tr > th,
.compact-table .ant-table-tbody > tr > td {
  padding: 10px 6px;
}
.compact-table .ant-table-thead .ant-table-column-sorter {
  display:none;
}
</style>
