<template>
  <a-tag :color="color" class="promotion-tag">
    {{ content }}
  </a-tag>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ETorrentPromotion } from '@/sites/enum'

export default defineComponent({
  name: 'promotionTag',
  props: {
    status: {
      type: String,
      required: true
    },
    isTemporary: {
      type: Boolean,
      required: true
    }
  },
  setup (props) {
    const prefix = props.isTemporary ? '~' : ''
    const content = prefix + props.status
    let color
    switch (props.status) {
      case ETorrentPromotion.free:
      case ETorrentPromotion.doubleFree:
        color = '#2db7f5'
        break
      default:
        color = '#87d068'
        break
    }

    return {
      content,
      color
    }
  }
})
</script>

<style>
.promotion-tag {
  padding: 0 4px;
  margin-right: 8px;
  line-height: 16px
}
</style>
