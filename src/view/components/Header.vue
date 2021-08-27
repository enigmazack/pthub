<template>
<a-layout-header style="height: 64px">
  <a-row>
    <a-col :span="1">
      <a-button @click="toggleCollapsed">
        <MenuUnfoldOutlined v-if="collapsed" />
        <MenuFoldOutlined v-else />
      </a-button>
    </a-col>
    <a-col :span="4" class="app_name">
      PT hub
    </a-col>
    <a-col :span="9">
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
</a-layout-header>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue'
import { useStore } from '../store'

export default defineComponent({
  name: 'header',
  components: {
    MenuUnfoldOutlined,
    MenuFoldOutlined
  },
  setup () {
    const store = useStore()
    return {
      collapsed: computed(() => store.state.collapsed),
      toggleCollapsed: () => store.commit('toggleCollapsed')
    }
  },
  data () {
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
.app_name {
  font-size: 24px;
  color: white;
}
.search {
  margin-top: 12px;
}
</style>
