<template>
  <a-menu theme="light">
    <a-menu-item key="1">
      <template #icon>
        <SearchOutlined />
      </template>
      {{ $t('menu.search') }}
    </a-menu-item>
  </a-menu>
</template>

<script lang="ts">
import { SearchOutlined } from '@ant-design/icons-vue'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'sider',
  components: {
    SearchOutlined
  }
})
</script>
