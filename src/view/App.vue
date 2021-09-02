<template>
  <a-layout>
    <a-layout-header :style="{ position: 'fixed', zIndex: 1, width: '100%' }">
      <AppHeader />
    </a-layout-header>
    <a-layout>
      <a-layout-sider
        v-model:collapsed="collapsed"
        :trigger="null"
        collapsible
        collapsedWidth=0
        :style="{ overflow: 'auto', height: '100vh', position: 'sticky', top: 0 }"
      >
        <Sider />
      </a-layout-sider>
      <a-layout-content
        :style="{
          padding: '24px 24px',
          marginTop: '64px'
        }"
      >
        <ImportSites />
        <ImportSites />
      </a-layout-content>
      </a-layout>
    </a-layout>
</template>
<script lang="ts">
import { computed, defineComponent } from 'vue'
import AppHeader from './components/AppHeader.vue'
import Sider from './components/Sider.vue'
import ImportSites from './routerViews/ImportSites.vue'
import { useStore } from './store'
export default defineComponent({
  name: 'app',
  components: {
    AppHeader,
    Sider,
    ImportSites
  },
  setup () {
    const store = useStore()
    return {
      collapsed: computed(() => store.state.trigger.collapsed)
    }
  }
})
</script>

<style>
</style>
