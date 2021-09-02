<template>
  <a-layout>
    <AppHeader />
    <a-layout>
      <Sider />
      <a-layout-content>
        <ImportSites />
        <ImportSites />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import AppHeader from './components/AppHeader.vue'
import Sider from './components/Sider.vue'
import ImportSites from './routerViews/ImportSites.vue'
export default defineComponent({
  name: 'app',
  components: {
    AppHeader,
    Sider,
    ImportSites
  },
  data: () => {
    return {
      collapsed: false
    }
  }
})
</script>

<style>
</style>
