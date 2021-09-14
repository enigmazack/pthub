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
          collapsedWidth="0"
        >
          <Sider />
        </a-layout-sider>
        <a-layout :style="{ padding: '24px 24px', display: 'flex', flexDirection: 'column' }">
          <a-layout-content id="preview-content" :style="{ flex: 1, overflow: 'auto' }">
            <div class="preview-header"></div>
            <div class="preview">
              <router-view v-slot="{ Component }">
                <keep-alive include="ImportSites,UserData,Search">
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
<script lang="ts">
import { computed, defineComponent } from 'vue'
import AppHeader from './components/AppHeader.vue'
import Sider from './components/Sider.vue'
import { useStore, EActions } from './store'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import enUS from 'ant-design-vue/es/locale/en_US'
export default defineComponent({
  name: 'app',
  components: {
    AppHeader,
    Sider
  },
  setup () {
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
    store.dispatch(EActions.initSiteSettings)
    store.dispatch(EActions.initUserData)
    const collapsed = computed(() => store.state.uiSettings.siderCollapsed)
    return {
      collapsed,
      locale
    }
  }
})
</script>

<style>
.layout-base .preview {
  max-width: 1600px;
}
</style>
