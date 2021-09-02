<template>
  <a-row>
    <a-col :span="1">
      <a-button @click="toggleCollapsed" shape='circle' :style="{marginLeft: '10px'}">
        <MenuUnfoldOutlined v-if="collapsed" />
        <MenuFoldOutlined v-else />
      </a-button>
    </a-col>
    <a-col :span="4" class="app_name">
      PT hub
    </a-col>
    <a-col :span="9">
    <div style="margin-top: 12px">
    <a-input-group compact>
      <a-select v-model:value="value2" size='large'>
        <a-select-option value="Option1">Option1</a-select-option>
        <a-select-option value="Option2">Option2</a-select-option>
      </a-select>
      <a-input-search
        style="width: 80%"
        size='large'
        v-model:value="value"
        placeholder="input search text"
        enter-button
        @search="onSearch"
      />
    </a-input-group>
    </div>
    </a-col>
    <a-col :span="10"></a-col>
  </a-row>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue'
import { useStore } from '../store'

export default defineComponent({
  name: 'appHeader',
  components: {
    MenuUnfoldOutlined,
    MenuFoldOutlined
  },
  setup () {
    const store = useStore()
    const collapsed = computed(() => store.state.trigger.collapsed)
    const toggleCollapsed = () => store.commit('toggleCollapsed')
    return {
      collapsed,
      toggleCollapsed
    }
  },
  data () {
    return {
      value: ref(''),
      value2: ref('')
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
