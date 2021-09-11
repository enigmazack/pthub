<template>
  <a-row type="flex" justify="space-between">
    <a-col>
      <a-space size="middle">
        <div :style="{ fontSize: '24px', color: 'white'}">
          <MenuUnfoldOutlined v-if="collapsed" @click="toggleCollapsed"/>
          <MenuFoldOutlined v-else @click="toggleCollapsed"/>
        </div>
        <div :style="{ fontSize: '24px', color: 'white'}">PT hub</div>
      </a-space>
    </a-col>
    <a-col :pull= "2" :span="8">
      <a-input
        v-model:value="value"
        placeholder="搜索"
        size="large"
      >
      <template #addonAfter>
          <a-select style="width: 80px">
            <a-select-option value=".com">.com</a-select-option>
            <a-select-option value=".jp">.jp</a-select-option>
            <a-select-option value=".cn">.cn</a-select-option>
            <a-select-option value=".org">.org</a-select-option>
          </a-select>
        </template>
      </a-input>
    </a-col>
    <a-col>
    <a-dropdown>
      <a-button shape='circle'>
        <GlobalOutlined />
      </a-button>
    </a-dropdown>
    </a-col>
  </a-row>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { MenuUnfoldOutlined, MenuFoldOutlined, GlobalOutlined } from '@ant-design/icons-vue'
import { useStore } from '@/store'
import { EActions } from '@/store/enum'

export default defineComponent({
  name: 'appHeader',
  components: {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    GlobalOutlined
  },
  setup () {
    const store = useStore()
    const collapsed = computed(() => store.state.uiSettings.siderCollapsed)
    const toggleCollapsed = () => store.dispatch(EActions.toggleSiderCollapsed)
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
span.ant-input-group-wrapper {
  vertical-align: middle
}
</style>
