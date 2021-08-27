<template>
  <a-layout>
    <a-layout-header style="height: 64px">
      <Header />
    </a-layout-header>
    <a-layout>
      <a-layout-sider
        v-model:collapsed="collapsed"
        collapsible
        theme="light"
      >
        <Sider />
      </a-layout-sider>
      <a-layout-content>Content</a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import Header from './components/Header.vue'
import Sider from './components/Sider.vue'
export default defineComponent({
  name: 'app',
  components: {
    Header,
    Sider
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
