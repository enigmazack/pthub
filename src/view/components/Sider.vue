<template>
  <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible>
    <a-menu theme="light">
      <a-menu-item key="1">
        <template #icon>
          <SearchOutlined />
        </template>
        {{ $t('menu.search') }}
      </a-menu-item>
    </a-menu>
  </a-layout-sider>
</template>

<script lang="ts">
import { SearchOutlined } from '@ant-design/icons-vue'
import { computed, defineComponent } from 'vue'
import { useStore } from '../store'

export default defineComponent({
  name: 'sider',
  components: {
    SearchOutlined
  },
  setup () {
    const store = useStore()
    return {
      collapsed: computed(() => store.state.collapsed)
    }
  }
})
</script>
