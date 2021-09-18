<template>
  <a-space direction="vertical" align="center" :size="1">
    <a-avatar size="small" :src="avatarSrc" />
    <a :href="siteUrl" target="_blank" :style="{ fontSize: '12px' }">{{ siteName }}</a>
  </a-space>
</template>

<script lang="ts">
import { Sites } from '@/sites'
import { defineComponent, inject } from 'vue'

export default defineComponent({
  name: 'siteIcon',
  props: {
    siteKey: {
      type: String,
      required: true
    }
  },
  setup (props) {
    const sites = inject('sites') as Sites
    const site = sites[props.siteKey]
    const avatarSrc = site.icon.href
    const siteUrl = site.url.href
    const siteName = site.name

    return {
      avatarSrc,
      siteUrl,
      siteName
    }
  }
})
</script>
