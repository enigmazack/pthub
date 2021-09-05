<template>
  <a-switch @click="toggleEnabled" :checked="checked" />
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useStore } from '../store'

export default defineComponent({
  name: 'siteSwitch',
  props: {
    site: { type: String, required: true }
  },
  setup (props) {
    const store = useStore()
    const checked = computed(() => store.state.siteData.enabled.findIndex(s => s === props.site) !== -1)
    const toggleEnabled = () => store.dispatch('toggleEnabledSite', { site: props.site })
    return {
      checked,
      toggleEnabled
    }
  }
})
</script>
