<template>
  <a-layout class="layout-base" :style="{ height: '100vh' }">
    <a-layout-header class="header" :style="{ padding: '0px 20px' }">
      <AppHeader />
    </a-layout-header>
    <a-layout>
      <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible collapsedWidth="0">
        <Sider />
      </a-layout-sider>
      <a-layout :style="{ padding: '24px 24px', display: 'flex', flexDirection: 'column' }">
        <a-layout-content id="preview-content" :style="{ flex: 1, overflow: 'auto' }">
          <div class="preview-header">
          </div>
          <div class="preview">
            <router-view v-slot="{ Component }">
              <keep-alive>
                <component :is="Component" />
              </keep-alive>
            </router-view>
          </div>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
</template>
<script lang="ts">
import { computed, defineComponent } from 'vue'
import AppHeader from './components/AppHeader.vue'
import Sider from './components/Sider.vue'
import { useStore } from './store'
import { EActions } from '@/store/enum'
export default defineComponent({
  name: 'app',
  components: {
    AppHeader,
    Sider
  },
  setup () {
    const store = useStore()
    // get state from extention's local storage
    store.dispatch(EActions.initUiSettings)
    store.dispatch(EActions.initSiteData)
    const collapsed = computed(() => store.state.uiSettings.siderCollapsed)
    return {
      collapsed
    }
  }
})
</script>

<style>
.layout-base .preview {
    max-width: 1600px;
}
</style>
