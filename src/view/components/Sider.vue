<template>
  <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible>
    <a-menu theme="dark">
      <a-menu-item key="1">
        <template #icon>
          <SearchOutlined />
        </template>
        {{ $t('menu.search') }}
      </a-menu-item>
      <a-menu-item key="2">
        <template #icon>
          <AppstoreOutlined />
        </template>
        {{ $t('menu.sites') }}
      </a-menu-item>
    </a-menu>
  </a-layout-sider>
</template>

<script lang="ts">
import { SearchOutlined, AppstoreOutlined } from '@ant-design/icons-vue'
import { computed, defineComponent } from 'vue'
import { useStore } from '../store'

export default defineComponent({
  name: 'sider',
  components: {
    SearchOutlined,
    AppstoreOutlined
  },
  setup () {
    const store = useStore()
    return {
      collapsed: computed(() => store.state.collapsed)
    }
  }
})
</script>
