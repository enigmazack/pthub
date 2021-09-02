<template>
  <a-menu theme="dark" mode="inline" :style="{ marginTop: '64px' }">
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
    <a-sub-menu key="sub1">
      <template #icon>
        <SettingOutlined />
      </template>
      <template #title>{{ $t('menu.setting') }}</template>
      <a-menu-item key="3">{{ $t('menu.batchSearchSetting') }}</a-menu-item>
      <a-menu-item key="4">{{ $t('menu.customSearchSetting') }}</a-menu-item>
      <a-menu-item key="5">{{ $t('menu.addSite') }}</a-menu-item>
    </a-sub-menu>
  </a-menu>
</template>

<script lang="ts">
import { SearchOutlined, AppstoreOutlined, SettingOutlined } from '@ant-design/icons-vue'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'sider',
  components: {
    SearchOutlined,
    AppstoreOutlined,
    SettingOutlined
  }
})
</script>
