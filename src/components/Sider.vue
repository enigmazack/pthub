<template>
  <a-menu mode="inline" :style="{ height: '100%', borderRight: 0 }">
    <a-menu-item key="Search">
      <template #icon>
        <SearchOutlined />
      </template>
      <router-link to="/search">{{ $t('menu.search') }}</router-link>
    </a-menu-item>
    <a-menu-item key="UserData">
      <template #icon>
        <AppstoreOutlined />
      </template>
      <router-link to="/userData">{{ $t('menu.sites') }}</router-link>
    </a-menu-item>
    <a-sub-menu key="Settings">
      <template #icon>
        <SettingOutlined />
      </template>
      <template #title>{{ $t('menu.settings') }}</template>
      <a-menu-item key="ImportSites">
        <router-link to="/importSites">{{ $t('menu.importSites') }}</router-link>
      </a-menu-item>
      <a-menu-item key="SiteSettings">
        <router-link to="/siteSettings">{{ $t('menu.siteSettings') }}</router-link>
      </a-menu-item>
      <a-menu-item key="SearchSolutions">{{ $t('menu.searchSolutions') }}</a-menu-item>
    </a-sub-menu>
  </a-menu>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { SearchOutlined, AppstoreOutlined, SettingOutlined } from '@ant-design/icons-vue'

export default defineComponent({
  name: 'sider',
  components: {
    SearchOutlined,
    AppstoreOutlined,
    SettingOutlined
  }
})
</script>
