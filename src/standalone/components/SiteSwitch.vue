<script lang="ts" setup>
import { EActions, useStore } from '~/store'

const props = defineProps({
  site: { type: String, required: true },
})

const store = useStore()
const checked = computed(() => store.state.siteSettings.enabledSites.findIndex(s => s === props.site) !== -1)
const toggleEnabled = () => store.dispatch(EActions.toggleEnabledSite, { site: props.site })
</script>

<template>
  <a-switch :checked="checked" @click="toggleEnabled" />
</template>
