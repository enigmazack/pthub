<template>
  <a-tag :color="color" @click="handleClick()" class="searching-tag">
    <div :style="{ display: 'flex', alignItems: 'center' }">
      <a-img :src="sites[siteKey].icon.href" height="16px" width="16px" class="searching-tag-icon" />
      {{ sites[siteKey].name }}
      <LoadingOutlined v-if="status===ESiteStatus.connecting" class="searching-tag-status" />
      <div v-if="status===ESiteStatus.succeed" class="searching-tag-status">
        {{ torrentCounts }}
      </div>
    </div>
  </a-tag>
</template>

<script lang="ts">
import { computed, defineComponent, inject } from 'vue'
import { ESiteStatus, Sites } from '@/sites'
import { LoadingOutlined } from '@ant-design/icons-vue'

export default defineComponent({
  name: 'searchingTag',
  components: {
    LoadingOutlined
  },
  props: {
    siteKey: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true
    },
    torrentCounts: {
      type: Number
    },
    isFilterSite: {
      type: Boolean
    }
  },
  emits: [
    'retrySearching',
    'toggleFilterSite'
  ],
  setup (props, context) {
    const sites = inject('sites') as Sites
    // set color
    const color = computed(() => {
      let color = ''
      switch (props.status) {
        case ESiteStatus.connecting:
          color = 'blue'
          break
        case ESiteStatus.timeout:
        case ESiteStatus.searchFailed:
          color = 'red'
          break
        case ESiteStatus.succeed:
          color = props.isFilterSite ? 'darkgreen' : 'green'
          break
        case ESiteStatus.unknow:
        default:
          color = 'gray'
          break
      }
      return color
    })

    // click action
    const handleClick = () => {
      if (
        props.status === ESiteStatus.timeout ||
        props.status === ESiteStatus.error ||
        props.status === ESiteStatus.unknow
      ) {
        context.emit('retrySearching')
      } else if (props.status === ESiteStatus.succeed) {
        context.emit('toggleFilterSite')
      }
    }

    return {
      color,
      sites,
      ESiteStatus,
      handleClick
    }
  }
})
</script>

<style>
.searching-tag {
  cursor: pointer;
}
.searching-tag-icon {
  margin-right: 8px;
}
.searching-tag-status {
  color: blue;
  margin-left: 8px;
}
</style>
