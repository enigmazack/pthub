<template>
  <a-layout>
    <Header />
    <a-layout>
      <Sider />
      <a-layout-content></a-layout-content>
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
