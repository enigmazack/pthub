<template>
<div class="header">
  <a-row>
    <a-col :span="4" class="app_name">PT hub</a-col>
    <a-col :span="10">
      <a-input-search class="search"
        v-model:value="value"
        placeholder="input search text"
        enter-button
        size="large"
        @search="onSearch"
      />
    </a-col>
    <a-col :span="10" class="link"></a-col>
  </a-row>
</div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'header',
  data: () => {
    return {
      value: ref('')
    }
  },
  methods: {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onSearch: () => {}
  }
})
</script>

<style>
.header {
  color: white;
}
.app_name {
  font-size: 24px;
}
.search {
  margin-top: 12px;
}
</style>
