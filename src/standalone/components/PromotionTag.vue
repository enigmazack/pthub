<script lang="ts" setup>
import { ETorrentPromotion } from '~/sites/enum'

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
  isTemporary: {
    type: Boolean,
    required: true,
  },
})

const prefix = props.isTemporary ? '~' : ''
const content = prefix + props.status
let color: string
switch (props.status) {
  case ETorrentPromotion.free:
  case ETorrentPromotion.doubleFree:
    color = '#2db7f5'
    break
  default:
    color = '#87d068'
    break
}
</script>

<template>
  <a-tag :color="color" class="promotion-tag">
    {{ content }}
  </a-tag>
</template>

<style>
.promotion-tag {
  padding: 0 4px;
  margin-right: 8px;
  line-height: 16px
}
</style>
