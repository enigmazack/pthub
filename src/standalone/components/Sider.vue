<script lang="ts" setup>
import { AppstoreOutlined, SearchOutlined, SettingOutlined } from '@ant-design/icons-vue'
</script>

<template>
  <a-menu mode="inline" :style="{ height: '100%', borderRight: 0 }">
    <a-menu-item key="Torrents" class="sider-menu-item">
      <template #icon>
        <SearchOutlined />
      </template>
      <router-link :to="{ path: '/torrents', query: $route.query }">
        {{ $t('menu.search') }}
      </router-link>
    </a-menu-item>
    <a-menu-item key="UserData" class="sider-menu-item">
      <template #icon>
        <AppstoreOutlined />
      </template>
      <router-link to="/userData">
        {{ $t('menu.sites') }}
      </router-link>
    </a-menu-item>
    <a-sub-menu key="Settings" class="sider-menu-item">
      <template #icon>
        <SettingOutlined />
      </template>
      <template #title>
        {{ $t('menu.settings') }}
      </template>
      <a-menu-item key="ImportSites" class="sider-menu-item">
        <router-link to="/importSites">
          {{ $t('menu.importSites') }}
        </router-link>
      </a-menu-item>
      <a-menu-item key="SiteSettings" class="sider-menu-item">
        <router-link to="/siteSettings">
          {{ $t('menu.siteSettings') }}
        </router-link>
      </a-menu-item>
    </a-sub-menu>
  </a-menu>
</template>

<style>
.sider-menu-item {
  font-size: 14px
}
</style>
